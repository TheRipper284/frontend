"use client"

import { useEffect, useState } from "react"
import { FiUsers, FiShoppingBag, FiDollarSign, FiShoppingCart } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"
import { getUsersStats, getProductsStats, getOrdersStats } from "@/lib/admin"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    recentOrders: [],
    usersByRole: { buyer: 0, seller: 0, admin: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        if (!user || user.role !== "admin") {
          return
        }

        // Llamar a las APIs reales
        const [usersStatsRes, productsStatsRes, ordersStatsRes] = await Promise.all([
          getUsersStats(),
          getProductsStats(),
          getOrdersStats()
        ])

        // Combinar los datos de las diferentes respuestas
        setStats({
          totalUsers: usersStatsRes.totalUsers || 0,
          usersByRole: usersStatsRes.usersByRole || { buyer: 0, seller: 0, admin: 0 },
          totalProducts: productsStatsRes.totalProducts || 0,
          totalSales: ordersStatsRes.totalSales || 0,
          totalOrders: ordersStatsRes.totalOrders || 0,
          recentOrders: ordersStatsRes.recentOrders || [],
        })
      } catch (error) {
        console.error("Error fetching admin dashboard stats:", error)
        toast.error("Error al cargar las estadísticas del dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === "admin") {
      fetchStats()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando estadísticas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard de Administrador</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Usuarios totales" 
          value={stats.totalUsers} 
          icon={<FiUsers className="text-blue-500" />} 
          change="+12%" 
          description="Desde el mes pasado" 
        />
        <StatsCard 
          title="Productos" 
          value={stats.totalProducts} 
          icon={<FiShoppingBag className="text-green-500" />} 
          change="+8%" 
          description="Desde el mes pasado" 
        />
        <StatsCard 
          title="Ventas totales" 
          value={`$${stats.totalSales.toLocaleString()}`} 
          icon={<FiDollarSign className="text-yellow-500" />} 
          change="+23%" 
          description="Desde el mes pasado" 
        />
        <StatsCard 
          title="Pedidos" 
          value={stats.totalOrders} 
          icon={<FiShoppingCart className="text-purple-500" />} 
          change="+18%" 
          description="Desde el mes pasado" 
        />
      </div>
      
      {/* Distribución de usuarios por rol */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Distribución de usuarios por rol</h2>
        <div className="grid grid-cols-3 gap-4">
          <RoleCard role="Compradores" count={stats.usersByRole.buyer} color="bg-blue-500" />
          <RoleCard role="Vendedores" count={stats.usersByRole.seller} color="bg-green-500" />
          <RoleCard role="Administradores" count={stats.usersByRole.admin} color="bg-purple-500" />
        </div>
      </div>
      
      {/* Pedidos recientes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Pedidos recientes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Componente para las tarjetas de estadísticas
function StatsCard({ title, value, icon, change, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 rounded-md bg-gray-50">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-green-500 flex items-center">
            {change}
            <span className="text-gray-400 ml-1">{description}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// Componente para las tarjetas de roles
function RoleCard({ role, count, color }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className={`w-3 h-10 ${color} rounded-md`}></div>
        <div>
          <p className="text-sm text-gray-500">{role}</p>
          <p className="text-xl font-bold">{count}</p>
        </div>
      </div>
    </div>
  )
}

// Componente para las etiquetas de estado de los pedidos
function OrderStatusBadge({ status }) {
  let color
  
  switch (status) {
    case "Entregado":
      color = "bg-green-100 text-green-800"
      break
    case "En proceso":
      color = "bg-blue-100 text-blue-800"
      break
    case "Pendiente":
      color = "bg-yellow-100 text-yellow-800"
      break
    default:
      color = "bg-gray-100 text-gray-800"
  }
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {status}
    </span>
  )
} 