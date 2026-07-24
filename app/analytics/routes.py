from flask import Blueprint, request
from app.utils.auth import token_required
from app.utils.response import api_response
from app.analytics.services import AnalyticsService
from app.ml.mastery_engine import AIMasteryEngine
from app.utils.logger import logger

analytics_bp = Blueprint('analytics_bp', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/overview', methods=['GET'])
@token_required
def get_overview():
    """Retrieve high-level AI Analytics (Mastery, Retention, Predicted Score, Streak)."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')

        data = AnalyticsService.get_user_analytics(user_id)
        return api_response(success=True, data={"analytics": data}, status_code=200)
    except Exception as e:
        logger.error(f"Get Analytics Overview Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@analytics_bp.route('/weak-topics', methods=['GET'])
@token_required
def get_weak_topics():
    """Retrieve weak vs strong topics classified by ML model."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')

        data = AnalyticsService.get_user_analytics(user_id)
        return api_response(
            success=True,
            data={
                "weak_topics": data.get("weak_topics", []),
                "moderate_topics": data.get("moderate_topics", []),
                "strong_topics": data.get("strong_topics", [])
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Get Weak Topics Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@analytics_bp.route('/predict-performance', methods=['GET'])
@token_required
def predict_performance():
    """Retrieve ML predicted exam performance and grade letter."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')

        data = AnalyticsService.get_user_analytics(user_id)
        return api_response(
            success=True,
            data={
                "predicted_score": data.get("predicted_score"),
                "predicted_grade": data.get("predicted_grade"),
                "confidence_level": data.get("confidence_level"),
                "recommendations": data.get("recommendations", [])
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Predict Performance Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@analytics_bp.route('/charts-data', methods=['GET'])
@token_required
def get_charts_data():
    """Retrieve time-series data for Chart.js graphs."""
    try:
        chart_data = AIMasteryEngine.get_chart_data()
        return api_response(success=True, data={"charts": chart_data}, status_code=200)
    except Exception as e:
        logger.error(f"Get Charts Data Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
