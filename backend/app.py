import os
from flask import Flask, jsonify
from flask_cors import CORS

from backend.config import Config
from backend.utils.logger import setup_logger, logger
from backend.utils.response import api_response
from backend.database.mongo import mongo_manager
from backend.routes.auth_routes import auth_bp

def create_app():
    """Application Factory for noteX AI Flask Server."""
    app = Flask(__name__, static_folder="../frontend", static_url_path="")
    app.config.from_object(Config)

    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": Config.ALLOWED_ORIGINS}}, supports_credentials=True)

    # Initialize Logging & Config Directories
    Config.init_app(app)
    setup_logger(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)

    # Health Check Endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        db_status = "connected" if mongo_manager.get_db() is not None else "fallback_mode"
        return api_response(
            success=True,
            message="noteX AI API Server is running cleanly.",
            data={
                "status": "healthy",
                "environment": Config.ENV,
                "database_status": db_status,
                "supported_grades": [f"Class {i}" for i in range(1, 13)]
            },
            status_code=200
        )

    # Serve SPA static index page if available
    @app.route('/', methods=['GET'])
    def index():
        frontend_index = os.path.join(app.static_folder, 'index.html')
        if os.path.exists(frontend_index):
            return app.send_static_file('index.html')
        return jsonify({
            "name": "noteX AI API Engine",
            "version": "1.0.0",
            "status": "online",
            "docs": "/api/health"
        })

    # Centralized Error Handlers
    @app.errorhandler(404)
    def handle_404(e):
        return api_response(success=False, message="The requested resource or endpoint was not found.", status_code=404)

    @app.errorhandler(405)
    def handle_405(e):
        return api_response(success=False, message="Method not allowed for this endpoint.", status_code=405)

    @app.errorhandler(500)
    def handle_500(e):
        logger.error(f"Server Error 500: {str(e)}")
        return api_response(success=False, message="An internal server error occurred. Please try again later.", status_code=500)

    return app

app = create_app()

if __name__ == '__main__':
    logger.info(f"Starting noteX AI Backend Server on port {Config.PORT}...")
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
