"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import toast from "react-hot-toast"
import SellerRoute from "@/components/auth/SellerRoute"

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

export default function SellerProductsPage() {
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        setLoading(true)
        const res = await axios.get("/products")
        if (res.data.success) {
          // Filtrar solo los productos del vendedor actual
          const sellerProducts = res.data.data.filter(product => product.seller_id === user.id)
          setProducts(sellerProducts)
        }
      } catch (error) {
        console.error("Error fetching seller products:", error)
        toast.error("Error al cargar tus productos")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "seller") {
      fetchSellerProducts()
    }
  }, [user])

  const handleDeleteProduct = async (productId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return

    try {
      await axios.delete(`/products/${productId}`)
      setProducts(products.filter(product => product.id !== productId))
      toast.success("Producto eliminado correctamente")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error al eliminar producto")
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: "Activo", class: "bg-green-100 text-green-800" },
      inactive: { text: "Inactivo", class: "bg-red-100 text-red-800" }
    }
    
    const statusInfo = statusMap[status] || { text: status, class: "bg-gray-100 text-gray-800" }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <SellerRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mis Productos</h1>
          <Link href="/seller/products/new" className="btn btn-primary flex items-center">
            <FiPlus className="mr-2" />
            Nuevo Producto
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <FiPlus className="text-gray-400" size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">No tienes productos</h2>
            <p className="text-gray-500 mb-6">Crea tu primer producto para comenzar a vender</p>
            <Link href="/seller/products/new" className="btn btn-primary">
              Crear Producto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={getImageUrl(product.image_url)}
                    alt={product.title}
                    fill
                    className="object-contain"
                    unoptimized={process.env.NEXT_PUBLIC_API_URL?.includes('localhost')}
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {product.title}
                    </h3>
                    {getStatusBadge(product.status)}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      ${Number.parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    <p>Categoría: {product.category_name}</p>
                    <p>Creado: {new Date(product.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                    >
                      <FiEye className="mr-1" size={16} />
                      Ver
                    </Link>
                    <Link
                      href={`/seller/products/edit/${product.id}`}
                      className="flex-1 text-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center justify-center"
                    >
                      <FiEdit className="mr-1" size={16} />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SellerRoute>
  )
}

