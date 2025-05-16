import React, { useState } from 'react'
import { LockIcon, LoaderIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/Auth/AuthLayout'
import InputField from '../components/Auth/InputField'
import { loginUser } from '../service/api'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const response = await loginUser({
        username,
        password,
      })
      if (response.success) {
        if (response.data?.token) {
          localStorage.setItem('authToken', response.data.token)
        }
        navigate('/RestaurantList')
      } else {
        setError(response.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Manage your restaurant, orders, and deliveries"
      alternateLink={{
        text: "Don't have an account?",
        linkText: 'Register here',
        href: '/register',
      }}
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <div className="rounded-md shadow-sm -space-y-px">
          <InputField
            id="username"
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Username"
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot your password?
            </a>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              {isLoading ? (
                <LoaderIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400 animate-spin" />
              ) : (
                <LockIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
              )}
            </span>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
export default Login