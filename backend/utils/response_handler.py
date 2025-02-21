import logging
from rest_framework.response import Response


logger = logging.getLogger(__name__)

class ResponseHandler():
    MESSAGES = {
        'UNEXPECTED_ERROR': "An unexpected error occurred.",
        'INTERNAL_SERVER_ERROR': "An internal server error occurred.",
        'NOT_FOUND': "Requested object not found.",
        'REQUEST_FAILED': "Requested operation failed",
        'SUCCESS_MESSAGE': "Requested operation successful.",
        'INVALID_CREDENTIALS': "Invalid credentials.",
        'AUTHETICATION_SUCCESS': "Authentication successful.",
        'AUTHETICATION_FAILED': "Authentication failed.",
        'LOGOUT_SUCCESS': "Logout successful.",
        'USER_CREATION_FAILED': "User creation failed.",
        'EMAIL_PASSWORD_REQUIRED': "Email and password are required.",
        "REQUIRED_FIELDS_MISSING": "Required fields are missing.",
        "USER_ALREADY_EXISTS": "User with this email might already exists.",
        "ACCOUNT_DISABLED": "Account is disabled.",
        "INVALID_DATA": "Error while validating data."
    }

    def handle_response(self, status_code=200, message=None, error=None ,response=None):
        if not message:
            message = self.MESSAGES['SUCCESS_MESSAGE']
        return Response({
            'response': response,
            'status': status_code,
            'message': message,
            'error': error
        }, status=status_code)

    def handle_exception(self, exception=None, status_code=500, error=None, message=None):
        message = message or self.MESSAGES['UNEXPECTED_ERROR']
        error = error or self.MESSAGES['INTERNAL_SERVER_ERROR']
        if exception:
            logger.error(f"Exception: {exception}")
        return self.handle_response(status_code=status_code, error=error, message=message)

    
