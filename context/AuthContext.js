"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      const savedUser = localStorage.getItem("user")

      if (token) {
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
        await loadUser(token)
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Load user data
  const loadUser = async (token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const res = await axios.get("/auth/me", config)
      const userData = res.data.data

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Error loading user:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      throw error
    }
  }

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post("/auth/register", userData)

      if (res.data.success) {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("user", JSON.stringify(res.data.user))
        setUser(res.data.user)
        toast.success("Registro exitoso")
        return true
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error en el registro"
      toast.error(message)
      return false
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", { email, password })

      if (res.data.success) {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("user", JSON.stringify(res.data.user))
        setUser(res.data.user)
        toast.success("Inicio de sesión exitoso")
        return true
      }
    } catch (error) {
      const message = error.response?.data?.message || "Credenciales inválidas"
      toast.error(message)
      return false
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
    toast.success("Sesión cerrada")
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await axios.put("/users/profile", userData)

      if (res.data.success) {
        const updatedUser = res.data.data
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
        toast.success("Perfil actualizado")
        return true
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al actualizar perfil"
      toast.error(message)
      return false
    }
  }

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const res = await axios.post("/auth/forgot-password", { email })

      if (res.data.success) {
        toast.success("Se ha enviado un correo con instrucciones")
        return true
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error al procesar la solicitud"
      toast.error(message)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        forgotPassword,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
