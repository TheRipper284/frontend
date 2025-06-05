import React from "react"
import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi"

const Alert = ({ children, variant = "info", dismissible = false, onDismiss, className = "", ...props }) => {
  const baseClasses = "p-4 rounded-md flex items-start"

  const variantClasses = {
    info: "bg-blue-50 text-blue-800",
    success: "bg-green-50 text-green-800",
    warning: "bg-yellow-50 text-yellow-800",
    error: "bg-red-50 text-red-800",
  }

  const iconMap = {
    info: <FiInfo className="h-5 w-5 text-blue-500" />,
    success: <FiCheckCircle className="h-5 w-5 text-green-500" />,
    warning: <FiAlertTriangle className="h-5 w-5 text-yellow-500" />,
    error: <FiAlertCircle className="h-5 w-5 text-red-500" />,
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  return (
    <div className={classes} role="alert" {...props}>
      <div className="flex-shrink-0 mr-3">{iconMap[variant]}</div>
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          type="button"
          className="flex-shrink-0 ml-3 h-5 w-5 text-gray-400 hover:text-gray-500 focus:outline-none"
          onClick={onDismiss}
        >
          <span className="sr-only">Cerrar</span>
          <FiX className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export default Alert