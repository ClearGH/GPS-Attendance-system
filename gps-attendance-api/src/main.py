import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db, User
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.courses import courses_bp
from src.routes.attendance import attendance_bp
from src.routes.feedback import feedback_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'gps-attendance-system-secret-key-2024'

# Enable CORS for all routes
CORS(app, origins=["*"])

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(courses_bp, url_prefix='/api')
app.register_blueprint(attendance_bp, url_prefix='/api')
app.register_blueprint(feedback_bp, url_prefix='/api')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def create_sample_data():
    """Create sample users and data for testing"""
    
    # Check if sample data already exists
    if User.query.first():
        return
    
    # Create sample admin
    admin = User(
        username='admin1',
        email='admin@university.edu',
        role='admin',
        first_name='Admin',
        last_name='User',
        is_active=True
    )
    admin.set_password('password')
    
    # Create sample instructor
    instructor = User(
        username='instructor1',
        email='sarah.smith@university.edu',
        role='instructor',
        first_name='Sarah',
        last_name='Smith',
        is_active=True
    )
    instructor.set_password('password')
    
    # Create sample student
    student = User(
        username='student1',
        email='john.doe@university.edu',
        role='student',
        first_name='John',
        last_name='Doe',
        is_active=True
    )
    student.set_password('password')
    
    # Add users to session
    db.session.add(admin)
    db.session.add(instructor)
    db.session.add(student)
    db.session.commit()
    
    print("Sample data created successfully!")

with app.app_context():
    db.create_all()
    create_sample_data()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'healthy', 'message': 'GPS Attendance API is running'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

