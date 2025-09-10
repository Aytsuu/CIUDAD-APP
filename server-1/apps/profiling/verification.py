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
from django.core.cache import cache

logger = logging.getLogger(__name__)

class KYCVerificationProcessor:
    def __init__(self):
        self.mtcnn = MTCNN(
            keep_all=True,
            thresholds=[0.5, 0.6, 0.7],  # detection thresholds
        )
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval()
        self.threshold = 0.5

    def process_kyc_document_matching(self, user_data, id_image):
        try:
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
                logger.error('No text extracted from document')
                return False

            personal_info = self._extract_personal_info(doc_info)
            if not personal_info:
                logger.error('No personal info extracted from document')
                return False

            info_match = self._verify_info_match(user_data, personal_info)
            if not info_match['match']:
                logger.error('Extracted Info does not match personal info')
                return False

            key = f'{user_data['lname']}{user_data['fname']}' \
                  f'{user_data['mname']}' if 'mname' in user_data else ''
            
            cache.set(key, id_face, timeout=1800)
            logger.info('info matched')
            return True

        except Exception as e:
            logger.error(f"KYC verification error: {str(e)}")
            return False
    
    def process_kyc_face_matching(self, face_img, id_img):
        face_img_cv = self._decode_image(face_img)
        face_img = self._face_embedding(face_img_cv)
        if face_img is None:
            logger.error('No face found in live photo')
            return False
        face_match = self._compare_faces(face_img, id_img)
        return face_match > self.threshold
    
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
        print(text)
        
        # Extract date of birth (flexible date parsing)
        dob = None
        date_patterns = [
            r'(?:Date of Birth|DOB|Birthday)[^\d]*([A-Za-z]+\s+\d{1,2},\s+\d{4})',  # "February 13, 1961"
            r'(?:Date of Birth|DOB)[^\d]*(\d{4}-\d{2}-\d{2})',                      # "1961-02-13"
            r'(?:Date of Birth|DOB)[^\d]*(\d{2}/\d{2}/\d{4})',                      # "13/02/1961"
            r'([A-Za-z]+\s+\d{1,2}[,]?\s+\d{4})',                                   # "February 13, 1961"
            r'([A-Za-z]+\s+\d{1,2}[.]?\s+\d{4})',                                   # "February 13. 1961"
            r'([A-Za-z]+\s+\d{1,2}\s+\d{4})',                                       # "September 1 2004"
            r'(\d{8})',                                                             # "19610213"
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
        
        # Name comparison (case insensitive, allow partial matches)
        first_name_match = set(user_data['fname'].split(' ')).issubset(text)
        last_name_match = set(user_data['lname'].split(' ')).issubset(text)
        middle_name_match = set(user_data['mname'].split(' ')).issubset(text) if 'mname' in user_data else True
        name_match = first_name_match and last_name_match and middle_name_match
        print('Name matched:', name_match)

        if not name_match:
            mismatches.append(f"Name mismatch: User entered '{user_data['lname']}, {user_data['fname']}'")
    
        # DOB comparison (flexible date formats)
        try:
            user_dob = datetime.strptime(user_data['dob'], '%Y-%m-%d').date()
            extracted_dob = datetime.strptime(extracted_info['dob'], '%Y-%m-%d').date()
            print("User dob:", user_dob)
            print("Extracted dob:", extracted_dob)
            print("DOB matched:", user_dob == extracted_dob)
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