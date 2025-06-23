# GPS-Based Class Attendance and Student Feedback Review System

A comprehensive web application for universities and schools that enables GPS-based class attendance tracking and student feedback collection. The system supports three user roles: student, instructor, and administrator, each with their own dashboard and relevant functionality.

## 🚀 Features

### Authentication & Roles
- ✅ Secure login/logout system with JWT tokens
- ✅ Role-based dashboards: Student, Instructor, Admin
- ✅ Password hashing and secure authentication

### Student Features
- ✅ GPS-based attendance check-in with location verification
- ✅ Attendance history view with detailed records
- ✅ Submit structured course feedback (rating + comment)
- ✅ Anonymous feedback option
- ✅ Real-time attendance statistics

### Instructor Features
- ✅ Create class sessions with GPS location selection
- ✅ View real-time student attendance records
- ✅ Access feedback reports per course
- ✅ Analyze student engagement trends
- ✅ Comprehensive course management

### Admin Features
- ✅ Manage users (add/edit/delete students and instructors)
- ✅ Create and manage courses
- ✅ View system-wide attendance and feedback analytics
- ✅ Export data reports for analysis

### System-Wide Features
- ✅ GPS validation using Haversine formula for distance calculation
- ✅ Data analytics for attendance patterns
- ✅ Responsive UI (mobile & desktop friendly)
- ✅ Secure API integration for frontend/backend
- ✅ Cloud-ready architecture

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: JWT token-based
- **Location Services**: Browser Geolocation API

### Backend (Flask)
- **Framework**: Flask with SQLAlchemy
- **Database**: SQLite (easily replaceable with PostgreSQL/MySQL)
- **Authentication**: JWT tokens with PyJWT
- **API**: RESTful API with CORS support
- **Security**: Password hashing with Werkzeug

## 📁 Project Structure

```
├── gps-attendance-system/          # React Frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API service layer
│   │   └── assets/                # Static assets
│   ├── public/
│   └── package.json
│
├── gps-attendance-api/             # Flask Backend
│   ├── src/
│   │   ├── models/                # Database models
│   │   ├── routes/                # API endpoints
│   │   └── database/              # SQLite database
│   ├── venv/                      # Python virtual environment
│   └── requirements.txt
│
└── Design Assets/                  # UI mockups and design files
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.11+
- Git

### Backend Setup (Flask API)

1. **Navigate to the API directory:**
   ```bash
   cd gps-attendance-api
   ```

2. **Activate virtual environment:**
   ```bash
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Flask server:**
   ```bash
   python src/main.py
   ```
   
   The API will be available at `http://localhost:5000`

### Frontend Setup (React App)

1. **Navigate to the frontend directory:**
   ```bash
   cd gps-attendance-system
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or npm install
   ```

3. **Start the development server:**
   ```bash
   pnpm run dev
   # or npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

## 👥 Default User Accounts

The system comes with pre-configured demo accounts:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Student | `student1` | `password` | John Doe - Sample student account |
| Instructor | `instructor1` | `password` | Dr. Sarah Smith - Sample instructor |
| Admin | `admin1` | `password` | System administrator |

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Courses
- `GET /api/courses` - Get user's courses
- `POST /api/courses` - Create new course (admin)
- `GET /api/courses/{id}` - Get course details
- `PUT /api/courses/{id}` - Update course (admin)

### Sessions
- `GET /api/courses/{id}/sessions` - Get course sessions
- `POST /api/courses/{id}/sessions` - Create new session
- `PUT /api/sessions/{id}` - Update session
- `DELETE /api/sessions/{id}` - Delete session

### Attendance
- `POST /api/checkin` - GPS-based check-in
- `GET /api/history` - Get attendance history
- `GET /api/statistics` - Get attendance statistics
- `GET /api/session/{id}/attendance` - Get session attendance (instructor/admin)

### Feedback
- `POST /api/courses/{id}/feedback` - Submit feedback
- `GET /api/courses/{id}/feedback` - Get course feedback (instructor/admin)
- `GET /api/my-feedback` - Get user's feedback history

## 🌍 GPS Location Features

### Location Verification
- Uses Haversine formula for accurate distance calculation
- Configurable attendance radius (default: 50 meters)
- Real-time location detection using browser geolocation
- Distance validation before allowing check-in

### Privacy & Security
- Location data is only stored for attendance verification
- No continuous location tracking
- Secure transmission of GPS coordinates
- User consent required for location access

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop computers (1920x1080+)
- Tablets (768px - 1024px)
- Mobile phones (320px - 767px)
- Touch-friendly interface elements
- Optimized GPS functionality for mobile devices

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Werkzeug password hashing
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Role-based Access Control**: Proper authorization checks
- **SQL Injection Prevention**: SQLAlchemy ORM protection

## 🚀 Deployment Options

### Local Development
Both servers can run locally for development and testing.

### Cloud Deployment
The application is designed to be cloud-ready and can be deployed on:
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, Google Cloud Platform, DigitalOcean
- **Database**: PostgreSQL, MySQL, or managed database services

### Docker Deployment
The application can be containerized using Docker for easy deployment.

## 📊 Database Schema

### Users Table
- User authentication and profile information
- Role-based access control (student, instructor, admin)
- Password hashing and security features

### Courses Table
- Course information and instructor assignments
- Course enrollment management
- Active/inactive status tracking

### Class Sessions Table
- Session scheduling and location data
- GPS coordinates and attendance radius
- Session management and tracking

### Attendance Records Table
- GPS-based check-in records
- Attendance status (present, late, absent)
- Location verification data

### Feedback Table
- Course feedback and ratings
- Anonymous feedback support
- Comment and rating system

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///app.db
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=http://localhost:5173
```

### Frontend Configuration
Update `src/services/api.js` for production:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Flask-CORS is properly configured
2. **Location Access**: Check browser permissions for geolocation
3. **Database Issues**: Verify SQLite file permissions
4. **Token Expiration**: Implement token refresh mechanism

### Development Tips

1. **API Testing**: Use tools like Postman or curl for API testing
2. **Database Inspection**: Use SQLite browser for database inspection
3. **Logging**: Enable Flask debug mode for detailed error logs
4. **Network Issues**: Check firewall settings for local development

## 📈 Future Enhancements

### Planned Features
- [ ] Multi-factor authentication (MFA)
- [ ] Advanced analytics and reporting
- [ ] Email notifications for attendance
- [ ] Bulk user import/export
- [ ] Integration with Learning Management Systems
- [ ] Mobile app development
- [ ] Advanced GPS features (geofencing)
- [ ] Attendance reports in PDF/CSV format

### Scalability Improvements
- [ ] Database optimization and indexing
- [ ] Caching layer implementation
- [ ] Load balancing for high traffic
- [ ] Microservices architecture
- [ ] Real-time notifications with WebSockets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🙏 Acknowledgments

- React team for the excellent frontend framework
- Flask team for the lightweight backend framework
- Tailwind CSS for the utility-first CSS framework
- All contributors and testers

---

**Built with ❤️ for educational institutions worldwide**

