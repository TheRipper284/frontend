"use client"

import { useState, useEffect, useCallback } from "react"
import { FiSearch, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { getUsers, updateUserStatus, deleteUser } from "@/lib/admin"

export default function AdminUsers() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [userToDelete, setUserToDelete] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getUsers(currentPage, 10, sortBy, sortOrder, roleFilter)
      
      if (response.success) {
        setUsers(response.data)
        setTotalPages(response.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Error al cargar los usuarios")
    } finally {
      setLoading(false)
    }
  }, [currentPage, roleFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const handleChangeStatus = async (userId, newStatus) => {
    try {
      const response = await updateUserStatus(userId, newStatus)
      
      if (response.success) {
        // Actualizar el estado local
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        )
        setUsers(updatedUsers)
        
        toast.success(`Estado del usuario actualizado a ${newStatus}`)
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Error al actualizar el estado del usuario")
    }
  }

  const confirmDelete = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    
    try {
      const response = await deleteUser(userToDelete.id)
      
      if (response.success) {
        // Actualizar el estado local
        const updatedUsers = users.filter(user => user.id !== userToDelete.id)
        setUsers(updatedUsers)
        
        toast.success("Usuario eliminado correctamente")
        setShowDeleteModal(false)
        setUserToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Error al eliminar el usuario")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          onClick={() => {
            router.push("/admin/users/new")
          }}
        >
          Añadir Usuario
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="w-full px-4 py-2 border rounded-md pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="buyer">Compradores</option>
              <option value="seller">Vendedores</option>
              <option value="admin">Administradores</option>
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_at">Fecha de registro</option>
              <option value="name">Nombre</option>
              <option value="email">Email</option>
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Cargando usuarios...</p>
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
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <FiEdit2 />
                        </button>
                        
                        {user.status === "active" ? (
                          <button
                            onClick={() => handleChangeStatus(user.id, "inactive")}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Desactivar"
                          >
                            <FiX />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChangeStatus(user.id, "active")}
                            className="text-green-600 hover:text-green-900"
                            title="Activar"
                          >
                            <FiCheck />
                          </button>
                        )}
                        
                        <button
                          onClick={() => confirmDelete(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Anterior
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === i + 1
                    ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
            <p className="text-sm text-gray-500 mb-4">
              ¿Estás seguro de que deseas eliminar al usuario <span className="font-medium">{userToDelete?.name}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserRoleBadge({ role }) {
  let color

  switch (role) {
    case "admin":
      color = "bg-purple-100 text-purple-800"
      break
    case "seller":
      color = "bg-blue-100 text-blue-800"
      break
    case "buyer":
      color = "bg-green-100 text-green-800"
      break
    default:
      color = "bg-gray-100 text-gray-800"
  }

  const roleText = {
    admin: "Administrador",
    seller: "Vendedor",
    buyer: "Comprador",
  }

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {roleText[role] || role}
    </span>
  )
}

function UserStatusBadge({ status }) {
  let color

  switch (status) {
    case "active":
      color = "bg-green-100 text-green-800"
      break
    case "inactive":
      color = "bg-red-100 text-red-800"
      break
    default:
      color = "bg-gray-100 text-gray-800"
  }

  const statusText = {
    active: "Activo",
    inactive: "Inactivo",
  }

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {statusText[status] || status}
    </span>
  )
}