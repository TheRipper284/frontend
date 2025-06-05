"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error("Debes iniciar sesión para acceder a esta página")
        router.push("/login")
      } else if (user.role !== "admin") {
        toast.error("Acceso denegado. Esta página es solo para administradores")
        router.push("/")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return <>{children}</>
}
