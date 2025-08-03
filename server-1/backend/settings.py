# ---------------------------------------------------
# PRODUCTION SERVER
# ---------------------------------------------------

from pathlib import Path
from decouple import config
from datetime import timedelta
import sys
import os
from corsheaders.defaults import default_headers
import firebase_admin
from firebase_admin import credentials

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(os.path.join(BASE_DIR, 'apps'))

# ========================
# SECURITY CONFIGURATION
# ========================
SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-fallback-key-for-dev-only')

# DEBUG = config('DEBUG', default=False, cast=bool)
DEBUG=False

# ========================
# SUPABASE CONFIGURATION
# ========================
SUPABASE_CONFIG = {
    'SUPABASE_URL': config('SUPABASE_URL', default='http://localhost:54321'),
    'SUPABASE_ANON_KEY': config('SUPABASE_ANON_KEY', default='anon-dev-key'),
    'SERVICE_ROLE_KEY': config('SUPABASE_SERVICE_ROLE_KEY', default='service-role-dev-key'),
    'JWT_SECRET': config('SUPABASE_JWT_SECRET', default='dev-jwt-secret'),
    'SUPABASE_PROJECT_ID': config('SUPABASE_PROJECT_ID', default='local-dev-project'),
    'JWT_ALGORITHM': 'HS256',
    'JWT_AUDIENCE': 'authenticated',
}

SUPABASE_URL = config('SUPABASE_URL', default='http://localhost:54321')
SUPABASE_ANON_KEY = config('SUPABASE_ANON_KEY', default='anon-dev-key')
SUPABASE_KEY = config('SUPABASE_ANON_KEY', default='anon-dev-key')
SUPABASE_JWT_SECRET = config('SUPABASE_JWT_SECRET', default='dev-jwt-secret')


# ========================
# FIREBASE CONFIGURATION
# ========================
FIREBASE_CREDENTIAL_PATH = os.path.join(BASE_DIR, 'firebase', 'firebase-key.json')

if not firebase_admin._apps and os.path.exists(FIREBASE_CREDENTIAL_PATH):
    cred = credentials.Certificate(FIREBASE_CREDENTIAL_PATH)
    firebase_admin.initialize_app(cred)

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
    'apps.act_log',
    'backend.firebase.notifications',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.authentication.middleware.AuthCheckingMiddleware',
]

AUTHENTICATION_BACKENDS = [
    'apps.authentication.backends.SupabaseAuthBackend',
    'django.contrib.auth.backends.ModelBackend',
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
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default='my_default_email')
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default='my_default_password')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER


# ========================
# DATABASE CONFIGURATION
# ========================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'connect_timeout': 5,
            'sslmode': 'require',
        },
        'NAME': config('DB_NAME', default='my_default_db'),
        'USER': config('DB_USER', default='my_default_user'),
        'PASSWORD': config('DB_PASSWORD', default='my_default_password'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
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
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ========================
# STATIC FILES
# ========================
STATIC_URL = 'static/'
if not DEBUG:
    # Tell Django to copy static assets into a path called `staticfiles` (this is specific to Render)
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

    # Enable the WhiteNoise storage backend, which compresses static files to reduce disk use
    # and renames the files with unique names for each version to support long-term caching
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DATABASE_ROUTERS = ['routers.db_routers.HealthDBRouter']

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========================
# REST FRAMEWORK
# ========================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.authentication.backends.SupabaseAuthBackend',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        # 'rest_framework.permissions.IsAuthenticated',
    ],
}

# New User Model
# AUTH_USER_MODEL = 'account.Account'

# ========================
# CORS SETTINGS
# ========================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://ciudad-app-server-1.onrender.com",
    "http://127.0.0.1:5173",  # Add this for Vite sometimes
]

ALLOWED_HOSTS = [
    'ciudad-app-server-1.onrender.com',
    'localhost',
    '127.0.0.1'
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

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

# ========================
# PAYMONGO
# ========================
PAYMONGO_SECRET_KEY = config('PAYMONGO_SECRET_KEY')






# # ---------------------------------------------------
# # DEVELOPMENT SERVER
# # ---------------------------------------------------

# from pathlib import Path
# from decouple import config
# from datetime import timedelta
# import sys
# import os
# from corsheaders.defaults import default_headers
# import firebase_admin
# from firebase_admin import credentials

# # Build paths
# BASE_DIR = Path(__file__).resolve().parent.parent
# sys.path.append(os.path.join(BASE_DIR, 'apps'))

# # ========================
# # SECURITY CONFIGURATION
# # ========================
# SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-fallback-key-for-dev-only')

# # DEBUG = config('DEBUG', default=False, cast=bool)
# DEBUG=True
# # ALLOWED_HOSTS = config(
# #     'ALLOWED_HOSTS',
# #     default='localhost,127.0.0.1',
# #     cast=lambda v: [s.strip() for s in v.split(',')]
# # )

# # ========================
# # SUPABASE CONFIGURATION
# # ========================
# SUPABASE_CONFIG = {
#     'SUPABASE_URL': config('SUPABASE_URL'),
#     'SUPABASE_ANON_KEY': config('SUPABASE_ANON_KEY'),
#     'SERVICE_ROLE_KEY': config('SUPABASE_SERVICE_ROLE_KEY'),
#     'JWT_SECRET': config('SUPABASE_JWT_SECRET'),
#     'SUPABASE_PROJECT_ID': config('SUPABASE_PROJECT_ID'),
#     'JWT_ALGORITHM': 'HS256',
#     'JWT_AUDIENCE': 'authenticated',
# }

# SUPABASE_URL = config('SUPABASE_URL')
# SUPABASE_ANON_KEY = config('SUPABASE_ANON_KEY')
# SUPABASE_KEY = config('SUPABASE_ANON_KEY')
# SUPABASE_JWT_SECRET = config('SUPABASE_JWT_SECRET')

# # ========================
# # FIREBASE CONFIGURATION
# # ========================
# FIREBASE_CREDENTIAL_PATH = os.path.join(BASE_DIR, 'firebase', 'firebase-key.json')

# if not firebase_admin._apps and os.path.exists(FIREBASE_CREDENTIAL_PATH):
#     cred = credentials.Certificate(FIREBASE_CREDENTIAL_PATH)
#     firebase_admin.initialize_app(cred)

# # ========================
# # APPLICATION DEFINITION
# # ========================
# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
    
#     # Third-party apps
#     'rest_framework',
#     'simple_history',
    
#     # Local apps
#     'apps.administration',
#     'apps.treasurer',
#     'apps.waste',
#     'apps.profiling',
#     'corsheaders',
#     'apps.account',
#     'apps.file',
#     'apps.complaint',
#     'apps.report',
#     'apps.council',
#     'apps.donation',
#     'apps.notification',
#     'apps.announcement',
#     'apps.authentication',
#     'apps.gad',
#     'apps.clerk',
#     'apps.secretary',
#     'apps.act_log',
#     'backend.firebase.notifications',
    
# ]

# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware', 
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'corsheaders.middleware.CorsMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
#     'apps.authentication.middleware.AuthCheckingMiddleware',
#     # 'simple_history.middleware.HistoryRequestMiddleware',
# ]

# AUTHENTICATION_BACKENDS = [
#     'apps.authentication.backends.SupabaseAuthBackend',
#     'django.contrib.auth.backends.ModelBackend',
# ]

# ROOT_URLCONF = 'backend.urls'

# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.debug',
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]

# WSGI_APPLICATION = 'backend.wsgi.application'
# ASGI_APPLICATION = 'backend.asgi.application'

# # ========================
# # EMAIL CONFIGURATION
# # ========================
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = config("EMAIL_HOST_USER")
# EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")
# DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# # ========================
# # DATABASE CONFIGURATION
# # ========================
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': config('DB_NAME'),
#         'USER': config('DB_USER'),
#         'PASSWORD': config('DB_PASSWORD'),
#         'HOST': config('DB_HOST'),
#         'PORT': config('DB_PORT')
#     }
# }

# # Password validation
# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]

# # ========================
# # INTERNATIONALIZATION
# # ========================
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = 'Asia/Manila'
# USE_I18N = True
# USE_L10N = True
# USE_TZ = True 

# # Static files 
# STATIC_URL = 'static/'
# DATABASE_ROUTERS = ['routers.db_routers.HealthDBRouter']

# # Default primary key field type
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# # ========================
# # REST FRAMEWORK
# # ========================
# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': [
#         'apps.authentication.backends.SupabaseAuthBackend',
#     ],
#     'DEFAULT_PERMISSION_CLASSES': [
#         # 'rest_framework.permissions.IsAuthenticated',
#     ],
# }

# New User Model
# AUTH_USER_MODEL = 'account.Account'

# # ========================
# # CORS SETTINGS
# # ========================
# # CORS_ALLOWED_ORIGINS = [
# #     config('FRONTEND_URL', default='http://localhost:3000'), # replace this with the domain e.g 'https://ciudad-app.onrender.com'
# # ]

# ALLOWED_HOSTS = ['*'] 
# CORS_ALLOW_ALL_ORIGINS = True # disable in production
# CORS_ALLOW_CREDENTIALS = True # false in production

# CORS_ALLOW_HEADERS = [
#     'accept',
#     'accept-encoding',
#     'authorization',
#     'content-type',
#     'dnt',
#     'origin',
#     'user-agent',
#     'x-csrftoken',
#     'x-requested-with',
#     'cache-control',
#     'pragma',
# ]

# CORS_EXPOSE_HEADERS = ['Authorization']

# CORS_ALLOW_METHODS = [
#     'DELETE',
#     'GET',
#     'OPTIONS',
#     'PATCH',
#     'POST',
#     'PUT',
# ]

# CORS_PREFLIGHT_MAX_AGE = 86400

# # ========================
# # SECURITY HEADERS
# # ========================
# if not DEBUG:
#     SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
#     SECURE_SSL_REDIRECT = True
#     SESSION_COOKIE_SECURE = True
#     CSRF_COOKIE_SECURE = True
#     SECURE_HSTS_SECONDS = 31536000  # 1 year
#     SECURE_HSTS_INCLUDE_SUBDOMAINS = True
#     SECURE_HSTS_PRELOAD = True
#     SECURE_CONTENT_TYPE_NOSNIFF = True
#     SECURE_BROWSER_XSS_FILTER = True
#     X_FRAME_OPTIONS = 'DENY'

# # ========================
# # LOGGING
# # ========================
# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'handlers': {
#         'console': {
#             'class': 'logging.StreamHandler',
#         },
#     },
#     'root': {
#         'handlers': ['console'],
#         'level': 'INFO',
#     },
# }


# # ========================
# # SCHEDULER
# # ========================
# SCHEDULER_AUTOSTART = True
# # SCHEDULER_AUTOSTART = not DEBUG # for production


# # ========================
# # PAYMONGO
# # ========================
# PAYMONGO_SECRET_KEY = config('PAYMONGO_SECRET_KEY')