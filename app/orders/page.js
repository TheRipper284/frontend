"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiAlertCircle } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import toast from "react-hot-toast"

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      toast.error("Debes iniciar sesión para ver tus pedidos")
      router.push("/login?redirect=/orders")
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        const res = await axios.get("/orders")
        if (res.data.success) {
          setOrders(res.data.data)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast.error("Error al cargar los pedidos")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user, authLoading, router])

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="text-yellow-500" size={20} />
      case "paid":
        return <FiCheckCircle className="text-blue-500" size={20} />
      case "shipped":
        return <FiTruck className="text-purple-500" size={20} />
      case "delivered":
        return <FiCheckCircle className="text-green-500" size={20} />
      case "cancelled":
        return <FiAlertCircle className="text-red-500" size={20} />
      default:
        return <FiPackage className="text-gray-500" size={20} />
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

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <FiPackage className="text-gray-400" size={64} />
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-2">No tienes pedidos</h2>
          <p className="text-gray-500 mb-6">Cuando realices un pedido, aparecerá aquí</p>
          <Link href="/products" className="btn btn-primary">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Pedido
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Productos
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ver</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span
                          className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                            order.status,
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${Number.parseFloat(order.total_amount).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {order.item_count} {order.item_count === 1 ? "producto" : "productos"} (
                        {order.total_items} {order.total_items === 1 ? "artículo" : "artículos"})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/orders/${order.id}`} className="text-primary-600 hover:text-primary-900">
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}