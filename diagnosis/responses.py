from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class ResponseHandler:
    MESSAGES = {
        "INTERNAL_SERVER_ERROR": "An internal server error occurred.",
        "UNEXPECTED_ERROR": "An unexpected error occurred.",
        "NOT_FOUND": "Requested object not found.",
        "REQUEST_FAILED": "Requested operation failed.",
        "PREDICTION_SUCCESS": "Prediction successful.",
        "FEATURES_RETRIEVED": "Features retrieved successfully.",
        "METADATA_RETRIEVED": "Metadata retrieved successfully.",
        "INVALID_DATA": "Error while validating data."
    }

    def handle_response(self, status_code=200, message=None, error=None, response=None) -> JSONResponse:
        message = message or self.MESSAGES.get("PREDICTION_SUCCESS")
        return JSONResponse(
            content={  
                
                "response": response,
                "message": message,
                "error": error,
                "status": status_code,
            },
            status_code=status_code  
        )

    def handle_exception(self, exception=None, status_code=500, error=None, message=None) -> JSONResponse:
        message = message or self.MESSAGES.get("UNEXPECTED_ERROR")
        error = error or self.MESSAGES.get("INTERNAL_SERVER_ERROR")
        if exception:
            logger.error(f"Exception: {exception}")
        return self.handle_response(status_code=status_code, error=error, message=message)

    def handle_logger(self, error=None, message=None, exception=None):
        if exception:
            logger.error(f"{error or 'Exception'}: {exception}")
        if message:
            logger.info(f"{error or 'Info'}: {message}")
