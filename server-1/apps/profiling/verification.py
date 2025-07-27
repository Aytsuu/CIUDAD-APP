import cv2
import pytesseract
import numpy as np
from PIL import Image
import io
import re
import logging  
import torch
import base64
from django.core.files.base import ContentFile
from django.conf import settings
from utils.supabase_client import supabase
from dateutil.parser import parse
from datetime import datetime
from facenet_pytorch import MTCNN, InceptionResnetV1

logger = logging.getLogger(__name__)

class KYCVerificationProcessor:
    def __init__(self):
        self.mtcnn = MTCNN(
            keep_all=True,
            thresholds=[0.5, 0.6, 0.7],  # detection thresholds
        )
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval()
        self.threshold = 0.5

    def process_kyc_document_matching(self, user_data, id_image, kyc_id):
        try:
            print(kyc_id)
            print(user_data)

            # Convert Django InMemoryUploadedFile to OpenCV image
            validated_img = ContentFile(base64.b64decode(id_image))
            id_image_cv = self._file_to_cv2(validated_img)

            # Check if face is visible in the ID
            decoded_id_img = self._decode_image(id_image)
            id_face = self._face_embedding(decoded_id_img)

            # Extract and verify document information
            doc_info = self._extract_document_info(id_image_cv)
            if not doc_info:
                return {'verified': False, 'reason': 'No text extracted from document'}

            personal_info = self._extract_personal_info(doc_info)
            if not personal_info:
                return {'verified': False, 'reason': 'No personal information extracted from text'}

            info_match = self._verify_info_match(user_data, personal_info)
            if not info_match['match']:
                return {'verified': False, 'reason': f"Information mismatch: {info_match['mismatches']}"}
        
            update_data = {
                'document_info_match': True,
                'id_has_face': True if id_face is not None else False,
                'id_face_embedding': self._tensor_to_storage(id_face) if id_face is not None else None
            }

            supabase.table('kyc_record') \
                .update(update_data) \
                .eq('kyc_id', kyc_id) \
                .execute()
            
            return {
                'name': f'{user_data['lname'].upper(), user_data['fname'].upper()}',
                'id_has_face': True if id_face is not None else False,
                'info_match': info_match['match'],
            }

        except Exception as e:
            supabase.table('kyc_record') \
                .update({'document_info_match' : False}) \
                .eq('kyc_id', kyc_id) \
                .execute()

            logger.error(f"KYC verification error: {str(e)}")
            return {'verified': False, 'reason': f'Processing error: {str(e)}'}
    
    def process_kyc_face_matching(self, face_img, id_img, kyc_id):
        face_img_cv = self._decode_image(face_img)

        face_img = self._face_embedding(face_img_cv)
        if face_img is None:
            return {'verified': False, 'reason': 'No face found in live photo'}
        
        face_match = self._compare_faces(face_img, self._storage_to_tensor(id_img))
        if face_match > self.threshold:
            update_data = {
                'face_match_score': face_match,
                'is_verified': True
            }
        else: 
            update_data = {
                'face_match_score': face_match,
                'is_verified': False
            }

        supabase.table('kyc_record') \
            .update(update_data) \
            .eq('kyc_id', kyc_id) \
            .execute()

        return {
            'match': face_match > self.threshold,
            'face_match_score': face_match,
        }
    
    def _tensor_to_storage(self, tensor):
        """Convert tensor to storage-friendly format"""
        if tensor is None:
            return None
        return base64.b64encode(tensor.detach().numpy().tobytes()).decode('utf-8')
    
    def _storage_to_tensor(self, stored_data):
        """Convert stored data back to tensor"""
        if not stored_data:
            return None
        return torch.tensor(np.frombuffer(base64.b64decode(stored_data), dtype=np.float32))
    
    def _file_to_cv2(self, django_file):
        """Convert Django InMemoryUploadedFile to OpenCV image"""
        in_memory_file = io.BytesIO(django_file.read())
        pil_image = Image.open(in_memory_file)
        return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

    def _extract_document_info(self, image):
        """Extract name and DOB from ID image using OCR"""
        try:
            # Preprocess image for better OCR
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, threshold = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Perform OCR
            text = pytesseract.image_to_string(threshold)
            
            return text
        except Exception as e:
            logger.error(f"Document extraction error: {str(e)}")
            return None
        
    def _extract_personal_info(self, text):
        """Extract name and DOB from unstructured ID text with improved patterns"""
        # Clean the text (remove special characters, normalize spaces)
        text = re.sub(r'[^\w\s,:.-]', '', text)
        text = ' '.join(text.split())  # Collapse multiple spaces

        # # looks for all-caps last name followed by title-case first/middle
        # name_match = re.search(
        #     r'([A-Z]{2,}),\s+([A-Z]{2,}(?:\s+[A-Z]{2,})*)',  # Matches "ARANETA, ALVIN LOCSON"
        #     text
        # )
        
        # if name_match:
        #     lname = name_match.group(1).strip()
        #     fname_mname = name_match.group(2).strip().split()
        #     fname = fname_mname[0] if len(fname_mname) > 0 else None
        #     mname = ' '.join(fname_mname[1:]) if len(fname_mname) > 1 else None
        # else:
        #     # Fallback if comma format not found
        #     name_match = re.search(
        #         r'(?:Last Name|Name)[^\w]*([A-Z]{2,})\s+([A-Z]{2,})',
        #         text,
        #         re.IGNORECASE
        #     )
        #     if name_match:
        #         lname = name_match.group(1).strip()
        #         fname = name_match.group(2).strip()
        #         mname = None
        #     else:
        #         lname, fname, mname = None, None, None
        
        # Extract date of birth (flexible date parsing)
        dob = None
        date_patterns = [
            r'(?:Date of Birth|DOB|Birthday)[^\d]*([A-Za-z]+\s+\d{1,2},\s+\d{4})',  # "February 13, 1961"
            r'(?:Date of Birth|DOB)[^\d]*(\d{4}-\d{2}-\d{2})',
            r'(?:Date of Birth|DOB)[^\d]*(\d{2}/\d{2}/\d{4})',
            r'([A-Za-z]+\s+\d{1,2},\s+\d{4})',  # Standalone date
            r'(\d{8})',  # Any 8-digit sequence
        ]

        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    date_str = match.group(1)
                    # Handle different date formats
                    if re.match(r'\d{8}', date_str):  # YYYYMMDD
                        date_str = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
                    parsed_date = parse(date_str)
                    dob = parsed_date.strftime('%Y-%m-%d')
                    break
                except:
                    continue
        
        return {
            'dob': dob,
            'raw_text': text
        }


    def _verify_info_match(self, user_data, extracted_info):
        """Compare user-provided data with extracted document info"""
        mismatches = []
        text = re.sub(r'[^\w\s]', '', extracted_info['raw_text'])
        text = text.split()
        print("Cleaned text:", text)  # Debug print
        print('dob:',extracted_info['dob'])
        
        # Name comparison (case insensitive, allow partial matches)
        name_match = user_data['lname'] in text and user_data['fname'] in text
        print(name_match)

        if not name_match:
            mismatches.append(f"Name mismatch: User entered '{user_data['lname']}, {user_data['fname']}'")
    
        # DOB comparison (flexible date formats)
        try:
            user_dob = datetime.strptime(user_data['dob'], '%Y-%m-%d').date()
            extracted_dob = datetime.strptime(extracted_info['dob'], '%Y-%m-%d').date()
            print(user_dob)
            if user_dob != extracted_dob:
                mismatches.append(f"DOB mismatch: User entered '{user_data['dob']}', "
                                f"document shows '{extracted_info['dob']}'")
        except:
            mismatches.append("Could not compare dates due to formatting issues")
        
        return {
            'match': len(mismatches) == 0,
            'mismatches': mismatches,
            'user_input': user_data,
            'extracted_info': extracted_info
        }
    
    def _decode_image(self, data):
        try:
            # Decode base64 string with numpy and cv2
            image = base64.b64decode(data)
            np_image = np.frombuffer(image, dtype=np.uint8)
            image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            return image
        except Exception as e:
            print('Error decoding image:',e)
        return None

    def _face_embedding(self, image):
        try:
            faces = self.mtcnn(image)
            if faces is not None:
                face_tensor = faces[0]
                face_tensor = face_tensor.unsqueeze(0)
                embedding = self.resnet(face_tensor)
                return embedding
            return None
        except Exception as e:
            print('Error getting face embedding', e)
            return None
    
    def _compare_faces(self, face_img, id_img):
        match = torch.nn.functional.cosine_similarity(face_img, id_img).item() # Result should be between -1 and 1
        return match