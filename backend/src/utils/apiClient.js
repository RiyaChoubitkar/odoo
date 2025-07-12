// Simple API client for frontend integration
class ApiClient {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint);
  }

  // POST request
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // PUT request
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Authentication methods
  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    await this.post('/auth/logout');
    this.setToken(null);
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async updateProfile(profileData) {
    const response = await this.put('/auth/profile', profileData);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  // User methods
  async searchUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/auth/users/search?${queryString}`);
  }

  async getUserById(userId) {
    return this.get(`/auth/users/${userId}`);
  }

  // Match methods
  async createMatch(matchData) {
    return this.post('/matches', matchData);
  }

  async getMatches(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/matches?${queryString}`);
  }

  async getPotentialMatches(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/matches/potential?${queryString}`);
  }

  async getMatchById(matchId) {
    return this.get(`/matches/${matchId}`);
  }

  async updateMatchStatus(matchId, status, reason = '') {
    return this.put(`/matches/${matchId}/status`, { status, reason });
  }

  async rateMatch(matchId, rating, comment = '') {
    return this.post(`/matches/${matchId}/rate`, { rating, comment });
  }

  // Message methods
  async getMessages(matchId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/messages/${matchId}?${queryString}`);
  }

  async sendMessage(messageData) {
    return this.post('/messages', messageData);
  }

  async updateMessage(messageId, message) {
    return this.put(`/messages/${messageId}`, { message });
  }

  async deleteMessage(messageId) {
    return this.delete(`/messages/${messageId}`);
  }

  async addReaction(messageId, emoji) {
    return this.post(`/messages/${messageId}/reactions`, { emoji });
  }

  async removeReaction(messageId) {
    return this.delete(`/messages/${messageId}/reactions`);
  }

  async getUnreadCount() {
    return this.get('/messages/unread/count');
  }

  // Course methods
  async getCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/courses?${queryString}`);
  }

  async getCourseById(courseId) {
    return this.get(`/courses/${courseId}`);
  }

  async createCourse(courseData) {
    return this.post('/courses', courseData);
  }

  async updateCourse(courseId, courseData) {
    return this.put(`/courses/${courseId}`, courseData);
  }

  async deleteCourse(courseId) {
    return this.delete(`/courses/${courseId}`);
  }

  async enrollInCourse(courseId) {
    return this.post(`/courses/${courseId}/enroll`);
  }

  async updateProgress(courseId, lessonId) {
    return this.put(`/courses/${courseId}/progress`, { lessonId });
  }

  async addReview(courseId, rating, comment = '') {
    return this.post(`/courses/${courseId}/reviews`, { rating, comment });
  }

  async getEnrolledCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/courses/enrolled?${queryString}`);
  }

  async getInstructorCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/courses/instructor?${queryString}`);
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient; 