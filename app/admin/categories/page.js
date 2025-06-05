"use client"

import { useState, useEffect, useCallback } from "react"
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi"
import toast from "react-hot-toast"
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/admin"

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("create") // 'create' o 'edit'
  const [currentCategory, setCurrentCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getCategories()
      
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Error al cargar las categorías")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openCreateModal = () => {
    setFormData({ name: "", description: "" })
    setModalMode("create")
    setShowModal(true)
  }

  const openEditModal = (category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
    })
    setCurrentCategory(category)
    setModalMode("edit")
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let response
      
      if (modalMode === "create") {
        response = await createCategory(formData)
        if (response.success) {
          toast.success("Categoría creada correctamente")
          fetchCategories()
        }
      } else {
        response = await updateCategory(currentCategory.id, formData)
        if (response.success) {
          toast.success("Categoría actualizada correctamente")
          fetchCategories()
        }
      }
      
      setShowModal(false)
    } catch (error) {
      console.error(`Error ${modalMode === "create" ? "creating" : "updating"} category:`, error)
      toast.error(`Error al ${modalMode === "create" ? "crear" : "actualizar"} la categoría`)
    }
  }

  const handleDelete = async (categoryId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return
    }
    
    try {
      const response = await deleteCategory(categoryId)
      
      if (response.success) {
        toast.success("Categoría eliminada correctamente")
        fetchCategories()
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      if (error.response?.status === 400) {
        toast.error("No se puede eliminar la categoría porque hay productos asociados")
      } else {
        toast.error("Error al eliminar la categoría")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
          onClick={openCreateModal}
        >
          <FiPlus className="mr-1" /> Añadir Categoría
        </button>
      </div>

      {/* Tabla de categorías */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Cargando categorías...</p>
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
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {category.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay categorías disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para crear/editar categoría */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {modalMode === "create" ? "Crear nueva categoría" : "Editar categoría"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  {modalMode === "create" ? "Crear" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}