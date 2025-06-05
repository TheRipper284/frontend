"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { FiLock, FiSave } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"
import axios from "@/lib/axios"

export default function ChangePasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { user, loading, checkAuth } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm()

  const newPassword = watch("newPassword")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile/password")
    }
  }, [user, loading, router])

  const onSubmit = async (data) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    console.log("Iniciando cambio de contraseña...")

    try {
      const res = await axios.put("/users/password", data)
      console.log("Respuesta del servidor:", res.data)

      if (res.data.success) {
        toast.success("Contraseña actualizada correctamente")
        reset()
        router.push("/profile")
      } else {
        toast.error(res.data.message || "Error al actualizar la contraseña")
      }
    } catch (error) {
      console.error("Error al actualizar contraseña:", error)
      const message = error.response?.data?.message || "Error al actualizar la contraseña"
      toast.error(message)

      if (error.response?.status === 401) {
        await checkAuth()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Cambiar contraseña</h1>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña actual
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      id="currentPassword"
                      type="password"
                      className={`input pl-10 ${errors.currentPassword ? "border-red-500" : ""}`}
                      placeholder="Tu contraseña actual"
                      {...register("currentPassword", {
                        required: "La contraseña actual es obligatoria",
                      })}
                    />
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type="password"
                      className={`input pl-10 ${errors.newPassword ? "border-red-500" : ""}`}
                      placeholder="Tu nueva contraseña"
                      {...register("newPassword", {
                        required: "La nueva contraseña es obligatoria",
                        minLength: {
                          value: 6,
                          message: "La contraseña debe tener al menos 6 caracteres",
                        },
                      })}
                    />
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      className={`input pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      placeholder="Confirma tu nueva contraseña"
                      {...register("confirmPassword", {
                        required: "La confirmación de contraseña es obligatoria",
                        validate: (value) =>
                          value === newPassword || "Las contraseñas no coinciden",
                      })}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  type="submit"
                  className="btn btn-primary flex items-center"
                  disabled={isSubmitting}
                >
                  <FiSave className="mr-2" />
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push("/profile")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 