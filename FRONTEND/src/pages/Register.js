import React, { useState } from 'react'
import { UserIcon, LoaderIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/Auth/AuthLayout'
import InputField from '../components/Auth/InputField'
import { registerUser } from '../service/api'
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }
    setIsLoading(true)
    try {
      const response = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      if (response.success) {
        if (response.data?.token) {
          localStorage.setItem('authToken', response.data.token)
        }
        navigate('/login')
      } else {
        setError(response.error || 'Registration failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  const roleOptions = [
    {
      value: 'restaurantAdmin',
      label: 'Restaurant Admin',
    },
    {
      value: 'customer',
      label: 'Customer',
    },
    {
      value: 'deliveryPersonnel',
      label: 'Delivery Personnel',
    },
  ]
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join our restaurant management platform"
      alternateLink={{
        text: 'Already have an account?',
        linkText: 'Sign in',
        href: '/login',
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
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Choose a username"
          />
          <InputField
            id="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Password"
          />
          <InputField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
          />
          <InputField
            id="role"
            label="Role"
            type="select"
            value={formData.role}
            onChange={handleChange}
            required
            options={roleOptions}
          />
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
                <UserIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
              )}
            </span>
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
export default Register

