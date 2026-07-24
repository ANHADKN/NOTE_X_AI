from flask import Blueprint, request
from app.utils.auth import token_required
from app.utils.response import api_response
from app.library.services import LibraryService
from app.utils.logger import logger

library_bp = Blueprint('library_bp', __name__, url_prefix='/api/library')

@library_bp.route('/assets', methods=['GET'])
@token_required
def get_assets():
    """Retrieve all unified library assets for active user."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        asset_type = request.args.get('type', 'all').lower()
        search_query = request.args.get('search', '').strip()

        data = LibraryService.get_user_library_assets(user_id=user_id, asset_type=asset_type, search_query=search_query)
        return api_response(success=True, data=data, status_code=200)
    except Exception as e:
        logger.error(f"Get Library Assets Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@library_bp.route('/asset/<asset_type>/<asset_id>', methods=['DELETE'])
@token_required
def delete_asset(asset_type, asset_id):
    """Delete a specific library asset."""
    try:
        res = LibraryService.delete_asset(asset_type, asset_id)
        return api_response(success=True, message="Asset deleted successfully.", status_code=200)
    except Exception as e:
        logger.error(f"Delete Library Asset Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@library_bp.route('/asset/<asset_type>/<asset_id>', methods=['PUT'])
@token_required
def rename_asset(asset_type, asset_id):
    """Rename a specific library asset."""
    try:
        data = request.get_json() or {}
        new_title = data.get('title', '').strip()
        if not new_title:
            return api_response(success=False, message="Title cannot be empty.", status_code=400)

        res = LibraryService.rename_asset(asset_type, asset_id, new_title)
        return api_response(success=True, message="Asset renamed successfully.", status_code=200)
    except Exception as e:
        logger.error(f"Rename Library Asset Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
