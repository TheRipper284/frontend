"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiSend } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import toast from "react-hot-toast"

export default function ChatPage({ params }) {
  const { user, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Debes iniciar sesión para ver los mensajes")
      router.push("/login?redirect=/messages")
      return
    }

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/messages/${params.userId}`)
        if (res.data.success) {
          setMessages(res.data.data)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast.error("Error al cargar los mensajes")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMessages()
    }
  }, [user, authLoading, router, params.userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    try {
      setSending(true)
      const res = await axios.post("/messages", {
        receiver_id: params.userId,
        content: newMessage.trim()
      })

      if (res.data.success) {
        setMessages([...messages, res.data.data])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Error al enviar mensaje")
    } finally {
      setSending(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando chat...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/messages" className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <FiArrowLeft className="mr-2" />
        Volver a mensajes
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden h-96 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.is_mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.is_mine
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.is_mine ? "text-primary-200" : "text-gray-500"
                }`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="border-t p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
            >
              <FiSend size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}