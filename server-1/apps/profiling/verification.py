import cv2
import pytesseract
import numpy as np
from PIL import Image
import io
import re
import logging
from django.conf import settings
from utils.supabase_client import create_client
from dateutil.parser import parse
from datetime import datetime

logger = logging.getLogger(__name__)

class KYCVerificationProcessor:
    def __init__(self):
        self.supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        self.name_regex = re.compile(r'([A-Z][a-z]+ [A-Z][a-z]+)')  # Basic name pattern
        self.dob_regex = re.compile(r'\d{2}/\d{2}/\d{4}')  # Basic date pattern

    def process_kyc_document_matching(self, user_data, id_image, kyc_id):
        try:
            print(kyc_id)
            print(user_data)

            # Convert Django InMemoryUploadedFile to OpenCV image
            id_image_cv = self._file_to_cv2(id_image)
            # live_photo_cv = self._file_to_cv2(live_photo)

            # Step 1: Extract and verify document information
            doc_info = self._extract_document_info(id_image_cv)
            if not doc_info:
                return {'verified': False, 'reason': 'No text extracted from document'}

            personal_info = self._extract_personal_info(doc_info)
            if not personal_info:
                return {'verified': False, 'reason': 'No personal information extracted from text'}

            info_match = self._verify_info_match(user_data, personal_info)
            if not info_match['match']:
                return {'verified': False, 'reason': f"Information mismatch: {info_match['mismatch']}"}

            # Step 2: Face verification
            # id_face = self._extract_face(id_image_cv)
            # if id_face is None:
            #     return {'verified': False, 'reason': 'No face found in ID document'}

            # live_face = self._extract_face(live_photo_cv)
            # if live_face is None:
            #     return {'verified': False, 'reason': 'No face found in live photo'}

            # face_match = self._compare_faces(id_face, live_face)
            print()
            print('info match:',info_match)
            update_data = {
                'document_info_match': True
            }

            self.supabase.table('kyc_record') \
                .update(update_data) \
                .eq('kyc_id', kyc_id) \
                .execute()

            return {
                # 'verified': face_match['match'],
                # 'reason': 'Faces match' if face_match['match'] else 'Face verification failed',
                'document_info': doc_info,
                'info_match': info_match,
                # 'face_match_score': face_match['score'],
                # 'face_distance': face_match['distance']
            }

        except Exception as e:
            self.supabase.table('kyc_record') \
                .update({'document_info_match' : False}) \
                .eq('kyc_id', kyc_id) \
                .execute()

            logger.error(f"KYC verification error: {str(e)}")
            return {'verified': False, 'reason': f'Processing error: {str(e)}'}
    
    def process_kyc_face_matching(self, request):
      return
    
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
        print("Cleaned text:", text)  # Debug print

        # looks for all-caps last name followed by title-case first/middle
        name_match = re.search(
            r'([A-Z]{2,}),\s+([A-Z]{2,}(?:\s+[A-Z]{2,})*)',  # Matches "ARANETA, ALVIN LOCSON"
            text
        )
        
        if name_match:
            lname = name_match.group(1).strip()
            fname_mname = name_match.group(2).strip().split()
            fname = fname_mname[0] if len(fname_mname) > 0 else None
            mname = ' '.join(fname_mname[1:]) if len(fname_mname) > 1 else None
        else:
            # Fallback if comma format not found
            name_match = re.search(
                r'(?:Last Name|Name)[^\w]*([A-Z]{2,})\s+([A-Z]{2,})',
                text,
                re.IGNORECASE
            )
            if name_match:
                lname = name_match.group(1).strip()
                fname = name_match.group(2).strip()
                mname = None
            else:
                lname, fname, mname = None, None, None
        
        # Extract date of birth (flexible date parsing)
        dob = None
        date_patterns = [
            r'(?:Date of Birth|DOB|Birthday)[^\d]*(\d{8})',  # YYYYMMDD
            r'(?:Date of Birth|DOB)[^\d]*([A-Za-z]+ \d{1,2}, \d{4})',
            r'(?:Date of Birth|DOB)[^\d]*(\d{4}-\d{2}-\d{2})',
            r'(?:Date of Birth|DOB)[^\d]*(\d{2}/\d{2}/\d{4})',
            r'(\d{8})',  # Any 8-digit sequence
            r'(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})'
        ]

        # Special handling in the date parsing logic:
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    if len(match.groups()) == 2:  # For "y 26, 1975" pattern
                        month_part, day, year = match.group(0)[0], match.group(1), match.group(2)
                        if month_part.lower() == 'y':
                            month = 'February'  # Correct common OCR error
                        date_str = f"{month} {day}, {year}"
                    elif len(match.groups()) == 1:  # Compact formats
                        date_str = match.group(1)
                        if len(date_str) == 8:  # YYYYMMDD
                            date_str = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
                    else:  # Standard formats
                        date_str = match.group(0)
                    
                    parsed_date = parse(date_str)
                    dob = parsed_date.strftime('%Y-%m-%d')
                    break
                except:
                    continue
        
        return {
            'lname': lname,
            'fname': fname,
            'mname': mname,
            'dob': dob,
            'raw_text': text
        }


    def _verify_info_match(self, user_data, extracted_info):
        """Compare user-provided data with extracted document info"""
        mismatches = []
        
        # Name comparison (case insensitive, allow partial matches)
        user_fullname = f"{user_data['lname']} {user_data['fname']}".lower()
        extracted_fullname = f"{extracted_info['lname']} {extracted_info['fname']}".lower()
        print('User full name:',user_fullname)
        print('User dob:', user_data['dob'])
        print('Extacted full name:', extracted_fullname)
        print('Extracted date:', extracted_info['dob'])

        if (user_data['lname'].lower() not in extracted_fullname or 
            user_data['fname'].lower() not in extracted_fullname):
            mismatches.append(f"Name mismatch: User entered '{user_data['lname']}, {user_data['fname']}', "
                f"document shows '{extracted_info['lname']}, {extracted_info['fname']}'")
    
        # DOB comparison (flexible date formats)
        try:
            user_dob = datetime.strptime(user_data['dob'], '%Y-%m-%d').date()
            extracted_dob = datetime.strptime(extracted_info['dob'], '%Y-%m-%d').date()
            print(user_dob)
            print(extracted_dob)
            
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