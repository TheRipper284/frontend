import React from "react"

const Card = ({ children, className = "", padding = true, shadow = true, ...props }) => {
  const baseClasses = "bg-white rounded-lg overflow-hidden"
  const paddingClasses = padding ? "p-6" : ""
  const shadowClasses = shadow ? "shadow-md" : ""

  const classes = `${baseClasses} ${paddingClasses} ${shadowClasses} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default Card