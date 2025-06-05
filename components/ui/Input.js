import React, { forwardRef } from "react"

const Input = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      placeholder,
      error,
      className = "",
      labelClassName = "",
      inputClassName = "",
      errorClassName = "",
      leftIcon,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    const baseInputClasses =
      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
    const errorInputClasses = error ? "border-red-500" : ""
    const iconPaddingLeft = leftIcon ? "pl-10" : ""
    const iconPaddingRight = rightIcon ? "pr-10" : ""

    const inputClasses = `${baseInputClasses} ${errorInputClasses} ${iconPaddingLeft} ${iconPaddingRight} ${inputClassName}`

    return (
      <div className={`mb-4 ${className}`}>
        {label && (
          <label htmlFor={name} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{leftIcon}</div>}
          <input
            ref={ref}
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            className={inputClasses}
            {...props}
          />
          {rightIcon && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{rightIcon}</div>}
        </div>
        {error && <p className={`mt-1 text-sm text-red-600 ${errorClassName}`}>{error}</p>}
      </div>
    )
  },
)

Input.displayName = "Input"

export default Input