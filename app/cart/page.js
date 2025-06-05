"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import useCartStore from "@/store/cartStore"
import toast from "react-hot-toast"
import axios from "@/lib/axios"
import PaymentModal from "@/components/PaymentModal"

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

export default function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingAddress, setShippingAddress] = useState("")
  const router = useRouter()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      toast.error("Debes iniciar sesión para acceder al carrito")
      router.push("/login?redirect=/cart")
    }
  }, [user, authLoading, router])

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!shippingAddress.trim()) {
      toast.error("Por favor ingresa una dirección de envío")
      return
    }
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (paymentMethod, orderStatus = 'paid') => {
    try {
      setIsProcessing(true)
      
      // Crear orden
      const orderRes = await axios.post("/orders", {
        shipping_address: shippingAddress,
        payment_method: paymentMethod
      })
      
      // Actualizar estado según el método de pago
      if (orderStatus === 'paid') {
        await axios.put(`/orders/${orderRes.data.data.id}/status`, { 
          status: "paid" 
        })
        clearCart() // Solo limpiar carrito si el pago fue exitoso
        toast.success("¡Pago aprobado! Orden creada exitosamente")
      } else {
        toast.success(`Orden creada. Estado: ${orderStatus}`)
      }
      
      router.push(`/orders/${orderRes.data.data.id}`)
    } catch (error) {
      console.error("Error al procesar el pedido:", error)
      toast.error("Error al procesar el pedido")
    } finally {
      setIsProcessing(false)
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
      <h1 className="text-3xl font-bold mb-8">Carrito de compras</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <FiShoppingBag className="text-gray-400" size={64} />
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">Parece que aún no has añadido productos a tu carrito</p>
          <Link href="/products" className="btn btn-primary">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Productos ({items.length})</h2>
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="py-4 flex items-center">
                      <div className="flex-shrink-0 w-24 h-24 relative rounded overflow-hidden">
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
                        <p className="text-sm text-gray-500">{item.seller_name}</p>
                        <p className="text-primary-600 font-medium">${Number.parseFloat(item.price || 0).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <FiMinus className="text-gray-500" />
                        </button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <FiPlus className="text-gray-500" />
                        </button>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-base font-medium text-gray-900">
                          ${(Number.parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center mt-1"
                        >
                          <FiTrash2 className="mr-1" size={14} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-between items-center">
                <Link href="/products" className="text-primary-600 hover:text-primary-700 flex items-center">
                  <FiArrowLeft className="mr-2" />
                  Seguir comprando
                </Link>
                <button onClick={clearCart} className="text-red-600 hover:text-red-800">
                  Vaciar carrito
                </button>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-gray-900">Gratis</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="mt-6">
                  <div className="mb-4">
                    <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección de envío
                    </label>
                    <textarea
                      id="shipping_address"
                      name="shipping_address"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ingresa tu dirección completa"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn btn-primary py-3"
                    disabled={isProcessing || items.length === 0}
                  >
                    {isProcessing ? "Procesando..." : "Realizar pedido"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal
          order={{ total_amount: getTotal() }}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}