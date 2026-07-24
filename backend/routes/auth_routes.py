from flask import Blueprint, request
from bson import ObjectId
import datetime
from backend.utils.auth import hash_password, verify_password, generate_tokens, decode_token, token_required
from backend.utils.response import api_response
from backend.database.mongo import mongo_manager
from backend.database.models import UserModel, BaseModel
from backend.utils.logger import logger

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

# Fallback In-Memory Storage if Mongo is unavailable during development
IN_MEMORY_USERS = {}

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new student or admin account."""
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        student_class = data.get('student_class', 'Class 10')
        role = data.get('role', 'student')
        target_exam = data.get('target_exam', 'Board Exam')

        if not name or not email or not password:
            return api_response(success=False, message="Name, email, and password are required.", status_code=400)

        if len(password) < 6:
            return api_response(success=False, message="Password must be at least 6 characters long.", status_code=400)

        # Validate Class range (Class 1 to Class 12)
        valid_classes = [f"Class {i}" for i in range(1, 13)]
        if student_class not in valid_classes:
            student_class = "Class 10"

        db = mongo_manager.get_db()
        hashed_pwd = hash_password(password)

        if db is not None:
            existing_user = db.users.find_one({"email": email})
            if existing_user:
                return api_response(success=False, message="An account with this email already exists.", status_code=409)

            user_doc = UserModel.create_user_doc(
                name=name,
                email=email,
                password_hash=hashed_pwd,
                student_class=student_class,
                role=role,
                target_exam=target_exam
            )
            result = db.users.insert_one(user_doc)
            user_id = str(result.inserted_id)
        else:
            # In-memory fallback
            if email in IN_MEMORY_USERS:
                return api_response(success=False, message="An account with this email already exists.", status_code=409)
            
            user_id = f"mem_{len(IN_MEMORY_USERS) + 1}"
            IN_MEMORY_USERS[email] = {
                "_id": user_id,
                "name": name,
                "email": email,
                "password_hash": hashed_pwd,
                "student_class": student_class,
                "role": role,
                "target_exam": target_exam,
                "study_streak": 1,
                "total_points": 50,
                "created_at": datetime.datetime.utcnow().isoformat()
            }

        access_token, refresh_token = generate_tokens(user_id, email, role, student_class)

        return api_response(
            success=True,
            message="User registered successfully!",
            data={
                "user": {
                    "id": user_id,
                    "name": name,
                    "email": email,
                    "student_class": student_class,
                    "role": role,
                    "target_exam": target_exam
                },
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            status_code=201
        )
    except Exception as e:
        logger.error(f"Registration Error: {str(e)}")
        return api_response(success=False, message=f"Registration failed: {str(e)}", status_code=500)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and issue JWT tokens."""
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return api_response(success=False, message="Email and password are required.", status_code=400)

        db = mongo_manager.get_db()
        user = None

        if db is not None:
            user = db.users.find_one({"email": email})
        else:
            user = IN_MEMORY_USERS.get(email)

        if not user or not verify_password(password, user.get('password_hash', '')):
            return api_response(success=False, message="Invalid email or password.", status_code=401)

        user_id = str(user.get('_id'))
        role = user.get('role', 'student')
        student_class = user.get('student_class', 'Class 10')
        name = user.get('name', 'Student')

        access_token, refresh_token = generate_tokens(user_id, email, role, student_class)

        serialized_user = BaseModel.serialize_doc(user)
        if serialized_user and 'password_hash' in serialized_user:
            del serialized_user['password_hash']

        return api_response(
            success=True,
            message="Login successful!",
            data={
                "user": serialized_user,
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Login Error: {str(e)}")
        return api_response(success=False, message=f"Login failed: {str(e)}", status_code=500)

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """Fetch current logged-in user profile."""
    try:
        user_info = request.user
        email = user_info.get('email')
        db = mongo_manager.get_db()

        if db is not None:
            try:
                user = db.users.find_one({"_id": ObjectId(user_info.get('user_id'))})
            except Exception:
                user = db.users.find_one({"email": email})
        else:
            user = IN_MEMORY_USERS.get(email)

        if not user:
            return api_response(success=False, message="User not found.", status_code=404)

        serialized = BaseModel.serialize_doc(user)
        if 'password_hash' in serialized:
            del serialized['password_hash']

        return api_response(success=True, data={"user": serialized}, status_code=200)
    except Exception as e:
        logger.error(f"Profile Fetch Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@auth_bp.route('/update-class', methods=['POST'])
@token_required
def update_class():
    """Update active student class (Class 1 to Class 12)."""
    try:
        data = request.get_json() or {}
        new_class = data.get('student_class', '')

        valid_classes = [f"Class {i}" for i in range(1, 13)]
        if new_class not in valid_classes:
            return api_response(success=False, message=f"Invalid class specified. Must be one of: {', '.join(valid_classes)}", status_code=400)

        user_info = request.user
        user_id = user_info.get('user_id')
        email = user_info.get('email')
        db = mongo_manager.get_db()

        if db is not None:
            try:
                db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"student_class": new_class, "updated_at": datetime.datetime.utcnow()}})
            except Exception:
                db.users.update_one({"email": email}, {"$set": {"student_class": new_class, "updated_at": datetime.datetime.utcnow()}})
        else:
            if email in IN_MEMORY_USERS:
                IN_MEMORY_USERS[email]['student_class'] = new_class

        return api_response(success=True, message=f"Active grade updated to {new_class}!", data={"student_class": new_class}, status_code=200)
    except Exception as e:
        logger.error(f"Update Class Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token using refresh token."""
    try:
        data = request.get_json() or {}
        refresh_token = data.get('refresh_token')

        if not refresh_token:
            return api_response(success=False, message="Refresh token required.", status_code=400)

        decoded = decode_token(refresh_token)
        if not decoded or decoded.get('type') != 'refresh':
            return api_response(success=False, message="Invalid or expired refresh token.", status_code=401)

        user_id = decoded.get('user_id')
        db = mongo_manager.get_db()
        user = None

        if db is not None:
            try:
                user = db.users.find_one({"_id": ObjectId(user_id)})
            except Exception:
                pass
        
        if not user:
            # Try matching via in-memory or fallback
            for email, u in IN_MEMORY_USERS.items():
                if u.get('_id') == user_id:
                    user = u
                    break

        if not user:
            return api_response(success=False, message="User associated with token not found.", status_code=404)

        new_access_token, new_refresh_token = generate_tokens(
            user_id=str(user.get('_id')),
            email=user.get('email'),
            role=user.get('role', 'student'),
            student_class=user.get('student_class', 'Class 10')
        )

        return api_response(
            success=True,
            data={
                "access_token": new_access_token,
                "refresh_token": new_refresh_token
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Refresh Token Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
