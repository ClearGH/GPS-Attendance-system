import { useState, useEffect } from 'react'
import { MapPin, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '../hooks/useAuth'
import backgroundImage from '../assets/background.jpg'
import { useNavigate } from 'react-router-dom' // Import useNavigate

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false) // State for modal visibility
  const [loggedInUserRole, setLoggedInUserRole] = useState(null) // State to store user role

  const navigate = useNavigate() // Initialize useNavigate

  const newsItems = [
    {
      title: 'Latest Campus News:',
      content: [
        '- New academic year registration opens on August 1st. Don\'t miss out!',
        '- Workshop on AI in Education next Tuesday at 10 AM in Auditorium A.',
        '- Final year project submission deadline extended to July 15th.',
      ],
    },
    {
      title: 'Upcoming Events:',
      content: [
        '- Career Fair 2025: September 10th at the University Hall.',
        '- Inter-Departmental Sports Fest: October 5th-7th.',
        '- Guest Lecture on Cybersecurity: August 25th, 2 PM, Lecture Theatre 3.',
      ],
    },
    {
      title: 'Important Announcements:',
      content: [
        '- Library operating hours extended during exam period.',
        '- New student support services launched. Visit the student affairs office for details.',
        '- Campus-wide network maintenance scheduled for July 20th, 1 AM - 5 AM.',
      ],
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % newsItems.length)
    }, 7000) // Change news every 7 seconds

    return () => clearInterval(interval)
  }, [newsItems.length])

  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(username, password)

    if (result.success) {
      setLoggedInUserRole(result.role) // Store the role
      setShowWelcomeModal(true) // Show the welcome modal
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false)
    // Redirect based on role after modal closes
    if (loggedInUserRole === 'student') {
      navigate('/student-dashboard')
    } else if (loggedInUserRole === 'instructor') {
      navigate('/instructor-dashboard')
    } else if (loggedInUserRole === 'admin') {
      navigate('/admin-dashboard')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay for readability */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row rounded-lg shadow-xl overflow-hidden">
        {/* Information/News Section */}
        <div className="md:w-1/2 bg-white bg-opacity-90 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to GPS Attendance System</h2>
          <p className="text-gray-700 mb-6">
            Your all-in-one solution for efficient class attendance tracking and valuable student feedback collection.
            Designed for modern educational institutions.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 relative overflow-hidden h-32" role="alert">
            {newsItems.map((news, index) => (
              <div
                key={index}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentNewsIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <p className="font-bold">{news.title}</p>
                {news.content.map((item, idx) => (
                  <p key={idx} className="text-sm">{item}</p>
                ))}
              </div>
            ))}
          </div>
          {/* News Navigation Dots */}
          <div className="flex justify-center mt-4">
            {newsItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentNewsIndex(index)}
                className={`h-2 w-2 mx-1 rounded-full ${index === currentNewsIndex ? 'bg-blue-600' : 'bg-gray-400'} focus:outline-none`}
              ></button>
            ))}
          </div>
        </div>

        {/* Login Form Section */}
        <div className="md:w-1/2 bg-white p-8 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">GPS Attendance</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome, {loggedInUserRole}!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You have successfully logged in to the GPS Attendance System.</p>
              <Button onClick={handleWelcomeModalClose} className="w-full">
                Proceed to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

