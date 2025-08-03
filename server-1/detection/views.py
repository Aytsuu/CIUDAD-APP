from django.views import View
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
from supabase import create_client
from rest_framework.views import APIView
# from facenet_pytorch import MTCNN, InceptionResnetV1
# import torch
import base64
import io
from PIL import Image
import json
import numpy as np

@method_decorator(csrf_exempt, name='dispatch')
class FaceDetectionView(APIView):
    def __init__(self):
        self.supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        # self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        # self.mtcnn = MTCNN(keep_all=True, device=self.device)
        # self.resnet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
    
    def post(self, request):
        image_data = request.data.get('image')
        if not image_data:
            return JsonResponse({'error': 'No image provided'}, status=400)

        supabase_id = request.data.get('id')
         
        # Process in background (use Celery in production)
        self.process_image(image_data, supabase_id)
        
        return JsonResponse({
          'id': supabase_id,
          'status': 'processing'
        })

    def check_facial_features_visible(self, image, box, landmarks):
        """Strictly check if eyes, nose and mouth are all visible and unobstructed"""
        try:
            # Landmarks format from MTCNN:
            # [left_eye, right_eye, nose, mouth_left, mouth_right]
            
            # Check if we have all required landmarks
            if len(landmarks) < 5:
                return False
            print(landmarks)
            left_eye = landmarks[0]
            right_eye = landmarks[1]
            nose = landmarks[2]
            mouth_left = landmarks[3]
            mouth_right = landmarks[4]
            mouth_center = ((mouth_left[0] + mouth_right[0])/2, 
                (mouth_left[1] + mouth_right[1])/2)
            
            # Convert box coordinates to integers
            x1, y1, x2, y2 = [int(coord) for coord in box]
            
            # Crop face region
            face_img = image.crop((x1, y1, x2, y2))
            face_img_gray = face_img.convert('L')
            face_array = np.array(face_img_gray)
            
            # 1. Check each feature's visibility by examining the region around it
            def check_feature_visible(feature_point, size_ratio=0.20, is_mouth=False):
                """Check if a feature point has sufficient contrast in its vicinity"""
                face_width = x2 - x1
                region_size = int(face_width * size_ratio)
                
                # Get coordinates relative to face image
                fx, fy = int(feature_point[0] - x1), int(feature_point[1] - y1)
                
                # Define region bounds
                x_start = max(0, fx - region_size//2)
                x_end = min(face_array.shape[1], fx + region_size//2)
                y_start = max(0, fy - region_size//2)
                y_end = min(face_array.shape[0], fy + region_size//2)
                
                if x_start >= x_end or y_start >= y_end:
                    return False
                    
                # Extract region
                region = face_array[y_start:y_end, x_start:x_end]
                
                # Calculate variance (measure of texture/visibility)
                if region.size == 0:
                    return False
                    
                variance = np.var(region)
                threshold = 200 if is_mouth else 500
                print(variance)
                return variance > threshold  # Empirical threshold, adjust as needed
            
            # Check all critical features
            eyes_visible = check_feature_visible(left_eye) and check_feature_visible(right_eye)
            nose_visible = check_feature_visible(nose)
            mouth_visible = (check_feature_visible(mouth_left, is_mouth=True) and 
                            check_feature_visible(mouth_right, is_mouth=True) and
                            check_feature_visible(mouth_center, is_mouth=True))
            
            print("\nVisible Eyes:", eyes_visible)
            print("Visible Nose:", nose_visible)
            print("Visible Mouth:", mouth_visible)

            if not (eyes_visible and nose_visible and mouth_visible):
                return False
            
            # 2. Additional geometric checks
            def distance(p1, p2):
                return ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)**0.5
                
            eye_dist = distance(left_eye, right_eye)
            eye_nose_dist = (distance(left_eye, nose) + distance(right_eye, nose)) / 2
            nose_mouth_dist = (distance(nose, mouth_left) + distance(nose, mouth_right)) / 2
            
            # Validate normal facial proportions
            nose_eye_ratio = eye_nose_dist / eye_dist
            mouth_nose_ratio = nose_mouth_dist / eye_dist
            
            if not (0.5 < nose_eye_ratio < 1.5):
                return False
            if not (0.3 < mouth_nose_ratio < 1.0):
                return False
                
            # Mouth width check
            mouth_width = distance(mouth_left, mouth_right)
            if not (0.5 < mouth_width/eye_dist < 1.5):
                return False
                
            return True
            
        except Exception as e:
            print(f"Error checking facial features: {e}")
            return False

    def process_image(self, image_data, supabase_id):
        try:
            image = Image.open(io.BytesIO(base64.b64decode(image_data)))
            # Get both boxes and landmarks from MTCNN
            boxes, probs, landmarks = self.mtcnn.detect(image, landmarks=True)
            
            if boxes is None or len(boxes) == 0:
                # No faces detected
                update_data = {
                    'status': 'rejected',
                    'faces_detected': 0,
                    'rejection_reason': 'No face detected in the image'
                }
            elif len(boxes) > 1:
                # Multiple faces detected
                update_data = {
                    'status': 'rejected',
                    'faces_detected': len(boxes),
                    'rejection_reason': 'Multiple faces detected - only single face images are accepted'
                }
            else:
                # Single face detected - check quality
                if self.check_facial_features_visible(image, boxes[0], landmarks[0]):
                    # Process the single valid face
                    faces = self.mtcnn(image)
                    embeddings = self.resnet(faces.to(self.device)).detach().cpu().numpy()
                    
                    update_data = {
                        'status': 'processed',
                        'faces_detected': 1,
                        'embeddings': json.dumps(embeddings.tolist()),
                        'face_box': json.dumps(boxes[0].tolist()),
                        'quality_score': float(probs[0]) if probs is not None else None,
                        'rejection_reason': None
                    }
                else:
                    update_data = {
                        'status': 'rejected',
                        'faces_detected': 1,
                        'rejection_reason': 'Facial features (eyes, nose, or mouth) not all clearly visible'
                    }

            self.supabase.table('face_detection_request') \
                .update(update_data) \
                .eq('id', supabase_id) \
                .execute()
                
        except Exception as e:
            self.supabase.table('face_detection_request') \
                .update({'status': 'error', 'error_message': str(e)}) \
                .eq('id', supabase_id) \
                .execute()