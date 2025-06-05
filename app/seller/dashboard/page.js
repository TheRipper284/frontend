"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FiPlus, FiPackage, FiDollarSign, FiUsers } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import toast from "react-hot-toast"
import SellerRoute from "@/components/auth/SellerRoute"

export default function SellerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentMessages, setRecentMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Obtener productos del vendedor
        let sellerProducts = []
        try {
          const productsRes = await axios.get("/products")
          if (productsRes.data.success) {
            sellerProducts = productsRes.data.data.filter((product) => product.seller_id === user.id)
          }
        } catch (error) {
          console.error("Error fetching products:", error)
        }

        // Obtener órdenes del vendedor
        let sellerOrders = []
        try {
          const ordersRes = await axios.get("/orders")
          if (ordersRes.data.success) {
            sellerOrders = ordersRes.data.data
          }
        } catch (error) {
          console.error("Error fetching orders:", error)
        }

        // Calcular estadísticas
        const pendingOrders = sellerOrders.filter(order => order.status === "pending").length
        const totalSales = sellerOrders.filter(order => order.status === "delivered").length
        
        // Calcular ingresos totales de órdenes pagadas/entregadas
        let totalRevenue = 0
        for (const order of sellerOrders) {
          if (order.status === "paid" || order.status === "delivered") {
            try {
              // Obtener detalles de la orden para calcular solo productos del vendedor
              const orderRes = await axios.get(`/orders/${order.id}`)
              if (orderRes.data.success && orderRes.data.data.seller_total) {
                totalRevenue += orderRes.data.data.seller_total
              }
            } catch (error) {
              console.error(`Error fetching order ${order.id}:`, error)
            }
          }
        }

        setStats({
          totalProducts: sellerProducts.length,
          totalSales,
          totalRevenue,
          pendingOrders,
        })

        // Obtener órdenes recientes (últimas 5)
        setRecentOrders(sellerOrders.slice(0, 5))

        // TODO: Implementar mensajes recientes cuando esté la API
        setRecentMessages([])

      } catch (error) {
        console.error("Error fetching seller data:", error)
        toast.error("Error al cargar los datos del vendedor")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando panel de vendedor...</p>
        </div>
      </div>
    )
  }

  return (
    <SellerRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Vendedor</h1>
          <Link href="/seller/products/new" className="btn btn-primary flex items-center">
            <FiPlus className="mr-2" />
            Nuevo Producto
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FiPackage size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Productos</p>
                <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FiDollarSign size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ingresos</p>
                <h3 className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <FiUsers size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ventas</p>
                <h3 className="text-2xl font-bold">{stats.totalSales}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <FiPackage size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pedidos Pendientes</p>
                <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Pedidos Recientes</h2>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay pedidos recientes</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Pedido #{order.id}</p>
                          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                          <p className="text-sm mt-1">Cliente: {order.buyer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${Number.parseFloat(order.total_amount).toFixed(2)}</p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              order.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.status === "delivered"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status === "paid"
                              ? "Pagado"
                              : order.status === "pending"
                                ? "Pendiente"
                                : order.status === "shipped"
                                  ? "Enviado"
                                  : order.status === "delivered"
                                    ? "Entregado"
                                    : "Cancelado"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Link href={`/seller/orders/${order.id}`} className="text-primary-600 text-sm hover:underline">
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link href="/seller/orders" className="text-primary-600 hover:underline">
                  Ver todos los pedidos
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Mensajes Recientes</h2>
            </div>
            <div className="p-6">
              {recentMessages.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay mensajes recientes</p>
              ) : (
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between">
                        <p className="font-medium">{message.sender_name}</p>
                        <p className="text-sm text-gray-500">{new Date(message.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.content}</p>
                      <div className="mt-2">
                        <Link
                          href={`/messages/${message.sender_id}`}
                          className="text-primary-600 text-sm hover:underline"
                        >
                          Responder
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link href="/messages" className="text-primary-600 hover:underline">
                  Ver todos los mensajes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerRoute>
  )
}
