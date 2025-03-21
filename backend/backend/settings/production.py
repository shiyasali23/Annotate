# settings/production.py

from .base import *

# Disable debug mode in production
DEBUG = False

ALLOWED_HOSTS = [
    'backend',  
    'localhost',
    '127.0.0.1',
    '[::1]',
    'frontend',  
    'diagnosis',
    'detection',
    
]


CORS_ALLOWED_ORIGINS = [
    "http://frontend:3000",  # Frontend service in Docker
    "http://localhost:3000",  # Local development frontend
    "http://diagnosis:8001",  # diagnosis service in Docker
    "http://localhost:8001",  # Local development diagnosis
    "http://detection:8002",  # detection service in Docker
    "http://localhost:8002",  # Local development detection
    
]




SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0  # Disable HSTS
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'


# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.server': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}





print("Django loading production settings")


 


