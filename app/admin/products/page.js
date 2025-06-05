"use client"

import { useState, useEffect, useCallback } from "react"
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiX, FiCheck } from "react-icons/fi"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getProducts, updateProductStatus, deleteProduct, getCategories } from "@/lib/admin"

export default function AdminProducts() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [categories, setCategories] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories()
      
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getProducts(
        currentPage, 
        10, 
        sortBy, 
        sortOrder, 
        categoryFilter, 
        statusFilter
      )
      
      if (response.success) {
        setProducts(response.data)
        setTotalPages(response.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Error al cargar los productos")
    } finally {
      setLoading(false)
    }
  }, [currentPage, sortBy, sortOrder, categoryFilter, statusFilter])

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [fetchCategories, fetchProducts])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(
        product =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const handleChangeStatus = async (productId, newStatus) => {
    try {
      const response = await updateProductStatus(productId, newStatus)
      
      if (response.success) {
        // Actualizar el estado local
        const updatedProducts = products.map(product => 
          product.id === productId ? { ...product, status: newStatus } : product
        )
        setProducts(updatedProducts)
        
        toast.success(`Estado del producto actualizado a ${newStatus}`)
      }
    } catch (error) {
      console.error("Error updating product status:", error)
      toast.error("Error al actualizar el estado del producto")
    }
  }

  const confirmDelete = (product) => {
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return
    
    try {
      const response = await deleteProduct(productToDelete.id)
      
      if (response.success) {
        // Actualizar el estado local
        const updatedProducts = products.filter(product => product.id !== productToDelete.id)
        setProducts(updatedProducts)
        
        toast.success("Producto eliminado correctamente")
        setShowDeleteModal(false)
        setProductToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error al eliminar el producto")
    }
  }

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "/placeholder-product.jpg"
    }

    // Si la URL ya es completa (comienza con http o https), usarla directamente
    if (imageUrl.startsWith("http")) {
      return imageUrl
    }

    // Si la imagen está en la carpeta public, usarla directamente
    if (imageUrl.startsWith("/")) {
      return imageUrl
    }

    // Si la imagen está en backend/uploads, construir la URL completa
    const imagePath = `/uploads/${imageUrl}`
    
    // Remover /api de la URL base si existe
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || ""
    return `${baseUrl}${imagePath}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
          onClick={() => router.push("/admin/products/new")}
        >
          <FiPlus className="mr-1" /> Añadir Producto
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="col-span-2">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full px-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="deleted">Eliminado</option>
            </select>
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border rounded-md"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
            >
              <option value="created_at-desc">Más recientes</option>
              <option value="created_at-asc">Más antiguos</option>
              <option value="price-desc">Mayor precio</option>
              <option value="price-asc">Menor precio</option>
              <option value="title-asc">Título (A-Z)</option>
              <option value="title-desc">Título (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            <Image
                              src={getImageUrl(product.image_url)}
                              alt={product.title}
                              className="object-cover rounded-md"
                              fill
                              unoptimized={process.env.NEXT_PUBLIC_API_URL?.includes('localhost')}
                              sizes="40px"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category_name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.seller_name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ProductStatusBadge status={product.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/product/${product.id}`)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Ver"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/products/${product.id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          
                          {product.status === "active" ? (
                            <button
                              onClick={() => handleChangeStatus(product.id, "inactive")}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Desactivar"
                            >
                              <FiX />
                            </button>
                          ) : product.status === "inactive" ? (
                            <button
                              onClick={() => handleChangeStatus(product.id, "active")}
                              className="text-green-600 hover:text-green-900"
                              title="Activar"
                            >
                              <FiCheck />
                            </button>
                          ) : null}
                          
                          <button
                            onClick={() => confirmDelete(product)}
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
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron productos
                    </td>
                  </tr>
                )}
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
              ¿Estás seguro de que deseas eliminar el producto <span className="font-medium">{productToDelete?.title}</span>?
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

function ProductStatusBadge({ status }) {
  let color

  switch (status) {
    case "active":
      color = "bg-green-100 text-green-800"
      break
    case "inactive":
      color = "bg-yellow-100 text-yellow-800"
      break
    case "deleted":
      color = "bg-red-100 text-red-800"
      break
    default:
      color = "bg-gray-100 text-gray-800"
  }

  const statusText = {
    active: "Activo",
    inactive: "Inactivo",
    deleted: "Eliminado",
  }

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {statusText[status] || status}
    </span>
  )
}