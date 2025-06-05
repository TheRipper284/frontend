"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FiEdit, FiTrash2, FiPlus, FiEye, FiAlertCircle } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import toast from "react-hot-toast"

// Example products data
const exampleProducts = [
  {
    id: 1,
    title: "Smartphone XYZ",
    description: "Un smartphone de última generación con características avanzadas y excelente rendimiento.",
    price: 599.99,
    image_url: "/placeholder.svg",
    stock: 10,
    status: "active",
    created_at: "2023-05-10T14:30:00Z",
    category_name: "Electrónica",
  },
  {
    id: 2,
    title: "Laptop Pro",
    description: "Potente laptop para profesionales y gamers con la última tecnología.",
    price: 1299.99,
    image_url: "/placeholder.svg",
    stock: 5,
    status: "active",
    created_at: "2023-05-05T10:15:00Z",
    category_name: "Electrónica",
  },
  {
    id: 3,
    title: "Wireless Headphones",
    description: "Auriculares inalámbricos con cancelación de ruido y gran calidad de sonido.",
    price: 149.99,
    image_url: "/placeholder.svg",
    stock: 0,
    status: "inactive",
    created_at: "2023-04-20T16:45:00Z",
    category_name: "Electrónica",
  },
]

export default function SellerProductsPage() {
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Redirect if not authenticated or not a seller
    if (!authLoading && (!user || user.role !== "seller")) {
      toast.error("No tienes permisos para acceder a esta página")
      router.push("/")
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // In a real app, you would call your API here
        // const res = await axios.get("/products/seller")
        // setProducts(res.data.data)
        
        // Using example data for now
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setProducts(exampleProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast.error("Error al cargar los productos")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "seller") {
      fetchProducts()
    }
  }, [user, authLoading, router])

  const handleDeleteClick = (product) => {
    setProductToDelete(product)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      // In a real app, you would call your API here
      // await axios.delete(`/products/${productToDelete.id}`)
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Update local state
      setProducts(products.filter((p) => p.id !== productToDelete.id))
      
      toast.success("Producto eliminado correctamente")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error al eliminar el producto")
    } finally {
      setDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const getStatusBadge = (status) => {
    if (status === "active") {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Activo</span>
    } else if (status === "inactive") {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Inactivo</span>
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Eliminado</span>
    }
  }

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

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "seller") {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis productos</h1>
        <Link href="/seller/products/new" className="btn btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="flex justify-center mb-4">
            <FiAlertCircle className="text-gray-400" size={64} />
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-2">No tienes productos</h2>
          <p className="text-gray-500 mb-6">Comienza a vender añadiendo tu primer producto</p>
          <Link href="/seller/products/new" className="btn btn-primary">
            Añadir producto
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
                    Producto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categoría
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Precio
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Stock
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
                    Fecha
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <Image
                            src={getImageUrl(product.image_url)}
                            alt={product.title}
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${product.stock === 0 ? "text-red-600 font-medium" : "text-gray-900"}`}>
                        {product.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(product.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <Link
                          href={`/products/${product.id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Ver producto"
                        >
                          <FiEye size={18} />
                        </Link>
                        <Link
                          href={`/seller/products/${product.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar producto"
                        >
                          <FiEdit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar producto"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
            <p className="text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar el producto &quot;{productToDelete?.title}&quot;? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={confirmDelete}
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