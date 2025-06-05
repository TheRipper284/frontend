import React from "react"

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none"

  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
    outline:
      "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    link: "bg-transparent text-primary-600 hover:text-primary-700 hover:underline p-0",
  }

  const sizeClasses = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-2.5",
    xl: "text-xl px-6 py-3",
  }

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  )
}

export default Button