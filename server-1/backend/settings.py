from pathlib import Path
from decouple import config
from datetime import timedelta
import sys
import os
from corsheaders.defaults import default_headers
import firebase_admin
from firebase_admin import credentials
import json


# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(os.path.join(BASE_DIR, 'apps'))

# ========================
# SECURITY CONFIGURATION
# ========================
SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-fallback-key-for-dev-only')

# DEBUG = config('DEBUG', default=False, cast=bool)
DEBUG=config('DEBUG', False)

# ========================
# SUPABASE CONFIGURATION
# ========================
SUPABASE_CONFIG = {
    'SUPABASE_URL': config('SUPABASE_URL', default='http://localhost:54321'),
    'SUPABASE_ANON_KEY': config('SUPABASE_ANON_KEY', default='anon-dev-key'),
    'SERVICE_ROLE_KEY': config('SUPABASE_SERVICE_ROLE_KEY', default='service-role-dev-key'),
    'JWT_SECRET': config('SUPABASE_JWT_SECRET', default='dev-jwt-secret'),
    'SUPABASE_PROJECT_ID': config('SUPABASE_PROJECT_ID', default='local-dev-project'),
}

SUPABASE_URL = config('SUPABASE_URL', default='http://localhost:54321')
SUPABASE_ANON_KEY = config('SUPABASE_ANON_KEY', default='anon-dev-key')
SUPABASE_KEY = config('SUPABASE_ANON_KEY', default='anon-dev-key')
SUPABASE_JWT_SECRET = config('SUPABASE_JWT_SECRET', default='dev-jwt-secret')

# ========================
# FIREBASE CONFIGURATION
# ========================
FIREBASE_KEY = config('FIREBASE_KEY', default='MY_FIREBASE_KEY')

if FIREBASE_KEY:
    try:
        cred_dict = json.loads(FIREBASE_KEY)
        cred = credentials.Certificate(cred_dict)

        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
    except Exception as e:
        print(e)

# ========================
# APPLICATION DEFINITION
# ========================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'debug_toolbar',
    'simple_history',
    
    # Local apps
    'apps.administration',
    'apps.treasurer',
    'apps.waste',
    'apps.profiling',
    'corsheaders',
    'apps.account',
    'apps.file',
    'apps.complaint',
    'apps.report',
    'apps.council',
    'apps.donation',
    'apps.notification',
    'apps.announcement',
    'apps.authentication',
    'apps.gad',
    'apps.clerk',
    'apps.landing',
    'apps.act_log',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'django_ratelimit.middleware.RatelimitMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.authentication.middleware.request_logging.RequestLoggingMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware', 
    'simple_history.middleware.HistoryRequestMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = 'backend.asgi.application'

# ========================
# EMAIL CONFIGURATION
# ========================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# ========================
# DATABASE CONFIGURATION
# ========================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='my_default_db'),
        'USER': config('DB_USER', default='my_default_user'),
        'PASSWORD': config('DB_PASSWORD', default='my_default_password'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='6543'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ========================
# INTERNATIONALIZATION
# ========================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Manila'
USE_I18N = True
USE_L10N = True
USE_TZ = True 

# # Static files 
STATIC_URL = 'static/'
STATC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# DATABASE_ROUTERS = ['routers.db_routers.HealthDBRouter']

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========================
# REST FRAMEWORK
# ========================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        # 'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,  
    "USER_ID_FIELD": "acc_id",   
    "USER_ID_CLAIM": "acc_id", 
}

# New User Model
AUTH_USER_MODEL = 'account.Account'

# ========================
# CORS SETTINGS
# ========================

ALLOWED_HOSTS = ['*'] 
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool) # disable in production
CORS_ALLOWED_ORIGINS=[
    # Production Hosts (fixed commas)
    "https://ciudad-app.onrender.com", 
    "https://www.sanroqueciudad.com/",
    "https://securado.onrender.com/",

    # Local Testing (fixed comma)
    "http://127.0.0.1:8000",
    "http://localhost:8000",

    # Physical Mobile Device Host IP (confirmed from ipconfig)
    "http://192.168.1.52:8000",
]
CORS_ALLOW_CREDENTIALS = config('CORS_ALLOW_CREDENTIALS', default=False, cast=bool) # false in production

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'cache-control',
    'pragma',
]

CORS_EXPOSE_HEADERS = ['Authorization']

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_PREFLIGHT_MAX_AGE = 86400

# ========================
# SECURITY HEADERS
# ========================
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'

# ========================
# LOGGING
# ========================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}


# ========================
# SCHEDULER
# ========================
SCHEDULER_AUTOSTART = True
# SCHEDULER_AUTOSTART = not DEBUG # for production

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",  
    }
}
