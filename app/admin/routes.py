from flask import Blueprint, request
from app.utils.auth import verify_password, generate_tokens, token_required
from app.utils.response import api_response
from app.admin.services import AdminService
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.utils.logger import logger

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/admin')

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    """Isolated Admin Login Endpoint."""
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        if not email or not password:
            return api_response(success=False, message="Email and password are required.", status_code=400)

        db = mongo_manager.get_db()
        user_doc = None
        if db is not None:
            user_doc = db.users.find_one({"email": email})
        else:
            from app.auth.routes import IN_MEMORY_USERS
            for k, v in IN_MEMORY_USERS.items():
                if v.get('email') == email:
                    user_doc = v
                    break

        if not user_doc or not verify_password(password, user_doc.get('password_hash', '')):
            return api_response(success=False, message="Invalid admin credentials.", status_code=401)

        if user_doc.get('role') != 'admin':
            return api_response(success=False, message="Access Denied: Admin role required.", status_code=403)

        serialized_user = BaseModel.serialize_doc(user_doc)
        access_token, refresh_token = generate_tokens(user_id=serialized_user['id'], email=serialized_user['email'], role='admin')

        return api_response(
            success=True,
            message="Admin authentication successful!",
            data={"access_token": access_token, "refresh_token": refresh_token, "user": serialized_user},
            status_code=200
        )
    except Exception as e:
        logger.error(f"Admin Login Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@admin_bp.route('/stats', methods=['GET'])
@token_required
def get_stats():
    """Retrieve platform system overview for Admin Dashboard."""
    try:
        user_info = request.user
        if user_info.get('role') != 'admin':
            return api_response(success=False, message="Unauthorized. Admin role required.", status_code=403)

        stats = AdminService.get_system_stats()
        return api_response(success=True, data={"stats": stats}, status_code=200)
    except Exception as e:
        logger.error(f"Admin Stats Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@admin_bp.route('/users', methods=['GET'])
@token_required
def list_users():
    """List registered platform users."""
    try:
        user_info = request.user
        if user_info.get('role') != 'admin':
            return api_response(success=False, message="Unauthorized. Admin role required.", status_code=403)

        users = AdminService.list_all_users()
        return api_response(success=True, data={"users": users}, status_code=200)
    except Exception as e:
        logger.error(f"Admin Users Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@admin_bp.route('/user/<user_id>/status', methods=['PUT'])
@token_required
def toggle_user(user_id):
    """Toggle user active status."""
    try:
        user_info = request.user
        if user_info.get('role') != 'admin':
            return api_response(success=False, message="Unauthorized. Admin role required.", status_code=403)

        data = request.get_json() or {}
        is_active = bool(data.get('is_active', True))

        res = AdminService.toggle_user_status(user_id, is_active)
        return api_response(success=True, message=f"User status updated.", data=res, status_code=200)
    except Exception as e:
        logger.error(f"Admin Toggle User Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@admin_bp.route('/logs', methods=['GET'])
@token_required
def get_logs():
    """Retrieve system activity logs."""
    try:
        user_info = request.user
        if user_info.get('role') != 'admin':
            return api_response(success=False, message="Unauthorized. Admin role required.", status_code=403)

        logs = AdminService.get_system_logs()
        return api_response(success=True, data={"logs": logs}, status_code=200)
    except Exception as e:
        logger.error(f"Admin Logs Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
