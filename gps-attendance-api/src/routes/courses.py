from flask import Blueprint, jsonify, request
from datetime import datetime, date, time
from src.models.user import User, Course, ClassSession, CourseEnrollment, db
from src.routes.auth import token_required, role_required

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/courses', methods=['GET'])
@token_required
def get_courses(current_user):
    try:
        if current_user.role == 'admin':
            # Admin can see all courses
            courses = Course.query.all()
        elif current_user.role == 'instructor':
            # Instructor can see their own courses
            courses = Course.query.filter_by(instructor_id=current_user.id).all()
        else:
            # Student can see enrolled courses
            enrollments = CourseEnrollment.query.filter_by(student_id=current_user.id).all()
            course_ids = [e.course_id for e in enrollments]
            courses = Course.query.filter(Course.id.in_(course_ids)).all() if course_ids else []
        
        return jsonify([course.to_dict() for course in courses]), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch courses', 'error': str(e)}), 500

@courses_bp.route('/courses', methods=['POST'])
@token_required
@role_required(['admin'])
def create_course(current_user):
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['course_name', 'course_code', 'instructor_id']):
            return jsonify({'message': 'Course name, course code, and instructor ID are required'}), 400
        
        # Check if course code already exists
        existing_course = Course.query.filter_by(course_code=data['course_code']).first()
        if existing_course:
            return jsonify({'message': 'Course code already exists'}), 400
        
        # Verify instructor exists and has instructor role
        instructor = User.query.get(data['instructor_id'])
        if not instructor or instructor.role != 'instructor':
            return jsonify({'message': 'Invalid instructor ID'}), 400
        
        course = Course(
            course_name=data['course_name'],
            course_code=data['course_code'],
            instructor_id=data['instructor_id']
        )
        
        db.session.add(course)
        db.session.commit()
        
        return jsonify({
            'message': 'Course created successfully',
            'course': course.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Failed to create course', 'error': str(e)}), 500

@courses_bp.route('/courses/<int:course_id>', methods=['GET'])
@token_required
def get_course(current_user, course_id):
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'message': 'Course not found'}), 404
        
        # Check access permissions
        if current_user.role == 'student':
            enrollment = CourseEnrollment.query.filter_by(
                course_id=course_id,
                student_id=current_user.id
            ).first()
            if not enrollment:
                return jsonify({'message': 'Access denied'}), 403
        elif current_user.role == 'instructor' and course.instructor_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
        
        return jsonify(course.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch course', 'error': str(e)}), 500

@courses_bp.route('/courses/<int:course_id>', methods=['PUT'])
@token_required
@role_required(['admin'])
def update_course(current_user, course_id):
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'message': 'Course not found'}), 404
        
        data = request.get_json()
        
        if 'course_name' in data:
            course.course_name = data['course_name']
        
        if 'course_code' in data:
            # Check if new course code already exists (excluding current course)
            existing_course = Course.query.filter_by(course_code=data['course_code']).first()
            if existing_course and existing_course.id != course_id:
                return jsonify({'message': 'Course code already exists'}), 400
            course.course_code = data['course_code']
        
        if 'instructor_id' in data:
            instructor = User.query.get(data['instructor_id'])
            if not instructor or instructor.role != 'instructor':
                return jsonify({'message': 'Invalid instructor ID'}), 400
            course.instructor_id = data['instructor_id']
        
        if 'is_active' in data:
            course.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Course updated successfully',
            'course': course.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to update course', 'error': str(e)}), 500

@courses_bp.route('/courses/<int:course_id>', methods=['DELETE'])
@token_required
@role_required(['admin'])
def delete_course(current_user, course_id):
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'message': 'Course not found'}), 404
        
        # Soft delete by setting is_active to False
        course.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Course deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to delete course', 'error': str(e)}), 500

@courses_bp.route('/courses/<int:course_id>/enroll', methods=['POST'])
@token_required
@role_required(['admin'])
def enroll_student(current_user, course_id):
    try:
        course = Course.query.get(course_id)
        if not course or not course.is_active:
            return jsonify({'message': 'Course not found or inactive'}), 404
        
        data = request.get_json()
        if not data or 'student_id' not in data:
            return jsonify({'message': 'Student ID is required'}), 400
        
        student = User.query.get(data['student_id'])
        if not student or student.role != 'student':
            return jsonify({'message': 'Invalid student ID'}), 400
        
        # Check if already enrolled
        existing_enrollment = CourseEnrollment.query.filter_by(
            course_id=course_id,
            student_id=data['student_id']
        ).first()
        
        if existing_enrollment:
            return jsonify({'message': 'Student is already enrolled in this course'}), 400
        
        enrollment = CourseEnrollment(
            course_id=course_id,
            student_id=data['student_id']
        )
        
        db.session.add(enrollment)
        db.session.commit()
        
        return jsonify({
            'message': 'Student enrolled successfully',
            'enrollment': enrollment.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Failed to enroll student', 'error': str(e)}), 500

@courses_bp.route('/courses/<int:course_id>/sessions', methods=['GET'])
@token_required
def get_course_sessions(current_user, course_id):
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'message': 'Course not found'}), 404
        
        # Check access permissions
        if current_user.role == 'student':
            enrollment = CourseEnrollment.query.filter_by(
                course_id=course_id,
                student_id=current_user.id
            ).first()
            if not enrollment:
                return jsonify({'message': 'Access denied'}), 403
        elif current_user.role == 'instructor' and course.instructor_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
        
        sessions = ClassSession.query.filter_by(course_id=course_id).order_by(
            ClassSession.session_date.desc(),
            ClassSession.start_time.desc()
        ).all()
        
        return jsonify([session.to_dict() for session in sessions]), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch course sessions', 'error': str(e)}), 500

@courses_bp.route('/courses/<int:course_id>/sessions', methods=['POST'])
@token_required
@role_required(['instructor', 'admin'])
def create_session(current_user, course_id):
    try:
        course = Course.query.get(course_id)
        if not course or not course.is_active:
            return jsonify({'message': 'Course not found or inactive'}), 404
        
        # Check if instructor owns this course (unless admin)
        if current_user.role == 'instructor' and course.instructor_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
        
        data = request.get_json()
        required_fields = ['session_date', 'start_time', 'end_time', 'location_name', 'latitude', 'longitude']
        
        if not data or not all(k in data for k in required_fields):
            return jsonify({'message': 'All session details are required'}), 400
        
        # Parse date and time
        session_date = datetime.strptime(data['session_date'], '%Y-%m-%d').date()
        start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        
        # Validate coordinates
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        
        if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
            return jsonify({'message': 'Invalid GPS coordinates'}), 400
        
        session = ClassSession(
            course_id=course_id,
            instructor_id=course.instructor_id,
            session_date=session_date,
            start_time=start_time,
            end_time=end_time,
            location_name=data['location_name'],
            latitude=latitude,
            longitude=longitude,
            attendance_radius=data.get('attendance_radius', 50)
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'message': 'Session created successfully',
            'session': session.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'message': 'Invalid date/time format or coordinates', 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'message': 'Failed to create session', 'error': str(e)}), 500

@courses_bp.route('/sessions/<int:session_id>', methods=['PUT'])
@token_required
@role_required(['instructor', 'admin'])
def update_session(current_user, session_id):
    try:
        session = ClassSession.query.get(session_id)
        if not session:
            return jsonify({'message': 'Session not found'}), 404
        
        # Check if instructor owns this session (unless admin)
        if current_user.role == 'instructor' and session.instructor_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
        
        data = request.get_json()
        
        if 'session_date' in data:
            session.session_date = datetime.strptime(data['session_date'], '%Y-%m-%d').date()
        
        if 'start_time' in data:
            session.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        
        if 'end_time' in data:
            session.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        
        if 'location_name' in data:
            session.location_name = data['location_name']
        
        if 'latitude' in data:
            latitude = float(data['latitude'])
            if not (-90 <= latitude <= 90):
                return jsonify({'message': 'Invalid latitude'}), 400
            session.latitude = latitude
        
        if 'longitude' in data:
            longitude = float(data['longitude'])
            if not (-180 <= longitude <= 180):
                return jsonify({'message': 'Invalid longitude'}), 400
            session.longitude = longitude
        
        if 'attendance_radius' in data:
            session.attendance_radius = int(data['attendance_radius'])
        
        if 'is_active' in data:
            session.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Session updated successfully',
            'session': session.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'message': 'Invalid date/time format or coordinates', 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'message': 'Failed to update session', 'error': str(e)}), 500

@courses_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
@token_required
@role_required(['instructor', 'admin'])
def delete_session(current_user, session_id):
    try:
        session = ClassSession.query.get(session_id)
        if not session:
            return jsonify({'message': 'Session not found'}), 404
        
        # Check if instructor owns this session (unless admin)
        if current_user.role == 'instructor' and session.instructor_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Soft delete by setting is_active to False
        session.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Session deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to delete session', 'error': str(e)}), 500

