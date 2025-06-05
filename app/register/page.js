"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get role from query params if available
  const defaultRole = searchParams.get("role") || "buyer"

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      const success = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      })

      if (success) {
        router.push("/")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Crear una cuenta</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Inicia sesión
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={`input pl-10 ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Juan Pérez"
                  {...register("name", {
                    required: "El nombre es obligatorio",
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener al menos 2 caracteres",
                    },
                  })}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`input pl-10 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="correo@ejemplo.com"
                  {...register("email", {
                    required: "El correo electrónico es obligatorio",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Correo electrónico inválido",
                    },
                  })}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`input pl-10 ${errors.password ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: {
                      value: 6,
                      message: "La contraseña debe tener al menos 6 caracteres",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className={`input pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    required: "Confirma tu contraseña",
                    validate: (value) => value === watch("password") || "Las contraseñas no coinciden",
                  })}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="label">Tipo de cuenta</label>
              <div className="mt-2 flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="buyer"
                    name="role"
                    type="radio"
                    value="buyer"
                    defaultChecked={defaultRole === "buyer"}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    {...register("role")}
                  />
                  <label htmlFor="buyer" className="ml-2 block text-sm text-gray-900">
                    Comprador
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="seller"
                    name="role"
                    type="radio"
                    value="seller"
                    defaultChecked={defaultRole === "seller"}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    {...register("role")}
                  />
                  <label htmlFor="seller" className="ml-2 block text-sm text-gray-900">
                    Vendedor
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              {...register("terms", {
                required: "Debes aceptar los términos y condiciones",
              })}
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              Acepto los{" "}
              <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500">
                términos y condiciones
              </Link>
            </label>
          </div>
          {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>}

          <div>
            <button type="submit" className="btn btn-primary w-full flex justify-center py-3" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
