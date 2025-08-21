# ---------------------------------------------------
# PRODUCTION SERVER
# ---------------------------------------------------

# from pathlib import Path
# from datetime import timedelta
# from decouple import config
# import sys, os
# from corsheaders.defaults import default_headers
# import firebase_admin
# from firebase_admin import credentials


# # Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR = Path(__file__).resolve().parent.parent
# sys.path.append(os.path.join(BASE_DIR, 'apps'))

# # Quick-start development settings - unsuitable for production
# # See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# # SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-fallback-key-for-dev-only')

# # # SECURITY WARNING: don't run with debug turned on in production!
# # DEBUG = False
# DEBUG = config('DEBUG', default=True, cast=bool)

# # ========================
# # SUPABASE CONFIGURATION
# # ========================
# SUPABASE_CONFIG = {
#     'SUPABASE_URL': config('SUPABASE_URL', default='http://localhost:54321'),
#     'SUPABASE_ANON_KEY': config('SUPABASE_ANON_KEY', default='anon-dev-key'),
#     'SERVICE_ROLE_KEY': config('SUPABASE_SERVICE_ROLE_KEY', default='service-role-dev-key'),
#     'JWT_SECRET': config('SUPABASE_JWT_SECRET', default='dev-jwt-secret'),
#     'SUPABASE_PROJECT_ID': config('SUPABASE_PROJECT_ID', default='local-dev-project'),
#     'JWT_ALGORITHM': 'HS256',
#     'JWT_AUDIENCE': 'authenticated',
# }

# # Application definition

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
#     'rest_framework',
#     'corsheaders',
#     'rest_framework_simplejwt',
#     'rest_framework.authtoken',
#     'apps.healthProfiling',
#     'apps.inventory',
#     'apps.maternal',
#     'apps.vaccination',
#     'apps.administration',
#     'apps.familyplanning',
#     'apps.animalbites',
#     'apps.patientrecords',
#     'backend.firebase.notifications',
#     'apps.medicalConsultation',
#     'apps.medicineservices',
#     'apps.firstaid',
#     'apps.childhealthservices',
#     'apps.servicescheduler',
#     'apps.reports',
# ]

# # REST_FRAMEWORK = {
# #     'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
# #     'PAGE_SIZE': 10,  # default page size
# # }

# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware', 
#     'django.middleware.security.SecurityMiddleware',
#     'whitenoise.middleware.WhiteNoiseMiddleware', 
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'corsheaders.middleware.CorsMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
#     "django.middleware.gzip.GZipMiddleware",  
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

# ASGI_APPLICATION = 'backend.asgi.application'

# # Database
# # https://docs.djangoproject.com/en/5.1/ref/settings/#databases

# # ========================
# # DATABASE CONFIGURATION
# # ========================
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'OPTIONS': {
#             'connect_timeout': 5,
#             'sslmode': 'require',
#         },
#         'NAME': config('DB_NAME', default='my_default_db'),
#         'USER': config('DB_USER', default='my_default_user'),
#         'PASSWORD': config('DB_PASSWORD', default='my_default_password'),
#         'HOST': config('DB_HOST', default='localhost'),
#         'PORT': config('DB_PORT', default='5432'),
#     }
# }


# # Password validation
# # https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

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


# # ========================
# # STATIC FILES
# # ========================
# STATIC_URL = 'static/'
# if not DEBUG:
#     # Tell Django to copy static assets into a path called `staticfiles` (this is specific to Render)
#     STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

#     # Enable the WhiteNoise storage backend, which compresses static files to reduce disk use
#     # and renames the files with unique names for each version to support long-term caching
#     STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# # ========================
# # CORS SETTINGS
# # ========================
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://localhost:5173",
#     "https://ciudad-app-server-2.onrender.com",
#     "http://127.0.0.1:5173",  # Add this for Vite sometimes
# ]

# ALLOWED_HOSTS = [
#     'ciudad-app-server-2.onrender.com',
#     'localhost',
#     '127.0.0.1'
# ]

# CORS_ALLOW_ALL_ORIGINS = True
# CORS_ALLOW_CREDENTIALS = True

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






# # ---------------------------------------------------
# # DEVELOPMENT SERVER
# # ------------------------------------------------


from pathlib import Path
from datetime import timedelta
from decouple import config
import sys, os
from corsheaders.defaults import default_headers
import firebase_admin
from firebase_admin import credentials


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(os.path.join(BASE_DIR, 'apps'))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-fallback-key-for-dev-only')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# ========================
# SUPABASE CONFIGURATION
# ========================
SUPABASE_CONFIG = {
    'URL': config('SUPABASE_URL'),
    'ANON_KEY': config('SUPABASE_ANON_KEY'),
    'SERVICE_ROLE_KEY': config('SUPABASE_SERVICE_ROLE_KEY'),
    'JWT_SECRET': config('SUPABASE_JWT_SECRET'),
    'SUPABASE_PROJECT_ID': config('SUPABASE_PROJECT_ID'),
    'JWT_ALGORITHM': 'HS256',
    'JWT_AUDIENCE': 'authenticated',
}

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
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'rest_framework.authtoken',
    'apps.healthProfiling',
    'apps.inventory',
    'apps.maternal',
    'apps.vaccination',
    'apps.administration',
    'apps.familyplanning',
    'apps.animalbites',
    'apps.patientrecords',
    'backend.firebase.notifications',
    'apps.medicalConsultation',
    'apps.medicineservices',
    'apps.firstaid',
    'apps.childhealthservices',
    'apps.servicescheduler',
    'apps.reports',
]



MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "django.middleware.gzip.GZipMiddleware",  
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

ASGI_APPLICATION = 'backend.asgi.application'

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='my_default_db'),
        'USER': config('DB_USER', default='my_default_user'),
        'PASSWORD': config('DB_PASSWORD', default='my_default_password'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

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

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========================
# CORS SETTINGS
# ========================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://ciudad-app-server-2.onrender.com",
    "http://127.0.0.1:5173",  # Add this for Vite sometimes
]

ALLOWED_HOSTS = ['*'] 
CORS_ALLOW_ALL_ORIGINS = True # disable in production
CORS_ALLOW_CREDENTIALS = True # false in production

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