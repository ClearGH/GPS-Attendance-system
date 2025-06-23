from flask import Blueprint, jsonify, request
from datetime import datetime, date, time
import math
from src.models.user import User, Course, ClassSession, AttendanceRecord, CourseEnrollment, db
from src.routes.auth import token_required, role_required

attendance_bp = Blueprint('attendance', __name__)

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two GPS coordinates using Haversine formula"""
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat/2) * math.sin(delta_lat/2) + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * 
         math.sin(delta_lon/2) * math.sin(delta_lon/2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c  # Distance in meters

@attendance_bp.route('/checkin', methods=['POST'])
@token_required
@role_required(['student'])
def check_in(current_user):
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['session_id', 'latitude', 'longitude']):
            return jsonify({'message': 'Session ID, latitude, and longitude are required'}), 400
        
        session = ClassSession.query.get(data['session_id'])
        if not session or not session.is_active:
            return jsonify({'message': 'Invalid or inactive session'}), 404
        
        # Check if student is enrolled in the course
        enrollment = CourseEnrollment.query.filter_by(
            course_id=session.course_id,
            student_id=current_user.id
        ).first()
        
        if not enrollment:
            return jsonify({'message': 'You are not enrolled in this course'}), 403
        
        # Check if student has already checked in for this session
        existing_record = AttendanceRecord.query.filter_by(
            session_id=session.id,
            student_id=current_user.id
        ).first()
        
        if existing_record:
            return jsonify({'message': 'You have already checked in for this session'}), 400
        
        # Calculate distance from session location
        distance = calculate_distance(
            data['latitude'], data['longitude'],
            session.latitude, session.longitude
        )
        
        # Check if student is within the allowed radius
        if distance > session.attendance_radius:
            return jsonify({
                'message': f'You are {int(distance)}m away from the class location. You need to be within {session.attendance_radius}m to check in.',
                'distance': int(distance),
                'required_radius': session.attendance_radius
            }), 400
        
        # Determine attendance status based on time
        current_time = datetime.now().time()
        session_start = session.start_time
        
        # Consider late if more than 15 minutes after start time
        late_threshold = datetime.combine(date.today(), session_start).replace(minute=session_start.minute + 15)
        
        if current_time <= session_start:
            status = 'present'
        elif current_time <= late_threshold.time():
            status = 'late'
        else:
            status = 'present'  # Still mark as present if they check in
        
        # Create attendance record
        attendance_record = AttendanceRecord(
            session_id=session.id,
            student_id=current_user.id,
            check_in_time=datetime.utcnow(),
            latitude=data['latitude'],
            longitude=data['longitude'],
            status=status
        )
        
        db.session.add(attendance_record)
        db.session.commit()
        
        return jsonify({
            'message': 'Check-in successful',
            'status': status,
            'distance': int(distance),
            'check_in_time': attendance_record.check_in_time.isoformat(),
            'attendance_record': attendance_record.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Check-in failed', 'error': str(e)}), 500

@attendance_bp.route('/history', methods=['GET'])
@token_required
@role_required(['student'])
def get_attendance_history(current_user):
    try:
        # Get query parameters
        course_id = request.args.get('course_id', type=int)
        limit = request.args.get('limit', default=50, type=int)
        offset = request.args.get('offset', default=0, type=int)
        
        # Build query
        query = AttendanceRecord.query.filter_by(student_id=current_user.id)
        
        if course_id:
            # Filter by course through session
            query = query.join(ClassSession).filter(ClassSession.course_id == course_id)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination and ordering
        attendance_records = query.order_by(AttendanceRecord.created_at.desc()).offset(offset).limit(limit).all()
        
        # Format response with additional information
        records_with_details = []
        for record in attendance_records:
            record_dict = record.to_dict()
            record_dict['course_name'] = record.session.course.course_name
            record_dict['course_code'] = record.session.course.course_code
            record_dict['session_date'] = record.session.session_date.isoformat()
            record_dict['session_time'] = f"{record.session.start_time} - {record.session.end_time}"
            records_with_details.append(record_dict)
        
        return jsonify({
            'attendance_records': records_with_details,
            'total_count': total_count,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch attendance history', 'error': str(e)}), 500

@attendance_bp.route('/statistics', methods=['GET'])
@token_required
@role_required(['student'])
def get_attendance_statistics(current_user):
    try:
        course_id = request.args.get('course_id', type=int)
        
        # Build base query
        query = AttendanceRecord.query.filter_by(student_id=current_user.id)
        
        if course_id:
            query = query.join(ClassSession).filter(ClassSession.course_id == course_id)
        
        # Get all attendance records
        records = query.all()
        
        # Calculate statistics
        total_sessions = len(records)
        present_count = len([r for r in records if r.status == 'present'])
        late_count = len([r for r in records if r.status == 'late'])
        absent_count = len([r for r in records if r.status == 'absent'])
        
        attendance_percentage = (present_count + late_count) / total_sessions * 100 if total_sessions > 0 else 0
        
        return jsonify({
            'total_sessions': total_sessions,
            'present_count': present_count,
            'late_count': late_count,
            'absent_count': absent_count,
            'attendance_percentage': round(attendance_percentage, 2)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch attendance statistics', 'error': str(e)}), 500

@attendance_bp.route('/session/<int:session_id>/attendance', methods=['GET'])
@token_required
@role_required(['instructor', 'admin'])
def get_session_attendance(current_user, session_id):
    try:
        session = ClassSession.query.get(session_id)
        if not session:
            return jsonify({'message': 'Session not found'}), 404
        
        # Check if instructor owns this session (unless admin)
        if current_user.role == 'instructor' and session.instructor_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Get all enrolled students for this course
        enrolled_students = db.session.query(User).join(CourseEnrollment).filter(
            CourseEnrollment.course_id == session.course_id
        ).all()
        
        # Get attendance records for this session
        attendance_records = AttendanceRecord.query.filter_by(session_id=session_id).all()
        attendance_dict = {record.student_id: record for record in attendance_records}
        
        # Build response with all students and their attendance status
        student_attendance = []
        for student in enrolled_students:
            record = attendance_dict.get(student.id)
            student_info = {
                'student_id': student.id,
                'student_name': f"{student.first_name} {student.last_name}",
                'student_email': student.email,
                'status': record.status if record else 'absent',
                'check_in_time': record.check_in_time.isoformat() if record else None,
                'distance': None
            }
            
            if record:
                # Calculate distance for checked-in students
                distance = calculate_distance(
                    record.latitude, record.longitude,
                    session.latitude, session.longitude
                )
                student_info['distance'] = int(distance)
            
            student_attendance.append(student_info)
        
        # Calculate summary statistics
        total_students = len(enrolled_students)
        present_count = len([s for s in student_attendance if s['status'] == 'present'])
        late_count = len([s for s in student_attendance if s['status'] == 'late'])
        absent_count = len([s for s in student_attendance if s['status'] == 'absent'])
        
        return jsonify({
            'session': session.to_dict(),
            'student_attendance': student_attendance,
            'summary': {
                'total_students': total_students,
                'present_count': present_count,
                'late_count': late_count,
                'absent_count': absent_count,
                'attendance_percentage': round((present_count + late_count) / total_students * 100, 2) if total_students > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch session attendance', 'error': str(e)}), 500

@attendance_bp.route('/course/<int:course_id>/attendance-summary', methods=['GET'])
@token_required
@role_required(['instructor', 'admin'])
def get_course_attendance_summary(current_user, course_id):
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'message': 'Course not found'}), 404
        
        # Check if instructor owns this course (unless admin)
        if current_user.role == 'instructor' and course.instructor_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Get all sessions for this course
        sessions = ClassSession.query.filter_by(course_id=course_id).all()
        
        # Get all attendance records for this course
        attendance_records = db.session.query(AttendanceRecord).join(ClassSession).filter(
            ClassSession.course_id == course_id
        ).all()
        
        # Calculate summary statistics
        total_sessions = len(sessions)
        total_records = len(attendance_records)
        present_count = len([r for r in attendance_records if r.status == 'present'])
        late_count = len([r for r in attendance_records if r.status == 'late'])
        absent_count = len([r for r in attendance_records if r.status == 'absent'])
        
        # Get enrolled student count
        enrolled_count = CourseEnrollment.query.filter_by(course_id=course_id).count()
        
        return jsonify({
            'course': course.to_dict(),
            'total_sessions': total_sessions,
            'enrolled_students': enrolled_count,
            'total_attendance_records': total_records,
            'present_count': present_count,
            'late_count': late_count,
            'absent_count': absent_count,
            'overall_attendance_percentage': round((present_count + late_count) / total_records * 100, 2) if total_records > 0 else 0
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch course attendance summary', 'error': str(e)}), 500

