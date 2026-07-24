from flask import jsonify

def api_response(success=True, data=None, message="Success", status_code=200, errors=None):
    """
    Standardized API response format for noteX AI REST API.
    """
    response_payload = {
        "success": success,
        "message": message,
        "data": data if data is not None else {},
    }
    
    if errors is not None:
        response_payload["errors"] = errors
        
    return jsonify(response_payload), status_code
