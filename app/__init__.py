import os
from flask import Flask, jsonify, render_template
from flask_cors import CORS

from app.config import Config
from app.utils.logger import setup_logger, logger
from app.utils.response import api_response
from app.models.mongo import mongo_manager
from app.auth.routes import auth_bp
from app.dashboard.routes import dashboard_bp
from app.chatbot.routes import chatbot_bp, chat_alias_bp
from app.rag.routes import rag_bp
from app.study_planner.routes import study_planner_bp
from app.notes.routes import notes_bp
from app.quiz.routes import quiz_bp
from app.flashcards.routes import flashcards_bp
from app.analytics.routes import analytics_bp
from app.admin.routes import admin_bp
from app.library.routes import library_bp

def create_app():
    """Application Factory for noteX AI Flask Server."""
    static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), 'static'))
    template_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), 'templates'))
    
    app = Flask(__name__, static_folder=static_folder, template_folder=template_folder, static_url_path="/static")
    app.config.from_object(Config)

    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": Config.ALLOWED_ORIGINS}}, supports_credentials=True)

    # Initialize Directories & Logger
    Config.init_app(app)
    setup_logger(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(chatbot_bp)
    app.register_blueprint(chat_alias_bp)
    app.register_blueprint(rag_bp)
    app.register_blueprint(study_planner_bp)
    app.register_blueprint(notes_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(flashcards_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(library_bp)

    # Health Check Endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        db_status = "connected" if mongo_manager.get_db() is not None else "fallback_mode"
        return api_response(
            success=True,
            message="noteX AI Production API Engine is running cleanly.",
            data={
                "status": "healthy",
                "version": "1.0.0",
                "environment": Config.ENV,
                "database_status": db_status,
                "supported_grades": [f"Class {i}" for i in range(1, 13)],
                "supported_subjects": [
                    "Mathematics", "Science", "Physics", "Chemistry", "Biology",
                    "English", "Malayalam", "Hindi", "Social Science", "Computer Science"
                ]
            },
            status_code=200
        )

    # Root route - serves index.html
    @app.route('/', methods=['GET'])
    def index():
        index_file = os.path.join(template_folder, 'index.html')
        if os.path.exists(index_file):
            return render_template('index.html')
        return jsonify({
            "name": "noteX AI API Engine",
            "version": "1.0.0",
            "status": "online",
            "health": "/api/health"
        })

    # Error Handlers
    @app.errorhandler(404)
    def handle_404(e):
        return api_response(success=False, message="The requested endpoint was not found.", status_code=404)

    @app.errorhandler(500)
    def handle_500(e):
        logger.error(f"Internal Error 500: {str(e)}")
        return api_response(success=False, message="An internal server error occurred.", status_code=500)

    return app
