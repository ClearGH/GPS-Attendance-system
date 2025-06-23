// API service for GPS Attendance System
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Course endpoints
  async getCourses() {
    return this.request('/courses');
  }

  async getCourse(courseId) {
    return this.request(`/courses/${courseId}`);
  }

  async createCourse(courseData) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(courseId, courseData) {
    return this.request(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(courseId) {
    return this.request(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  // Session endpoints
  async getCourseSessions(courseId) {
    return this.request(`/courses/${courseId}/sessions`);
  }

  async createSession(courseId, sessionData) {
    return this.request(`/courses/${courseId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async updateSession(sessionId, sessionData) {
    return this.request(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  async deleteSession(sessionId) {
    return this.request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Attendance endpoints
  async checkIn(sessionId, latitude, longitude) {
    return this.request('/checkin', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        latitude,
        longitude,
      }),
    });
  }

  async getAttendanceHistory(courseId = null, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (courseId) {
      params.append('course_id', courseId.toString());
    }

    return this.request(`/history?${params}`);
  }

  async getAttendanceStatistics(courseId = null) {
    const params = courseId ? `?course_id=${courseId}` : '';
    return this.request(`/statistics${params}`);
  }

  async getSessionAttendance(sessionId) {
    return this.request(`/session/${sessionId}/attendance`);
  }

  async getCourseAttendanceSummary(courseId) {
    return this.request(`/course/${courseId}/attendance-summary`);
  }

  // Feedback endpoints
  async submitFeedback(courseId, rating, comment = '', isAnonymous = false) {
    return this.request(`/courses/${courseId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({
        rating,
        comment,
        is_anonymous: isAnonymous,
      }),
    });
  }

  async getCourseFeedback(courseId, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return this.request(`/courses/${courseId}/feedback?${params}`);
  }

  async getMyFeedback(courseId = null, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (courseId) {
      params.append('course_id', courseId.toString());
    }

    return this.request(`/my-feedback?${params}`);
  }

  // User management endpoints (admin only)
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  getCurrentUser() {
    if (!this.token) return null;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return {
        id: payload.user_id,
        username: payload.username,
        role: payload.role,
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }
}

export default new ApiService();

