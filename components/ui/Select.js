import React, { forwardRef } from "react"
import { FiChevronDown } from "react-icons/fi"

const Select = forwardRef(
  (
    {
      label,
      name,
      options = [],
      placeholder,
      error,
      className = "",
      labelClassName = "",
      selectClassName = "",
      errorClassName = "",
      ...props
    },
    ref,
  ) => {
    const baseSelectClasses =
      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
    const errorSelectClasses = error ? "border-red-500" : ""

    const selectClasses = `${baseSelectClasses} ${errorSelectClasses} ${selectClassName}`

    return (
      <div className={`mb-4 ${className}`}>
        {label && (
          <label htmlFor={name} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
            {label}
          </label>
        )}
        <div className="relative">
          <select ref={ref} id={name} name={name} className={selectClasses} {...props}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <FiChevronDown className="text-gray-500" />
          </div>
        </div>
        {error && <p className={`mt-1 text-sm text-red-600 ${errorClassName}`}>{error}</p>}
      </div>
    )
  },
)

Select.displayName = "Select"

export default Select