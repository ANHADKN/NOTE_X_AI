import datetime
import jwt
import bcrypt
from functools import wraps
from flask import request
from app.config import Config
from app.utils.response import api_response
from app.utils.logger import logger

def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt."""
    salt = bcrypt.gensalt(12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False

def generate_tokens(user_id: str, email: str, role: str = 'student', student_class: str = 'Class 10'):
    """Generates JWT access and refresh tokens for authenticated user."""
    access_payload = {
        "user_id": str(user_id),
        "email": email,
        "role": role,
        "student_class": student_class,
        "type": "access",
        "exp": datetime.datetime.utcnow() + Config.JWT_ACCESS_TOKEN_EXPIRES
    }
    
    refresh_payload = {
        "user_id": str(user_id),
        "type": "refresh",
        "exp": datetime.datetime.utcnow() + Config.JWT_REFRESH_TOKEN_EXPIRES
    }
    
    access_token = jwt.encode(access_payload, Config.JWT_SECRET_KEY, algorithm="HS256")
    refresh_token = jwt.encode(refresh_payload, Config.JWT_SECRET_KEY, algorithm="HS256")
    
    return access_token, refresh_token

def decode_token(token: str):
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired.")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        return None

def token_required(f):
    """Decorator to enforce valid JWT authentication on protected API endpoints."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return api_response(success=False, message="Authorization header missing.", status_code=401)
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return api_response(success=False, message="Authorization header format must be 'Bearer <token>'.", status_code=401)
        
        token = parts[1]
        decoded = decode_token(token)
        if not decoded or decoded.get('type') != 'access':
            return api_response(success=False, message="Invalid or expired access token.", status_code=401)
        
        request.user = decoded
        return f(*args, **kwargs)
    return decorated
