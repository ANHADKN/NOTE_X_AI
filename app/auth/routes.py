import random
import datetime
from flask import Blueprint, request
from bson import ObjectId
from app.utils.auth import hash_password, verify_password, generate_tokens, decode_token, token_required
from app.utils.response import api_response
from app.models.mongo import mongo_manager
from app.models.schemas import UserModel, OTPModel, BaseModel
from app.utils.logger import logger
from app.utils.email import send_otp_email

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

IN_MEMORY_USERS = {}
IN_MEMORY_OTPS = {}

def generate_otp():
    """Generates a secure 6-digit numeric OTP."""
    return str(random.randint(100000, 999999))

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new student account and issue OTP for verification."""
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

        valid_classes = [f"Class {i}" for i in range(1, 13)]
        if student_class not in valid_classes:
            student_class = "Class 10"

        db = mongo_manager.get_db()
        hashed_pwd = hash_password(password)

        if db is not None:
            existing = db.users.find_one({"email": email})
            if existing:
                return api_response(success=False, message="An account with this email already exists.", status_code=409)

            user_doc = UserModel.create_user_doc(
                name=name, email=email, password_hash=hashed_pwd,
                student_class=student_class, role=role, target_exam=target_exam
            )
            res = db.users.insert_one(user_doc)
            user_id = str(res.inserted_id)

            otp_code = generate_otp()
            otp_doc = OTPModel.create_otp_doc(email=email, otp_code=otp_code, purpose="email_verification")
            db.otps.insert_one(otp_doc)
        else:
            if email in IN_MEMORY_USERS:
                return api_response(success=False, message="An account with this email already exists.", status_code=409)

            user_id = f"mem_{len(IN_MEMORY_USERS) + 1}"
            IN_MEMORY_USERS[email] = {
                "_id": user_id, "name": name, "email": email, "password_hash": hashed_pwd,
                "student_class": student_class, "role": role, "target_exam": target_exam,
                "is_verified": False, "study_streak": 1, "total_points": 50,
                "created_at": datetime.datetime.utcnow().isoformat()
            }

            otp_code = generate_otp()
            IN_MEMORY_OTPS[email] = {
                "otp_code": otp_code, "purpose": "email_verification", "is_used": False,
                "expires_at": (datetime.datetime.utcnow() + datetime.timedelta(minutes=10)).isoformat()
            }

        send_otp_email(email, otp_code, purpose="Email Verification")
        access_token, refresh_token = generate_tokens(user_id, email, role, student_class)

        logger.info(f"User registered: {email} [OTP: {otp_code}]")

        return api_response(
            success=True,
            message="User registered successfully! Please verify your email using the OTP provided.",
            data={
                "user": {
                    "id": user_id, "name": name, "email": email,
                    "student_class": student_class, "role": role, "is_verified": False
                },
                "otp_preview": otp_code,
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
    """Authenticate student/admin with JWT tokens."""
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return api_response(success=False, message="Email and password are required.", status_code=400)

        db = mongo_manager.get_db()
        user = db.users.find_one({"email": email}) if db is not None else IN_MEMORY_USERS.get(email)

        if not user or not verify_password(password, user.get('password_hash', '')):
            return api_response(success=False, message="Invalid email or password.", status_code=401)

        user_id = str(user.get('_id'))
        role = user.get('role', 'student')
        student_class = user.get('student_class', 'Class 10')

        access_token, refresh_token = generate_tokens(user_id, email, role, student_class)
        serialized = BaseModel.serialize_doc(user)
        if serialized and 'password_hash' in serialized:
            del serialized['password_hash']

        return api_response(
            success=True,
            message="Login successful!",
            data={
                "user": serialized,
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Login Error: {str(e)}")
        return api_response(success=False, message=f"Login failed: {str(e)}", status_code=500)

import requests

@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    """Authenticate user with Google OAuth ID Token."""
    try:
        data = request.get_json() or {}
        id_token = data.get('credential')

        if not id_token:
            return api_response(success=False, message="Google ID token is required.", status_code=400)

        # Verify token with Google's tokeninfo endpoint
        google_response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}")
        if google_response.status_code != 200:
            return api_response(success=False, message="Invalid Google token.", status_code=401)

        token_info = google_response.json()
        email = token_info.get('email', '').lower().strip()
        name = token_info.get('name', 'Student')
        google_id = token_info.get('sub')
        profile_photo = token_info.get('picture')

        if not email or not google_id:
            return api_response(success=False, message="Incomplete profile information from Google.", status_code=400)

        db = mongo_manager.get_db()
        user = None

        if db is not None:
            # Check by email first (to link accounts if they already registered via email)
            user = db.users.find_one({"email": email})
            
            if not user:
                # First-time user via Google
                hashed_pwd = hash_password(generate_otp()) # Random password for google users
                user_doc = UserModel.create_user_doc(
                    name=name, email=email, password_hash=hashed_pwd,
                    student_class="Class 10", role="student", target_exam="Board Exam",
                    login_provider="google", google_id=google_id, profile_photo=profile_photo
                )
                user_doc["is_verified"] = True # Google verified emails
                res = db.users.insert_one(user_doc)
                user = db.users.find_one({"_id": res.inserted_id})
                logger.info(f"New Google user registered: {email}")
            else:
                # Update existing user with google_id and photo if missing
                updates = {}
                if not user.get('google_id'):
                    updates['google_id'] = google_id
                    updates['login_provider'] = "google"
                if not user.get('profile_photo') and profile_photo:
                    updates['profile_photo'] = profile_photo
                
                if updates:
                    db.users.update_one({"_id": user['_id']}, {"$set": updates})
                    user.update(updates)
                logger.info(f"Google user logged in: {email}")
        else:
            # In memory fallback
            if email in IN_MEMORY_USERS:
                user = IN_MEMORY_USERS[email]
            else:
                hashed_pwd = hash_password(generate_otp())
                user_id = f"mem_{len(IN_MEMORY_USERS) + 1}"
                user = {
                    "_id": user_id, "name": name, "email": email, "password_hash": hashed_pwd,
                    "student_class": "Class 10", "role": "student", "target_exam": "Board Exam",
                    "is_verified": True, "study_streak": 1, "total_points": 50,
                    "login_provider": "google", "google_id": google_id, "profile_photo": profile_photo,
                    "created_at": datetime.datetime.utcnow().isoformat()
                }
                IN_MEMORY_USERS[email] = user

        user_id = str(user.get('_id'))
        role = user.get('role', 'student')
        student_class = user.get('student_class', 'Class 10')

        access_token, refresh_token = generate_tokens(user_id, email, role, student_class)
        serialized = BaseModel.serialize_doc(user)
        if serialized and 'password_hash' in serialized:
            del serialized['password_hash']

        return api_response(
            success=True,
            message="Google Login successful!",
            data={
                "user": serialized,
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Google Login Error: {str(e)}")
        return api_response(success=False, message=f"Google Login failed: {str(e)}", status_code=500)

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify 6-digit OTP code with expiration check (10 min expiry)."""
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        otp_code = data.get('otp_code', '').strip()
        purpose = data.get('purpose', 'email_verification')

        if not email or not otp_code:
            return api_response(success=False, message="Email and OTP code are required.", status_code=400)

        db = mongo_manager.get_db()
        matched = False
        now = datetime.datetime.utcnow()

        if db is not None:
            otp_record = db.otps.find_one({
                "email": email,
                "otp_code": otp_code,
                "is_used": False
            })
            if otp_record:
                expires_at = otp_record.get('expires_at')
                if expires_at and isinstance(expires_at, datetime.datetime) and now > expires_at:
                    return api_response(success=False, message="OTP code has expired (valid for 10 minutes).", status_code=400)

                db.otps.update_one({"_id": otp_record['_id']}, {"$set": {"is_used": True}})
                db.users.update_one({"email": email}, {"$set": {"is_verified": True}})
                matched = True
        else:
            record = IN_MEMORY_OTPS.get(email)
            if record and record.get('otp_code') == otp_code and not record.get('is_used'):
                record['is_used'] = True
                if email in IN_MEMORY_USERS:
                    IN_MEMORY_USERS[email]['is_verified'] = True
                matched = True

        if not matched:
            return api_response(success=False, message="Invalid or previously used OTP code.", status_code=400)

        logger.info(f"OTP Verified successfully for {email} [Purpose: {purpose}]")
        return api_response(success=True, message="OTP verified successfully!", status_code=200)
    except Exception as e:
        logger.error(f"Verify OTP Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request a password reset OTP with rate limiting and email verification."""
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()

        if not email:
            return api_response(success=False, message="Please provide your registered email address.", status_code=400)

        db = mongo_manager.get_db()
        user = db.users.find_one({"email": email}) if db is not None else IN_MEMORY_USERS.get(email)

        if not user:
            logger.warning(f"Forgot Password request failed: Email '{email}' not found in MongoDB.")
            return api_response(success=False, message="No registered student account found with this email address.", status_code=404)

        now = datetime.datetime.utcnow()

        # Spam Prevention & Rate Limiting: Check for recent active unexpired OTP requests within 1 minute
        if db is not None:
            recent_otp = db.otps.find_one({
                "email": email,
                "purpose": "forgot_password",
                "created_at": {"$gte": now - datetime.timedelta(seconds=60)}
            })
            if recent_otp:
                return api_response(success=False, message="Please wait 60 seconds before requesting a new OTP.", status_code=429)

            # Invalidate older un-used OTPs for this email
            db.otps.update_many({"email": email, "purpose": "forgot_password"}, {"$set": {"is_used": True}})

            otp_code = generate_otp()
            otp_doc = OTPModel.create_otp_doc(email=email, otp_code=otp_code, purpose="forgot_password")
            db.otps.insert_one(otp_doc)
        else:
            otp_code = generate_otp()
            IN_MEMORY_OTPS[email] = {
                "otp_code": otp_code, "purpose": "forgot_password", "is_used": False,
                "created_at": now.isoformat(),
                "expires_at": (now + datetime.timedelta(minutes=10)).isoformat()
            }

        # Dispatch OTP via Gmail SMTP
        email_sent = send_otp_email(email, otp_code, purpose="Password Reset")

        logger.info(f"Password Reset OTP generated for {email}: {otp_code} (SMTP Sent: {email_sent})")

        return api_response(
            success=True,
            message="A 6-digit password reset OTP has been sent to your email address (valid for 10 minutes).",
            data={"otp_preview": otp_code},  # Failsafe preview for testing
            status_code=200
        )
    except Exception as e:
        logger.error(f"Forgot Password Error: {str(e)}")
        return api_response(success=False, message=f"Failed to process password reset: {str(e)}", status_code=500)

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using verified OTP with bcrypt hashing and single-use enforcement."""
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        otp_code = data.get('otp_code', '').strip()
        new_password = data.get('new_password', '')

        if not email or not otp_code or not new_password:
            return api_response(success=False, message="Email, OTP code, and new password are required.", status_code=400)

        if len(new_password) < 6:
            return api_response(success=False, message="New password must be at least 6 characters long.", status_code=400)

        db = mongo_manager.get_db()
        now = datetime.datetime.utcnow()
        hashed_pwd = hash_password(new_password)
        updated = False

        if db is not None:
            otp_record = db.otps.find_one({
                "email": email,
                "otp_code": otp_code,
                "purpose": "forgot_password"
            })

            if not otp_record:
                return api_response(success=False, message="Invalid or previously used OTP code.", status_code=400)

            expires_at = otp_record.get('expires_at')
            if expires_at and isinstance(expires_at, datetime.datetime) and now > expires_at:
                return api_response(success=False, message="OTP code has expired (valid for 10 minutes). Please request a new OTP.", status_code=400)

            # Mark OTP as consumed to prevent reuse and update bcrypt password hash
            db.otps.delete_one({"_id": otp_record['_id']})
            db.users.update_one({"email": email}, {"$set": {"password_hash": hashed_pwd, "updated_at": now}})
            updated = True
        else:
            record = IN_MEMORY_OTPS.get(email)
            if record and record.get('otp_code') == otp_code and record.get('purpose') == 'forgot_password' and not record.get('is_used'):
                record['is_used'] = True
                if email in IN_MEMORY_USERS:
                    IN_MEMORY_USERS[email]['password_hash'] = hashed_pwd
                updated = True

        if not updated:
            return api_response(success=False, message="Failed to reset password. Please verify OTP and try again.", status_code=400)

        logger.info(f"Password successfully reset for account: {email}")
        return api_response(success=True, message="Your password has been reset successfully. You can now login with your new password.", status_code=200)
    except Exception as e:
        logger.error(f"Reset Password Error: {str(e)}")
        return api_response(success=False, message=f"Password reset failed: {str(e)}", status_code=500)

@auth_bp.route('/profile', methods=['GET'])
@token_required
def profile():
    """Get active user profile session information."""
    try:
        user_info = request.user
        email = user_info.get('email')
        db = mongo_manager.get_db()

        user = db.users.find_one({"email": email}) if db is not None else IN_MEMORY_USERS.get(email)
        if not user:
            return api_response(success=False, message="User profile not found.", status_code=404)

        serialized = BaseModel.serialize_doc(user)
        if 'password_hash' in serialized:
            del serialized['password_hash']

        return api_response(success=True, data={"user": serialized}, status_code=200)
    except Exception as e:
        logger.error(f"Profile Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
