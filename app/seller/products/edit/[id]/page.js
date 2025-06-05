"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { FiArrowLeft, FiUpload } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import toast from "react-hot-toast"

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

export default function EditProduct({ params }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    location: "",
    stock: "1",
    status: "active",
    image: null,
  })

  useEffect(() => {
    // Redirect if not a seller
    if (!loading && (!user || user.role !== "seller")) {
      toast.error("Acceso denegado. Debes ser un vendedor para ver esta página.")
      router.push("/")
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch categories
        const categoriesRes = await axios.get("/categories")
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data)
        }

        // Fetch product details
        const productRes = await axios.get(`/products/${params.id}`)
        if (productRes.data.success) {
          const product = productRes.data.data

          // Check if product belongs to current seller
          if (product.seller_id !== user.id && user.role !== "admin") {
            toast.error("No tienes permiso para editar este producto")
            router.push("/seller/products")
            return
          }

          setFormData({
            title: product.title,
            description: product.description,
            price: product.price.toString(),
            category_id: product.category_id.toString(),
            location: product.location || "",
            stock: product.stock.toString(),
            status: product.status,
            image: null,
          })

          if (product.image_url) {
            setImagePreview(getImageUrl(product.image_url))
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar los datos del producto")
        router.push("/seller/products")
      } finally {
        setIsLoading(false)
      }
    }

    if (user && user.role === "seller") {
      fetchData()
    }
  }, [user, loading, router, params.id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.price || !formData.category_id) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      setIsSubmitting(true)

      // Create FormData object for file upload
      const productFormData = new FormData()
      productFormData.append("title", formData.title)
      productFormData.append("description", formData.description)
      productFormData.append("price", formData.price)
      productFormData.append("category_id", formData.category_id)
      productFormData.append("stock", formData.stock)
      productFormData.append("status", formData.status)

      if (formData.location) {
        productFormData.append("location", formData.location)
      }

      if (formData.image) {
        productFormData.append("image", formData.image)
      }

      const res = await axios.put(`/products/${params.id}`, productFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (res.data.success) {
        toast.success("Producto actualizado correctamente")
        router.push("/seller/products")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error(error.response?.data?.message || "Error al actualizar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return
    
    try {
      setIsSubmitting(true)
      await axios.delete(`/products/${params.id}`)
      toast.success("Producto eliminado correctamente")
      router.push("/seller/products")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error al eliminar producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/seller/products" className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <FiArrowLeft className="mr-2" />
        Volver a mis productos
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold">Editar Producto</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título del producto *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock disponible *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del producto</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {imagePreview ? (
                    <div className="space-y-1 text-center">
                      <div className="relative h-32 w-32 mx-auto">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-contain rounded"
                          unoptimized={process.env.NEXT_PUBLIC_API_URL?.includes('localhost')}
                        />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                        >
                          <span>Cambiar imagen</span>
                          <input
                            id="image"
                            name="image"
                            type="file"
                            className="sr-only"
                            onChange={handleImageChange}
                            accept="image/*"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                        >
                          <span>Subir una imagen</span>
                          <input
                            id="image"
                            name="image"
                            type="file"
                            className="sr-only"
                            onChange={handleImageChange}
                            accept="image/*"
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href="/seller/products"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-4"
            >
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary mr-4" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Eliminando..." : "Eliminar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
