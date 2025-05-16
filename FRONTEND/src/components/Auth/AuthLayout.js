import React from 'react'
import { Link } from 'react-router-dom'
import { UtensilsIcon } from 'lucide-react'
const AuthLayout = ({ children, title, subtitle, alternateLink }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <UtensilsIcon className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>
        {children}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {alternateLink.text}{' '}
            <Link
              to={alternateLink.href}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {alternateLink.linkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default AuthLayout