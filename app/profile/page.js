"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiLock } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const { user, loading: authLoading, updateProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      toast.error("Debes iniciar sesión para acceder a tu perfil")
      router.push("/login?redirect=/profile")
    }

    // Set form default values when user data is available
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "",
      })
    }
  }, [user, authLoading, router, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      const success = await updateProfile(data)

      if (success) {
        toast.success("Perfil actualizado correctamente")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mi perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-primary-600" size={36} />
                  )}
                </div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <p className="mt-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 capitalize">
                  {user.role === "buyer" ? "Comprador" : user.role === "seller" ? "Vendedor" : "Administrador"}
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <a
                  href="/profile/password"
                  className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <FiLock className="text-gray-500 mr-3" />
                  <span>Cambiar contraseña</span>
                </a>
                {user.role === "seller" && (
                  <a
                    href="/seller/products"
                    className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <FiUser className="text-gray-500 mr-3" />
                    <span>Mis productos</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Información personal</h2>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        className={`input pl-10 ${errors.name ? "border-red-500" : ""}`}
                        placeholder="Tu nombre"
                        {...register("name", {
                          required: "El nombre es obligatorio",
                        })}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        className="input pl-10"
                        placeholder="Tu email"
                        disabled
                        {...register("email")}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        className="input pl-10"
                        placeholder="Tu teléfono"
                        {...register("phone")}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      País
                    </label>
                    <input
                      id="country"
                      type="text"
                      className="input"
                      placeholder="Tu país"
                      {...register("country")}
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input id="city" type="text" className="input" placeholder="Tu ciudad" {...register("city")} />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="text-gray-400" />
                      </div>
                      <input
                        id="address"
                        type="text"
                        className="input pl-10"
                        placeholder="Tu dirección"
                        {...register("address")}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button type="submit" className="btn btn-primary flex items-center" disabled={isSubmitting}>
                    <FiSave className="mr-2" />
                    {isSubmitting ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}