from django.utils import timezone
from datetime import timedelta
from .models import RequestRegistration
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
import logging

logger = logging.getLogger(__name__)

def update_expired_requests():
    print(f"[{timezone.now()}] Checking expired requests...") 
    now = timezone.now()
    RequestRegistration.objects.filter(
        req_created_at__range=(
            now - timedelta(days=30, minutes=15),  # 30 days 15 mins ago
            now - timedelta(days=30)               # 30 days ago
        ),
        req_is_archive=False
    ).delete()

_MODELS_CACHE = None

def get_face_recognition_models():
    """Lazy load models once per worker process"""
    global _MODELS_CACHE
    
    if _MODELS_CACHE is None:
        try:
            from facenet_pytorch import MTCNN, InceptionResnetV1
            
            # Use keep_all=False to detect only the most prominent face
            mtcnn = MTCNN(keep_all=True, thresholds=[0.7, 0.7, 0.8], min_face_size=40, device='cpu')
            resnet = InceptionResnetV1(pretrained='vggface2').eval()
            
            # Optimize for inference
            with torch.no_grad():
                resnet.eval()
            
            _MODELS_CACHE = {'mtcnn': mtcnn, 'resnet': resnet}
            logger.info("Face recognition models loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load face recognition models: {e}")
            raise
    
    return _MODELS_CACHE