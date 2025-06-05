"use client"

import { useState, useEffect, useCallback } from "react"
import { FiSearch, FiEye, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi"
import { getOrders, updateOrderStatus, getOrderById } from "@/lib/admin"
import axios from "@/lib/axios"
import toast from "react-hot-toast"
import Link from "next/link"

// Funciones de utilidad para conversión de estados
const getStatusDisplay = (status) => {
  switch (status) {
    case "pending": return "Pendiente";
    case "paid": return "Pagado";
    case "shipped": return "En proceso";
    case "delivered": return "Entregado";
    case "cancelled": return "Cancelado";
    default: return status;
  }
}

const getStatusValue = (displayStatus) => {
  switch (displayStatus) {
    case "Pendiente": return "pending";
    case "Pagado": return "paid";
    case "En proceso": return "shipped";
    case "Entregado": return "delivered";
    case "Cancelado": return "cancelled";
    default: return displayStatus.toLowerCase();
  }
}

// Función para mostrar el método de pago de manera amigable
const getPaymentMethodDisplay = (method) => {
  switch (method) {
    case 'card':
      return "Tarjeta";
    case 'cash':
      return "Efectivo al recibir";
    case 'transfer':
      return "Transferencia";
    case 'oxxo':
      return "OXXO";
    case 'other':
      return "Otro";
    default:
      return "Efectivo al recibir";
  }
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = {
        page: currentPage,
        limit: 10,
        sort: sortBy,
        order: sortOrder,
      }

      // Convertir el estado de visualización a valor para la API
      let apiStatus = null;
      if (statusFilter !== "all") {
        apiStatus = getStatusValue(statusFilter);
      }

      if (dateFilter !== "all") {
        const today = new Date()
        let startDate

        switch (dateFilter) {
          case 'today':
            startDate = new Date(today.setHours(0, 0, 0, 0))
            params.startDate = startDate.toISOString()
            break
          case 'week':
            startDate = new Date(today)
            startDate.setDate(today.getDate() - today.getDay())
            startDate.setHours(0, 0, 0, 0)
            params.startDate = startDate.toISOString()
            break
          case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1)
            params.startDate = startDate.toISOString()
            break
          case 'year':
            startDate = new Date(today.getFullYear(), 0, 1)
            params.startDate = startDate.toISOString()
            break
        }
      }

      const response = await getOrders(currentPage, 10, sortBy, sortOrder, apiStatus)

      if (response.success) {
        // Transformar los datos básicos de órdenes
        const updatedOrders = response.data.map(order => ({
          ...order,
          status: getStatusDisplay(order.status),
          // Usar el payment_method real de la base de datos
          payment_method: getPaymentMethodDisplay(order.payment_method),
          items: "Cargando...",
        }));
        
        // Actualizar el estado inicial para mostrar algo al usuario
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        setTotalPages(response.pagination.totalPages || 1);
        
        // Luego, para cada orden, intentar obtener detalles adicionales
        const ordersWithItems = await Promise.all(
          updatedOrders.map(async (order) => {
            try {
              // Obtener detalles específicos de la orden
              const orderDetails = await getOrderById(order.id);
              
              if (orderDetails.success && orderDetails.data.items) {
                return {
                  ...order,
                  items: `${orderDetails.data.items.length} ${orderDetails.data.items.length === 1 ? 'artículo' : 'artículos'}`
                };
              }
              return order;
            } catch (error) {
              console.error(`Error obteniendo detalles para orden ${order.id}:`, error);
              return {
                ...order,
                items: "No disponible"
              };
            }
          })
        );
        
        // Actualizar el estado con la información completa
        setOrders(ordersWithItems);
        if (searchTerm.trim()) {
          const filtered = ordersWithItems.filter(
            order =>
              (order.customer?.name || order.buyer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.id.toString().includes(searchTerm)
          );
          setFilteredOrders(filtered);
        } else {
          setFilteredOrders(ordersWithItems);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("No se pudieron cargar los pedidos")
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, dateFilter, sortBy, sortOrder, searchTerm]);

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // Convertir estado de visualización a valor de API
      const apiStatus = getStatusValue(newStatus);
      
      const response = await updateOrderStatus(orderId, apiStatus)
      
      if (response.success) {
        // Actualizar el estado local
        const updatedOrders = orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
        setOrders(updatedOrders)
        
        toast.success(`Estado del pedido #${orderId} actualizado a ${newStatus}`)
      } else {
        toast.error(response.message || "Error al actualizar el estado del pedido")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Error al actualizar el estado del pedido")
    }
  }

  const getStatusActions = (order) => {
    switch (order.status) {
      case "Pendiente":
        return (
          <>
            <button
              className="text-blue-600 hover:text-blue-800"
              onClick={() => handleUpdateStatus(order.id, "En proceso")}
              title="Marcar como en proceso"
            >
              <FiClock className="w-5 h-5" />
            </button>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => handleUpdateStatus(order.id, "Cancelado")}
              title="Cancelar pedido"
            >
              <FiXCircle className="w-5 h-5" />
            </button>
          </>
        )
      case "En proceso":
        return (
          <>
            <button
              className="text-green-600 hover:text-green-800"
              onClick={() => handleUpdateStatus(order.id, "Entregado")}
              title="Marcar como entregado"
            >
              <FiCheckCircle className="w-5 h-5" />
            </button>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => handleUpdateStatus(order.id, "Cancelado")}
              title="Cancelar pedido"
            >
              <FiXCircle className="w-5 h-5" />
            </button>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Buscar por cliente o ID..."
              className="w-full px-4 py-2 border rounded-md pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="En proceso">En proceso</option>
              <option value="Entregado">Entregados</option>
              <option value="Cancelado">Cancelados</option>
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
            >
              <option value="date-desc">Más recientes</option>
              <option value="date-asc">Más antiguos</option>
              <option value="amount-desc">Mayor importe</option>
              <option value="amount-asc">Menor importe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Cargando pedidos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artículos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.date || order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer?.name || order.buyer_name || "Cliente no disponible"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${parseFloat(order.amount || order.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof order.items === 'object' ? 
                          (Array.isArray(order.items) ? `${order.items.length} artículos` : "1 artículo") : 
                          "No disponible"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Ver detalles"
                          >
                            <FiEye className="w-5 h-5" />
                          </Link>
                          {getStatusActions(order)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron pedidos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Paginación */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando página <span className="font-medium">{currentPage}</span> de{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Primera página</span>
                  <span>Primera</span>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <span>Anterior</span>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Siguiente</span>
                  <span>Siguiente</span>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Última página</span>
                  <span>Última</span>
                </button>
              </nav>
            </div>
          </div>
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
    case "Cancelado":
      color = "bg-red-100 text-red-800"
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
