"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiPackage, FiClock, FiCheckCircle, FiTruck, FiAlertCircle, FiMapPin, FiUser } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import toast from "react-hot-toast"
import SellerRoute from "@/components/auth/SellerRoute"

// Función para construir URL de imagen
const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "/placeholder.svg"
  }

  // Si la URL ya es completa (comienza con http o https), usarla directamente
  if (imageUrl.startsWith("http")) {
    return imageUrl
  }

  // Si la imagen está en backend/uploads, construir la URL completa
  const imagePath = imageUrl.startsWith("/uploads/") 
    ? imageUrl 
    : `/uploads/${imageUrl}`
  
  // Remover /api de la URL base si existe
  const baseUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
  return `${baseUrl}${imagePath}`
}

export default function SellerOrderDetailPage({ params }) {
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/orders/${params.id}`)
        if (res.data.success) {
          setOrder(res.data.data)
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        toast.error("Error al cargar el pedido")
        router.push("/seller/orders")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "seller") {
      fetchOrder()
    }
  }, [user, router, params.id])

  const updateOrderStatus = async (status) => {
    try {
      // Agregar loading state para evitar clicks múltiples
      const res = await axios.put(`/orders/${params.id}/status`, { status })
      
      if (res.data.success) {
        toast.success("Estado del pedido actualizado")
        // Refrescar datos después de éxito confirmado
        await fetchOrder()
      } else {
        toast.error("Error al actualizar estado del pedido")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      
      // Verificar si el error es real o si la actualización fue exitosa
      if (error.response?.status === 200 || error.response?.data?.success) {
        toast.success("Estado del pedido actualizado")
        await fetchOrder()
      } else {
        toast.error(error.response?.data?.message || "Error al actualizar estado del pedido")
      }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="text-yellow-500" size={24} />
      case "paid":
        return <FiCheckCircle className="text-blue-500" size={24} />
      case "shipped":
        return <FiTruck className="text-purple-500" size={24} />
      case "delivered":
        return <FiCheckCircle className="text-green-500" size={24} />
      case "cancelled":
        return <FiAlertCircle className="text-red-500" size={24} />
      default:
        return <FiPackage className="text-gray-500" size={24} />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "paid":
        return "Pagado"
      case "shipped":
        return "Enviado"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return "Desconocido"
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Pedido no encontrado</h2>
          <p className="text-gray-500 mb-6">El pedido que buscas no existe o no tienes acceso a él</p>
          <Link href="/seller/orders" className="btn btn-primary">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <SellerRoute>
      <div className="container mx-auto px-4 py-8">
        <Link href="/seller/orders" className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <FiArrowLeft className="mr-2" />
          Volver a pedidos
        </Link>

        {/* Order header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido #{order.id}</h1>
                <p className="text-gray-500">
                  Realizado el {new Date(order.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span
                    className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-2">
                  {order.status === "pending" && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateOrderStatus("paid")}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Marcar como Pagado
                      </button>
                      <button
                        onClick={() => updateOrderStatus("cancelled")}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  {order.status === "paid" && (
                    <button
                      onClick={() => updateOrderStatus("shipped")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Marcar como Enviado
                    </button>
                  )}
                  {order.status === "shipped" && (
                    <button
                      onClick={() => updateOrderStatus("delivered")}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Marcar como Entregado
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de prueba para revertir estados (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Panel de pruebas (solo desarrollo):</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateOrderStatus("pending")}
                className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
              >
                → Pendiente
              </button>
              <button
                onClick={() => updateOrderStatus("paid")}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs"
              >
                → Pagado
              </button>
              <button
                onClick={() => updateOrderStatus("shipped")}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
              >
                → Enviado
              </button>
              <button
                onClick={() => updateOrderStatus("delivered")}
                className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
              >
                → Entregado
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Productos del pedido</h2>
                <div className="divide-y">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-4 flex items-center">
                      <div className="flex-shrink-0 w-20 h-20 relative rounded overflow-hidden">
                        <Image
                          src={getImageUrl(item.image_url)}
                          alt={item.title}
                          fill
                          className="object-contain rounded"
                          unoptimized={process.env.NEXT_PUBLIC_API_URL?.includes('localhost')}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          ${Number.parseFloat(item.price).toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-medium text-gray-900">
                          ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order total */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total del pedido</span>
                    <span>${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer info */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FiUser className="mr-2" />
                  Información del cliente
                </h3>
                {order.buyer ? (
                  <div className="space-y-2">
                    <p><span className="font-medium">Nombre:</span> {order.buyer.name}</p>
                    <p><span className="font-medium">Email:</span> {order.buyer.email}</p>
                    {order.buyer.phone && <p><span className="font-medium">Teléfono:</span> {order.buyer.phone}</p>}
                  </div>
                ) : (
                  <p className="text-gray-600">Cliente #{order.buyer_id}</p>
                )}
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FiMapPin className="mr-2" />
                  Dirección de envío
                </h3>
                <p className="text-gray-700 whitespace-pre-line">{order.shipping_address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerRoute>
  )
}