import { useState, useEffect } from 'react'
import {
  MapPin,
  Users,
  Calendar,
  BarChart3,
  Download,
  LogOut,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Navigation,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '../hooks/useAuth'

export default function InstructorDashboard() {
  const { user, logout } = useAuth()
  const [activeSession, setActiveSession] = useState(null)
  const [sessionLocation, setSessionLocation] = useState(null)
  const [isSettingLocation, setIsSettingLocation] = useState(false)
  const [locationRadius, setLocationRadius] = useState(50) // meters

  // Mock data for demonstration
  const [courses] = useState([
    {
      id: 1,
      name: 'Database Systems',
      code: 'CS301',
      students: 45,
      schedule: 'MWF 10:00-11:30 AM',
      room: 'Room 101'
    },
    {
      id: 2,
      name: 'Web Development',
      code: 'CS401',
      students: 38,
      schedule: 'TTh 2:00-3:30 PM',
      room: 'Lab 205'
    }
  ])

  const [liveAttendance] = useState([
    { id: 1, name: 'John Doe', checkInTime: '10:02 AM', status: 'present' },
    { id: 2, name: 'Jane Smith', checkInTime: '10:05 AM', status: 'present' },
    { id: 3, name: 'Mike Johnson', checkInTime: '10:15 AM', status: 'late' },
    { id: 4, name: 'Sarah Wilson', checkInTime: '-', status: 'absent' },
    { id: 5, name: 'David Brown', checkInTime: '10:01 AM', status: 'present' }
  ])

  const [attendanceStats] = useState({
    totalStudents: 45,
    present: 35,
    late: 3,
    absent: 7,
    percentage: 84
  })

  const [feedbackSummary] = useState([
    { course: 'Database Systems', rating: 4.5, responses: 42, sentiment: 'positive' },
    { course: 'Web Development', rating: 4.2, responses: 35, sentiment: 'positive' }
  ])

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }

  const handleSetLocation = async () => {
    setIsSettingLocation(true)
    try {
      const location = await getCurrentLocation()
      setSessionLocation({
        ...location,
        radius: locationRadius,
        timestamp: new Date().toISOString()
      })
      alert(`Location set successfully!\nLatitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}\nRadius: ${locationRadius}m`)
    } catch (error) {
      alert(`Failed to get location: ${error.message}`)
    } finally {
      setIsSettingLocation(false)
    }
  }

  const handleStartSession = async (courseId) => {
    if (!sessionLocation) {
      alert('Please set the class location first before starting the session.')
      return
    }

    setActiveSession(courseId)
    // In a real app, this would make an API call to start the session with the location
    console.log('Starting session with location:', sessionLocation)
  }

  const handleEndSession = () => {
    setActiveSession(null)
    setSessionLocation(null)
    // In a real app, this would make an API call to end the session
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
              <h1 className="text-xl font-semibold text-gray-900">Instructor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
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
            Welcome, {user?.firstName}!
          </h2>
          <p className="text-gray-600">
            Manage your classes and monitor student attendance
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Live Attendance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Location Setup Card */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Class Location Setup
                </CardTitle>
                <CardDescription>
                  Set the GPS location for your class session. Students will need to be within this area to check in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor="radius">Check-in Radius (meters)</Label>
                    <Input
                      id="radius"
                      type="number"
                      value={locationRadius}
                      onChange={(e) => setLocationRadius(parseInt(e.target.value) || 50)}
                      min="10"
                      max="500"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button
                      onClick={handleSetLocation}
                      disabled={isSettingLocation}
                      className="w-full"
                    >
                      {isSettingLocation ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 mr-2" />
                          Set Current Location as Class Location
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {sessionLocation && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Location Set Successfully</span>
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Lat: {sessionLocation.latitude.toFixed(6)}, Lng: {sessionLocation.longitude.toFixed(6)}, Radius: {sessionLocation.radius}m
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{course.name}</span>
                      <span className="text-sm font-normal text-gray-600">{course.code}</span>
                    </CardTitle>
                    <CardDescription>
                      {course.schedule} • {course.room}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">{course.students} students</span>
                      </div>
                      {activeSession === course.id && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-medium">Live</span>
                        </div>
                      )}
                    </div>

                    {activeSession === course.id ? (
                      <Button
                        onClick={handleEndSession}
                        variant="destructive"
                        className="w-full"
                      >
                        End Session
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleStartSession(course.id)}
                        className="w-full"
                        disabled={!sessionLocation}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Start Class Session
                      </Button>
                    )}

                    {!sessionLocation && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Set class location first to start session
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">83</p>
                      <p className="text-sm text-gray-600">Total Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">24</p>
                      <p className="text-sm text-gray-600">Classes This Week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">87%</p>
                      <p className="text-sm text-gray-600">Avg Attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">4.3</p>
                      <p className="text-sm text-gray-600">Avg Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            {activeSession ? (
              <>
                {/* Session Info */}
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      Active Session - Database Systems
                    </CardTitle>
                    <CardDescription>
                      Students can check in within {sessionLocation?.radius}m of the set location
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-green-700">
                      <strong>Location:</strong> Lat: {sessionLocation?.latitude.toFixed(6)}, Lng: {sessionLocation?.longitude.toFixed(6)}
                    </div>
                  </CardContent>
                </Card>

                {/* Attendance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Attendance Monitoring</CardTitle>
                    <CardDescription>
                      Real-time attendance monitoring for current session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
                        <div className="text-sm text-gray-600">Present</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
                        <div className="text-sm text-gray-600">Late</div>
 </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
                        <div className="text-sm text-gray-600">Absent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{attendanceStats.percentage}%</div>
                        <div className="text-sm text-gray-600">Rate</div>
                      </div>
                    </div>
                    <Progress value={attendanceStats.percentage} className="h-2" />
                  </CardContent>
                </Card>

                {/* Student List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Student Check-ins</CardTitle>
                    <CardDescription>
                      Live updates as students check in
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {liveAttendance.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(student.status)}
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-600">
                                {student.checkInTime !== '-' ? `Checked in at ${student.checkInTime}` : 'Not checked in'}
                              </div>
                            </div>
                          </div>
                          <div className={`font-medium capitalize ${getStatusColor(student.status)}`}>
                            {student.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Session</h3>
                    <p className="text-gray-600 mb-4">Start a class session to monitor live attendance</p>
                    <Button onClick={() => handleStartSession(1)}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trends</CardTitle>
                  <CardDescription>
                    Weekly attendance patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Chart visualization would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription>
                    Participation and feedback metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Attendance</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">On-time Rate</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Feedback Response</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Export Reports</CardTitle>
                    <CardDescription>
                      Download attendance and analytics data
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="w-6 h-6 mb-2" />
                    <span>Attendance Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="w-6 h-6 mb-2" />
                    <span>Analytics Summary</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="w-6 h-6 mb-2" />
                    <span>Student List</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {feedbackSummary.map((feedback, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{feedback.course}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{feedback.rating}</span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {feedback.responses} student responses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Sentiment</span>
                        <span className={`capitalize font-medium ${
                          feedback.sentiment === 'positive' ? 'text-green-600' : 
                          feedback.sentiment === 'negative' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {feedback.sentiment}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>5 stars</span>
                          <span>60%</span>
                        </div>
                        <Progress value={60} className="h-1" />

                        <div className="flex justify-between text-sm">
                          <span>4 stars</span>
                          <span>25%</span>
                        </div>
                        <Progress value={25} className="h-1" />

                        <div className="flex justify-between text-sm">
                          <span>3 stars</span>
                          <span>10%</span>
                        </div>
                        <Progress value={10} className="h-1" />
                      </div>

                      <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Comments
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}