"use client"

import { useState } from "react"
import Link from "next/link"
import { FiStar, FiShoppingCart, FiHeart } from "react-icons/fi"
import useCartStore from "@/store/cartStore"
import toast from "react-hot-toast"
import Image from "next/image"

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toast.success("Producto añadido a favoritos")
  }

  // Construir la URL completa de la imagen
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

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className="card h-full transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-48 sm:h-56">
          <Image
            src={getImageUrl(product.image_url)}
            alt={product.title}
            fill
            className="object-contain rounded"
            onError={() => setImageError(true)}
          />

          {/* Quick action buttons */}
          <div
            className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={handleWishlist}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              aria-label="Add to wishlist"
            >
              <FiHeart className="text-gray-700" size={18} />
            </button>
            <button
              onClick={handleAddToCart}
              className="p-2 bg-primary-600 rounded-full shadow-md hover:bg-primary-700"
              aria-label="Add to cart"
            >
              <FiShoppingCart className="text-white" size={18} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 truncate">{product.title}</h3>

          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <FiStar className="text-yellow-400 fill-current" size={16} />
              <span className="ml-1 text-sm text-gray-700">{product.average_rating || 0}</span>
            </div>
            <span className="mx-1 text-gray-400">•</span>
            <span className="text-sm text-gray-500">{product.review_count || 0} reseñas</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">${Number.parseFloat(product.price).toFixed(2)}</span>
            <span className="text-sm text-gray-500">{product.seller_name}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
