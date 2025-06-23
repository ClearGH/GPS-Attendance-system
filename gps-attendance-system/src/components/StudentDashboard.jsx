import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  LogOut,
  User,
  BookOpen,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '../hooks/useAuth'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Mock data for demonstration
  const [attendanceData] = useState({
    totalClasses: 45,
    attendedClasses: 41,
    percentage: 91
  })

  const [recentAttendance] = useState([
    { id: 1, course: 'Database Systems', date: '2024-06-17', status: 'present', time: '10:00 AM' },
    { id: 2, course: 'Web Development', date: '2024-06-16', status: 'present', time: '2:00 PM' },
    { id: 3, course: 'Data Structures', date: '2024-06-15', status: 'late', time: '9:15 AM' },
    { id: 4, course: 'Computer Networks', date: '2024-06-14', status: 'absent', time: '-' },
    { id: 5, course: 'Database Systems', date: '2024-06-13', status: 'present', time: '10:00 AM' }
  ])

  const [upcomingClasses] = useState([
    { id: 1, course: 'Database Systems', time: '10:00 AM', instructor: 'Dr. Smith', room: 'Room 101' },
    { id: 2, course: 'Web Development', time: '2:00 PM', instructor: 'Prof. Johnson', room: 'Lab 205' }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCheckIn = () => {
    navigate('/checkin')
  }

  const handleLogout = () => {
    logout()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600'
      case 'late':
        return 'text-yellow-600'
      case 'absent':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">GPS Attendance</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {currentTime.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Check-in */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Quick Check-in
              </CardTitle>
              <CardDescription>
                Check in to your current class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCheckIn}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Check In Now
              </Button>
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Attendance Overview
              </CardTitle>
              <CardDescription>
                Your attendance statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {attendanceData.percentage}%
                </div>
                <div className="text-sm text-gray-600">
                  {attendanceData.attendedClasses} of {attendanceData.totalClasses} classes
                </div>
              </div>
              <Progress value={attendanceData.percentage} className="h-2" />
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {attendanceData.attendedClasses}
                  </div>
                  <div className="text-xs text-gray-600">Present</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">2</div>
                  <div className="text-xs text-gray-600">Late</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">
                    {attendanceData.totalClasses - attendanceData.attendedClasses}
                  </div>
                  <div className="text-xs text-gray-600">Absent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Recent Attendance
              </CardTitle>
              <CardDescription>
                Your latest attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <div className="font-medium text-gray-900">{record.course}</div>
                        <div className="text-sm text-gray-600">{record.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium capitalize ${getStatusColor(record.status)}`}>
                        {record.status}
                      </div>
                      <div className="text-sm text-gray-600">{record.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                Today's Classes
              </CardTitle>
              <CardDescription>
                Your scheduled classes for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingClasses.map((classItem) => (
                  <div key={classItem.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{classItem.course}</div>
                        <div className="text-sm text-gray-600">{classItem.instructor}</div>
                        <div className="text-sm text-gray-600">{classItem.room}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-blue-600">{classItem.time}</div>
                        <Button size="sm" variant="outline" className="mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          Check In
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Feedback Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-600" />
              Course Feedback
            </CardTitle>
            <CardDescription>
              Share your feedback about your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Help improve your courses by providing feedback</p>
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

