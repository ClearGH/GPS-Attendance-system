from flask import Blueprint, jsonify, request
from src.models.user import User, Course, Feedback, CourseEnrollment, db
from src.routes.auth import token_required, role_required

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/courses/<int:course_id>/feedback', methods=['POST'])
@token_required
@role_required(['student'])
def submit_feedback(current_user, course_id):
    try:
        course = Course.query.get(course_id)
        if not course or not course.is_active:
            return jsonify({'message': 'Course not found or inactive'}), 404
        
        # Check if student is enrolled in the course
        enrollment = CourseEnrollment.query.filter_by(
            course_id=course_id,
            student_id=current_user.id
        ).first()
        
        if not enrollment:
            return jsonify({'message': 'You are not enrolled in this course'}), 403
        
        data = request.get_json()
        
        if not data or 'rating' not in data:
            return jsonify({'message': 'Rating is required'}), 400
        
        rating = int(data['rating'])
        if not (1 <= rating <= 5):
            return jsonify({'message': 'Rating must be between 1 and 5'}), 400
        
        is_anonymous = data.get('is_anonymous', False)
        
        feedback = Feedback(
            course_id=course_id,
            student_id=None if is_anonymous else current_user.id,
            rating=rating,
            comment=data.get('comment', ''),
            is_anonymous=is_anonymous
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback submitted successfully',
            'feedback': feedback.to_dict()
        }), 201
        
    except ValueError:
        return jsonify({'message': 'Invalid rating value'}), 400
    except Exception as e:
        return jsonify({'message': 'Failed to submit feedback', 'error': str(e)}), 500

@feedback_bp.route('/courses/<int:course_id>/feedback', methods=['GET'])
@token_required
@role_required(['instructor', 'admin'])
def get_course_feedback(current_user, course_id):
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'message': 'Course not found'}), 404
        
        # Check if instructor owns this course (unless admin)
        if current_user.role == 'instructor' and course.instructor_id != current_user.id:
            return jsonify({'message': 'Access denied'}), 403
        
        # Get query parameters
        limit = request.args.get('limit', default=50, type=int)
        offset = request.args.get('offset', default=0, type=int)
        
        # Get feedback with pagination
        feedback_query = Feedback.query.filter_by(course_id=course_id)
        total_count = feedback_query.count()
        
        feedback_list = feedback_query.order_by(Feedback.created_at.desc()).offset(offset).limit(limit).all()
        
        # Format response with student names for non-anonymous feedback
        feedback_with_details = []
        for feedback in feedback_list:
            feedback_dict = feedback.to_dict()
            if not feedback.is_anonymous and feedback.student:
                feedback_dict['student_name'] = f"{feedback.student.first_name} {feedback.student.last_name}"
            else:
                feedback_dict['student_name'] = 'Anonymous'
            feedback_with_details.append(feedback_dict)
        
        # Calculate summary statistics
        all_feedback = Feedback.query.filter_by(course_id=course_id).all()
        total_feedback = len(all_feedback)
        
        if total_feedback > 0:
            average_rating = sum(f.rating for f in all_feedback) / total_feedback
            rating_distribution = {i: len([f for f in all_feedback if f.rating == i]) for i in range(1, 6)}
        else:
            average_rating = 0
            rating_distribution = {i: 0 for i in range(1, 6)}
        
        return jsonify({
            'feedback': feedback_with_details,
            'total_count': total_count,
            'limit': limit,
            'offset': offset,
            'summary': {
                'total_feedback': total_feedback,
                'average_rating': round(average_rating, 2),
                'rating_distribution': rating_distribution
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch course feedback', 'error': str(e)}), 500

@feedback_bp.route('/feedback/<int:feedback_id>', methods=['DELETE'])
@token_required
@role_required(['admin'])
def delete_feedback(current_user, feedback_id):
    try:
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'message': 'Feedback not found'}), 404
        
        db.session.delete(feedback)
        db.session.commit()
        
        return jsonify({'message': 'Feedback deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to delete feedback', 'error': str(e)}), 500

@feedback_bp.route('/my-feedback', methods=['GET'])
@token_required
@role_required(['student'])
def get_my_feedback(current_user):
    try:
        # Get query parameters
        course_id = request.args.get('course_id', type=int)
        limit = request.args.get('limit', default=50, type=int)
        offset = request.args.get('offset', default=0, type=int)
        
        # Build query
        query = Feedback.query.filter_by(student_id=current_user.id)
        
        if course_id:
            query = query.filter_by(course_id=course_id)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination and ordering
        feedback_list = query.order_by(Feedback.created_at.desc()).offset(offset).limit(limit).all()
        
        # Format response with course information
        feedback_with_details = []
        for feedback in feedback_list:
            feedback_dict = feedback.to_dict()
            feedback_dict['course_name'] = feedback.course.course_name
            feedback_dict['course_code'] = feedback.course.course_code
            feedback_with_details.append(feedback_dict)
        
        return jsonify({
            'feedback': feedback_with_details,
            'total_count': total_count,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch your feedback', 'error': str(e)}), 500

