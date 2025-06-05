"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FiMessageCircle, FiUser } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import toast from "react-hot-toast"

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Debes iniciar sesión para ver los mensajes")
      router.push("/login?redirect=/messages")
      return
    }

    const fetchConversations = async () => {
      try {
        setLoading(true)
        const res = await axios.get("/messages")
        if (res.data.success) {
          setConversations(res.data.data)
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
        toast.error("Error al cargar las conversaciones")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchConversations()
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mensajes</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <FiMessageCircle className="text-gray-400" size={64} />
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-2">No tienes conversaciones</h2>
          <p className="text-gray-500 mb-6">Cuando envíes o recibas mensajes aparecerán aquí</p>
          <Link href="/products" className="btn btn-primary">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y">
            {conversations.map((conversation) => (
              <Link
                key={conversation.user_id}
                href={`/messages/${conversation.user_id}`}
                className="block p-6 hover:bg-gray-50 transition"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <FiUser className="text-gray-500" size={24} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {conversation.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(conversation.last_message_date).toLocaleDateString()}
                      </span>
                    </div>
                    {conversation.unread_count > 0 && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-500">Mensajes nuevos</span>
                        <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unread_count}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}