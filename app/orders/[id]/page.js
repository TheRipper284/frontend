"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiPackage, FiClock, FiCheckCircle, FiTruck, FiAlertCircle, FiMapPin } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import toast from "react-hot-toast"

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

export default function OrderDetailPage({ params }) {
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      toast.error("Debes iniciar sesión para ver el pedido")
      router.push("/login?redirect=/orders")
    }

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
        router.push("/orders")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrder()
    }
  }, [user, authLoading, router, params.id])

  const updateOrderStatus = async (status) => {
    try {
      await axios.put(`/orders/${params.id}/status`, { status })
      toast.success("Estado del pedido actualizado")
      fetchOrder()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Error al actualizar estado del pedido")
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

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'card':
        return "Tarjeta de crédito/débito";
      case 'cash':
        return "Efectivo al recibir";
      case 'transfer':
        return "Transferencia bancaria";
      case 'oxxo':
        return "Pago en OXXO";
      case 'other':
        return "Otro método de pago";
      default:
        return "Efectivo al recibir";
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

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Pedido no encontrado</h2>
          <p className="text-gray-500 mb-6">El pedido que buscas no existe o no tienes acceso a él</p>
          <Link href="/orders" className="btn btn-primary">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/orders" className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <FiArrowLeft className="mr-2" />
        Volver a mis pedidos
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
            <div className="flex items-center">
              {getStatusIcon(order.status)}
              <span
                className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(order.status)}`}
              >
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

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
                      <p className="text-sm text-gray-500">Vendedor: {item.seller_name}</p>
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

          {/* Order summary */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resumen del pedido</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-gray-900">Gratis</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Método de pago</span>
                  <span className="text-gray-900">{getPaymentMethodText(order.payment_method)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {order.status === "pending" && (
            <button
              onClick={() => updateOrderStatus("cancelled")}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Cancelar Pedido
            </button>
          )}
          
          {order.status === "shipped" && (
            <button
              onClick={() => updateOrderStatus("delivered")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Marcar como Recibido
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
