import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MapPin, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Navigation,
  Clock,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

export default function CheckInPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [locationPermission, setLocationPermission] = useState('prompt')
  const [accuracy, setAccuracy] = useState(null)
  const [activeSession, setActiveSession] = useState(null)

  useEffect(() => {
    checkLocationPermission()
    fetchActiveSession()
  }, [])

  const fetchActiveSession = async () => {
    try {
      // In a real app, this would fetch the active session from the backend
      // For now, we'll use mock data that represents an instructor-set location
      const mockActiveSession = {
        id: 1,
        course: 'Database Systems',
        instructor: 'Dr. Smith',
        time: '10:00 AM - 11:30 AM',
        room: 'Room 101',
        location: {
          latitude: 40.7128, // This would come from instructor's set location
          longitude: -74.0060,
          radius: 50 // meters - instructor-defined geofence
        },
        isActive: true
      }
      setActiveSession(mockActiveSession)
    } catch (error) {
      setError('Failed to fetch active session information.')
    }
  }

  const checkLocationPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        setLocationPermission(permission.state)

        permission.onchange = () => {
          setLocationPermission(permission.state)
        }
      } catch (error) {
        console.error('Error checking location permission:', error)
      }
    }
  }

  const getCurrentLocation = () => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setLocation({ latitude, longitude })
        setAccuracy(accuracy)
        setLoading(false)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }

        setError(errorMessage)
        setLoading(false)
      },
      options
    )
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  const handleCheckIn = async () => {
    if (!location || !activeSession) {
      setError('Please get your location first and ensure there is an active session.')
      return
    }

    setLoading(true)

    try {
      // Calculate distance from instructor-set class location
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        activeSession.location.latitude,
        activeSession.location.longitude
      )

      // Check if student is within the instructor-defined geofence
      if (distance <= activeSession.location.radius) {
        // In a real app, this would make an API call to record attendance
        const attendanceData = {
          sessionId: activeSession.id,
          studentLocation: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: accuracy
          },
          distance: distance,
          timestamp: new Date().toISOString()
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        setSuccess(true)
        setError('')

        // Auto-redirect after success
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } else {
        setError(`You are ${Math.round(distance)}m away from the class location. You need to be within ${activeSession.location.radius}m to check in.`)
      }
    } catch (error) {
      setError('Check-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getDistanceFromClass = () => {
    if (!location || !activeSession) return null

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      activeSession.location.latitude,
      activeSession.location.longitude
    )

    return Math.round(distance)
  }

  const isWithinRange = () => {
    const distance = getDistanceFromClass()
    return distance !== null && activeSession && distance <= activeSession.location.radius
  }

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Session</h2>
              <p className="text-gray-600 mb-4">
                There is no active class session at the moment. Please wait for your instructor to start a session.
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check-in Successful!</h2>
              <p className="text-gray-600 mb-4">
                You have been marked present for {activeSession.course}
              </p>
              <div className="text-sm text-gray-500 mb-2">
                Distance from class location: {getDistanceFromClass()}m
              </div>
              <div className="text-sm text-gray-500">
                Redirecting to dashboard in 3 seconds...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Check In</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        {/* Class Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Active Class Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-semibold text-lg">{activeSession.course}</div>
              <div className="text-gray-600">{activeSession.instructor}</div>
              <div className="text-gray-600">{activeSession.time}</div>
              <div className="text-gray-600">{activeSession.room}</div>
              <div className="text-sm text-blue-600 font-medium">
                Required range: {activeSession.location.radius}m from class location
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructor Location Info */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <MapPin className="w-5 h-5 mr-2" />
              Class Location Set by Instructor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700">
              <div>Latitude: {activeSession.location.latitude.toFixed(6)}</div>
              <div>Longitude: {activeSession.location.longitude.toFixed(6)}</div>
              <div>Check-in radius: {activeSession.location.radius} meters</div>
            </div>
          </CardContent>
        </Card>

        {/* Location Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-blue-600" />
              Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!location ? (
              <div className="text-center py-4">
                <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  We need your location to verify you're within the instructor's designated area
                </p>
                <Button
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Get My Location
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Distance from class:</span>
                  <span className={`font-medium ${isWithinRange() ? 'text-green-600' : 'text-red-600'}`}>
                    {getDistanceFromClass()}m
                  </span>
                </div>

                {accuracy && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Location accuracy:</span>
                    <span className="text-sm text-gray-900">±{Math.round(accuracy)}m</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`font-medium ${isWithinRange() ? 'text-green-600' : 'text-red-600'}`}>
                    {isWithinRange() ? 'Within instructor\'s range' : 'Outside instructor\'s range'}
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Your location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Check-in Button */}
        <Button
          onClick={handleCheckIn}
          disabled={!location || loading || !isWithinRange()}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Checking In...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Check In to Class
            </>
          )}
        </Button>

        {location && !isWithinRange() && (
          <p className="text-sm text-gray-600 text-center mt-4">
            You need to be within {activeSession.location.radius}m of the instructor's set location to check in.
          </p>
        )}
      </main>
    </div>
  )
}

