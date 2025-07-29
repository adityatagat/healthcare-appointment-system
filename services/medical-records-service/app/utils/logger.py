import logging
import sys
import json

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            'timestamp': self.formatTime(record, "%Y-%m-%dT%H:%M:%S.%fZ"),
            'level': record.levelname.lower(),
            'message': record.getMessage(),
            'service': 'medical-records-service',
            'environment': 'production',  # Or read from env
        }
        if record.exc_info:
            log_record['exception'] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def configure_logger():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = [handler]
    logging.getLogger('uvicorn.access').handlers = [handler]
    logging.getLogger('uvicorn.error').handlers = [handler]
