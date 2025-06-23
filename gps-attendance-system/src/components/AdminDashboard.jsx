import { useState } from 'react'
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  LogOut,
  User,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '../hooks/useAuth'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for demonstration
  const [systemStats] = useState({
    totalUsers: 1247,
    totalCourses: 45,
    totalSessions: 892,
    avgAttendance: 87,
    activeUsers: 234,
    systemHealth: 98
  })

  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@university.edu', role: 'student', status: 'active', lastLogin: '2024-06-17' },
    { id: 2, name: 'Dr. Sarah Smith', email: 'sarah.smith@university.edu', role: 'instructor', status: 'active', lastLogin: '2024-06-17' },
    { id: 3, name: 'Jane Wilson', email: 'jane.wilson@university.edu', role: 'student', status: 'inactive', lastLogin: '2024-06-10' },
    { id: 4, name: 'Prof. Mike Johnson', email: 'mike.johnson@university.edu', role: 'instructor', status: 'active', lastLogin: '2024-06-16' },
    { id: 5, name: 'Alice Brown', email: 'alice.brown@university.edu', role: 'student', status: 'active', lastLogin: '2024-06-17' }
  ])

  const [courses] = useState([
    { id: 1, name: 'Database Systems', code: 'CS301', instructor: 'Dr. Sarah Smith', students: 45, status: 'active' },
    { id: 2, name: 'Web Development', code: 'CS401', instructor: 'Prof. Mike Johnson', students: 38, status: 'active' },
    { id: 3, name: 'Data Structures', code: 'CS201', instructor: 'Dr. Sarah Smith', students: 52, status: 'active' },
    { id: 4, name: 'Computer Networks', code: 'CS501', instructor: 'Prof. Mike Johnson', students: 29, status: 'inactive' }
  ])

  const [attendanceTrends] = useState([
    { month: 'Jan', attendance: 85 },
    { month: 'Feb', attendance: 88 },
    { month: 'Mar', attendance: 82 },
    { month: 'Apr', attendance: 90 },
    { month: 'May', attendance: 87 },
    { month: 'Jun', attendance: 89 }
  ])

  const handleLogout = () => {
    logout()
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'instructor':
        return 'bg-blue-100 text-blue-800'
      case 'student':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
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
            System Administration
          </h2>
          <p className="text-gray-600">
            Manage users, courses, and monitor system performance
          </p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{systemStats.totalCourses}</p>
                  <p className="text-sm text-gray-600">Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{systemStats.totalSessions}</p>
                  <p className="text-sm text-gray-600">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{systemStats.avgAttendance}%</p>
                  <p className="text-sm text-gray-600">Avg Attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{systemStats.activeUsers}</p>
                  <p className="text-sm text-gray-600">Active Now</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{systemStats.systemHealth}%</p>
                  <p className="text-sm text-gray-600">System Health</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="analytics">System Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage students, instructors, and administrators
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* User Table */}
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          Last login: {user.lastLogin}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Management Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Course Management</CardTitle>
                    <CardDescription>
                      Create and manage courses and assignments
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{course.name}</CardTitle>
                            <CardDescription>{course.code}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(course.status)}>
                            {course.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <div className="text-sm text-gray-600">
                            <strong>Instructor:</strong> {course.instructor}
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Students:</strong> {course.students}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trends</CardTitle>
                  <CardDescription>
                    Monthly attendance patterns across all courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendanceTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{trend.month}</span>
                        <div className="flex items-center space-x-2 flex-1 ml-4">
                          <Progress value={trend.attendance} className="flex-1" />
                          <span className="text-sm text-gray-600 w-12">{trend.attendance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>
                    Real-time system health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Server Uptime</span>
                      <span className="font-medium">99.9%</span>
                    </div>
                    <Progress value={99.9} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Database Performance</span>
                      <span className="font-medium">98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">API Response Time</span>
                      <span className="font-medium">95.2%</span>
                    </div>
                    <Progress value={95.2} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">GPS Accuracy</span>
                      <span className="font-medium">97.8%</span>
                    </div>
                    <Progress value={97.8} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>
                  Recent system activity and user engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-gray-600">Total Logins Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">892</div>
                    <div className="text-sm text-gray-600">Check-ins Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">156</div>
                    <div className="text-sm text-gray-600">Feedback Submitted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">23</div>
                    <div className="text-sm text-gray-600">Active Sessions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Reports</CardTitle>
                <CardDescription>
                  Generate and download comprehensive system reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Download className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Attendance Report</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Comprehensive attendance data across all courses
                        </p>
                        <Button className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">User Analytics</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          User engagement and activity patterns
                        </p>
                        <Button className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">System Performance</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Technical performance and health metrics
                        </p>
                        <Button className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <BookOpen className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Course Summary</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Course statistics and enrollment data
                        </p>
                        <Button className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Feedback Analysis</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Student feedback trends and sentiment
                        </p>
                        <Button className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Custom Report</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Generate custom reports with specific criteria
                        </p>
                        <Button className="w-full" variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

