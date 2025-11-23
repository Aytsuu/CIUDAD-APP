import cv2
import pytesseract
import numpy as np
from PIL import Image
import io
import re
import logging  
import torch
from django.core.files.base import ContentFile
from django.conf import settings
from utils.supabase_client import supabase
from dateutil.parser import parse
from datetime import datetime
from facenet_pytorch import MTCNN, InceptionResnetV1
from django.core.cache import cache

logger = logging.getLogger(__name__)
pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

class KYCVerificationProcessor:
    @classmethod
    def get_models(cls):
        models = cache.get('face_recognition_models')
        if models is None:
            mtcnn = MTCNN(keep_all=True, thresholds=[0.7, 0.7, 0.8], min_face_size=40, device='cpu')
            resnet = InceptionResnetV1(pretrained='vggface2').eval()
            models = {'mtcnn': mtcnn, 'resnet': resnet}
            cache.set('face_recognition_models', models, timeout=3600) # cache for 1 hour
        return models

    def __init__(self):
        models = self.get_models()
        self.mtcnn = models['mtcnn']
        self.resnet = models['resnet']
        self.threshold = 0.5

    def process_kyc_document_matching(self, user_data, id_image):
        try:
            logger.info(user_data)
    
            # Convert Django InMemoryUploadedFile to OpenCV image
            id_image_cv = self._uploaded_file_to_cv2(id_image)

            # Check if face is visible in the ID
            id_face = self._face_embedding(id_image_cv)
            if id_face is None:
                logger.error('No face extracted from ID')
                return False

            # Extract and verify document information
            doc_info = self._extract_document_info(id_image_cv)
            if not doc_info:
                logger.error('No text extracted from ID')
                return False

            personal_info = self._extract_personal_info(doc_info)
            if not personal_info:
                logger.error('No personal info extracted from ID')
                return False

            info_match = self._verify_info_match(user_data, personal_info)
            if not info_match['match']:
                logger.error('Extracted Info does not match personal info')
                return False

            key = f"{user_data['lname']}{user_data['fname']}"
            
            cache.set(key, id_face, timeout=1200)
            logger.info('info matched')
            return True

        except Exception as e:
            logger.error(f"KYC verification error: {str(e)}")
            return False
    
    def process_kyc_face_matching(self, face_img, id_img):
        face_img = self._face_embedding(self._uploaded_file_to_cv2(face_img))
        if face_img is None:
            logger.error('No face found in live photo')
            return False
        face_match = self._compare_faces(face_img, id_img)
        logger.info(face_match)
        return face_match > self.threshold
    
    def _uploaded_file_to_cv2(self, uploaded_file):
        """Convert Django UploadedFile (or ContentFile) to OpenCV image"""
        np_array = np.frombuffer(uploaded_file.read(), np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        return image

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
        except pytesseract.TesseractNotFoundError:
            logger.error("Tesseract is still missing")
        except Exception as e:
            logger.error(f"Document extraction error: {str(e)}")
            return None
        
    def _extract_personal_info(self, text):
        """Extract name and DOB from unstructured ID text with improved patterns"""
        # Clean the text (remove special characters, normalize spaces)
        text = re.sub(r'[^\w\s,:.-]', '', text)
        text = ' '.join(text.split())  # Collapse multiple spaces
        logger.info(text)
        
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
        logger.info("Cleaned text:", text)  # Debug logger.info
        
        # Name comparison (case insensitive, allow partial matches)
        first_name_match = set(user_data['fname'].split(' ')).issubset(text)
        last_name_match = set(user_data['lname'].split(' ')).issubset(text)
        middle_name_match = set(user_data['mname'].split(' ')).issubset(text) if 'mname' in user_data else True
        name_match = first_name_match and last_name_match and middle_name_match
        logger.info('Name matched:', name_match)

        if not name_match:
            mismatches.append(f"Name mismatch: User entered '{user_data['lname']}, {user_data['fname']}'")
    
        # DOB comparison (flexible date formats)
        try:
            user_dob = datetime.strptime(user_data['dob'], '%Y-%m-%d').date()
            extracted_dob = datetime.strptime(extracted_info['dob'], '%Y-%m-%d').date()
            logger.info("User dob:", user_dob)
            logger.info("Extracted dob:", extracted_dob)
            logger.info("DOB matched:", user_dob == extracted_dob)
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
            logger.info('Error getting face embedding', e)
            return None
    
    def _compare_faces(self, face_img, id_img):
        match = torch.nn.functional.cosine_similarity(face_img, id_img).item() # Result should be between -1 and 1
        return match