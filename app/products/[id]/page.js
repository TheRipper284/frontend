"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiShoppingCart, FiHeart, FiStar, FiMessageCircle, FiMinus, FiPlus } from "react-icons/fi"
import { useAuth } from "@/context/AuthContext"
import useCartStore from "@/store/cartStore"
import axios from "@/lib/axios"
import toast from "react-hot-toast"
import Image from "next/image"
import ReviewForm from "@/components/ReviewForm"


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

export default function ProductDetailPage({ params }) {
  const { user } = useAuth()
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [canReview, setCanReview] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        
        // Incrementar visualizaciones
        try {
          await axios.post(`/products/${params.id}/view`)
        } catch (viewError) {
          console.error("Error al incrementar visualizaciones:", viewError)
          
        }
        
        // Obtener producto
        const res = await axios.get(`/products/${params.id}`)
        if (res.data.success) {
          setProduct(res.data.data)
        }

        // Obtener reseñas
        try {
          const reviewsRes = await axios.get(`/reviews/product/${params.id}`)
          if (reviewsRes.data.success) {
            setReviews(reviewsRes.data.data)
          }
        } catch (reviewError) {
          console.error("Error al cargar reseñas:", reviewError)
          setReviews([])
        }

        // Verificar si el usuario puede reseñar
        if (user) {
          try {
            const canReviewRes = await axios.get(`/reviews/can-review/${params.id}`)
            if (canReviewRes.data.success) {
              setCanReview(canReviewRes.data.canReview)
            }
          } catch (canReviewError) {
            console.error("Error al verificar elegibilidad de reseña:", canReviewError)
            setCanReview(false)
          }
        }
      } catch (error) {
        console.error("Error al cargar el producto:", error)
        toast.error("Error al cargar la información del producto")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, user])

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value)
    if (value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < (product?.stock || 1)) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    addItem(product, quantity)
    toast.success(`${quantity} ${quantity === 1 ? "unidad" : "unidades"} de ${product.title} añadido al carrito`)
  }

  const handleBuyNow = () => {
    if (!product) return

    if (!user) {
      toast.error("Debes iniciar sesión para comprar")
      router.push(`/login?redirect=/products/${params.id}`)
      return
    }

    addItem(product, quantity)
    router.push("/cart")
  }

  const handleContactSeller = () => {
    if (!user) {
      toast.error("Debes iniciar sesión para contactar al vendedor")
      router.push(`/login?redirect=/products/${params.id}`)
      return
    }

    router.push(`/messages/${product.seller_id}?product=${product.id}`)
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar 
          key={i} 
          className={`${i <= Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
          size={16} 
        />
      )
    }
    return stars
  }

  const handleReviewSubmitted = (newReview) => {
    setReviews([newReview, ...reviews])
    setCanReview(false)
    setShowReviewForm(false)
    toast.success("Reseña agregada exitosamente")
  }

  const isOwner = user && product && user.id === product.seller_id

  const handleDeleteProduct = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return
    
    try {
      await axios.delete(`/products/${product.id}`)
      toast.success("Producto eliminado correctamente")
      router.push("/seller/products")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error al eliminar producto")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-500 mb-6">El producto que buscas no existe o ha sido eliminado</p>
          <Link href="/products" className="btn btn-primary">
            Ver otros productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <FiArrowLeft className="mr-2" />
        Volver a productos
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product image */}
          <div className="relative h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={getImageUrl(product.image_url)}
              alt={product.title}
              fill
              className="object-contain rounded"
              unoptimized={process.env.NEXT_PUBLIC_API_URL?.includes('localhost')}
              priority
            />
          </div>

          {/* Product info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderStars(product.average_rating || 0)}
                <span className="ml-2 text-sm text-gray-700">
                  {Number(product.average_rating || 0).toFixed(1)}
                </span>
              </div>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-sm text-gray-500">{reviews.length} reseñas</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                {product.views || 0} visualizaciones
              </span>
            </div>

            <div className="text-2xl font-bold text-primary-600 mb-4">
              ${Number.parseFloat(product.price).toFixed(2)}
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Vendedor: {product.seller_name}</p>
              <p className="text-sm text-gray-500 mb-4">Categoría: {product.category_name}</p>
              <p className="text-sm text-gray-500">
                Stock disponible: {product.stock > 0 ? product.stock : "Agotado"}
              </p>
            </div>

            {isOwner ? (
              // Vista para el vendedor (dueño del producto)
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Panel de vendedor</h3>
                  <p className="text-blue-600 text-sm">Este es tu producto</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link 
                    href={`/seller/products/edit/${product.id}`}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 text-center"
                  >
                    Editar Producto
                  </Link>
                  
                  <button
                    onClick={handleDeleteProduct}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
                  >
                    Eliminar Producto
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">{product.stock}</p>
                    <p className="text-sm text-gray-600">Stock disponible</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {product.views || 0}
                    </p>
                    <p className="text-sm text-gray-600">Visualizaciones</p>
                  </div>
                </div>
              </div>
            ) : (
              // Vista para compradores
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      <FiMinus />
                    </button>
                    <span className="px-4 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Stock disponible: {product.stock}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  <FiShoppingCart className="mr-2" />
                  {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 disabled:border-gray-400 disabled:text-gray-400"
                >
                  Comprar ahora
                </button>

                {user && (
                  <button
                    onClick={handleContactSeller}
                    className="w-full border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center"
                  >
                    <FiMessageCircle className="mr-2" />
                    Contactar vendedor
                  </button>
                )}
              </div>
            )}

            {!user && (
              <div className="mt-4 text-center text-gray-500 text-sm">
                <Link href="/login" className="text-primary-600 hover:underline">
                  Inicia sesión
                </Link> para agregar al carrito o contactar vendedor
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "description"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Descripción
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "reviews"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Reseñas ({reviews.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "description" ? (
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Botón para agregar reseña */}
                {user && canReview && !isOwner && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    Escribir reseña
                  </button>
                )}

                {/* Formulario de reseña */}
                {showReviewForm && (
                  <ReviewForm
                    productId={product.id}
                    onSubmitted={handleReviewSubmitted}
                    onCancel={() => setShowReviewForm(false)}
                  />
                )}

                {/* Lista de reseñas */}
                {reviews.length === 0 ? (
                  <p className="text-gray-500">Este producto aún no tiene reseñas.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">{renderStars(review.rating)}</div>
                        <span className="ml-2 font-medium">{review.reviewer_name}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(review.created_at).toLocaleDateString('es-ES')}
                      </p>
                      <p>{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
