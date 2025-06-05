"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FiShoppingBag, FiUsers, FiCreditCard, FiTruck, FiPlus } from "react-icons/fi"
import ProductCard from "@/components/products/ProductCard"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import Image from "next/image"

export default function Home() {
  const { user } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch featured products
        const productsRes = await axios.get("/products", { params: { sort: "rating", limit: 4 } })
        if (productsRes.data.success) {
          setFeaturedProducts(productsRes.data.data)
        }

        // Fetch categories
        const categoriesRes = await axios.get("/categories")
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data)
        }
      } catch (error) {
        console.error("Error fetching home data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  // Componente para el botón de vendedor que verifica si el usuario está autenticado
  const SellerButton = () => {
    if (user && user.role === "seller") {
      return (
        <Link href="/seller/dashboard" className="btn bg-white text-primary-700 hover:bg-gray-100">
          Panel de vendedor
        </Link>
      )
    } else {
      return (
        <Link href="/register?role=seller" className="btn bg-white text-primary-700 hover:bg-gray-100">
          Comenzar a vender
        </Link>
      )
    }
  }

  // Componente para mostrar acciones rápidas para vendedores
  const SellerQuickActions = () => {
    if (user && user.role === "seller") {
      return (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Acciones rápidas para vendedores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/seller/products/new"
                className="bg-white p-6 rounded-lg shadow-md flex items-center hover:shadow-lg transition-shadow"
              >
                <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                  <FiPlus size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">Nuevo producto</h3>
                  <p className="text-sm text-gray-500">Publica un nuevo producto para vender</p>
                </div>
              </Link>

              <Link
                href="/seller/products"
                className="bg-white p-6 rounded-lg shadow-md flex items-center hover:shadow-lg transition-shadow"
              >
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <FiShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">Mis productos</h3>
                  <p className="text-sm text-gray-500">Gestiona tus productos publicados</p>
                </div>
              </Link>

              <Link
                href="/seller/orders"
                className="bg-white p-6 rounded-lg shadow-md flex items-center hover:shadow-lg transition-shadow"
              >
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <FiTruck size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">Pedidos</h3>
                  <p className="text-sm text-gray-500">Revisa y gestiona tus pedidos</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )
    }
    return null
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Compra y vende de forma fácil y segura</h1>
              <p className="text-xl mb-6">Encuentra miles de productos o comienza a vender los tuyos hoy mismo.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="btn btn-primary">
                  Explorar productos
                </Link>
                <SellerButton />
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md h-64 md:h-80">
                <div className="relative h-64 w-full">
                  <Image
                    src="/ventas.png"
                    alt="Marketplace"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Quick Actions - Solo visible para vendedores */}
      <SellerQuickActions />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegirnos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <FiShoppingBag className="text-primary-600 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Amplia variedad</h3>
              <p className="text-gray-600">Miles de productos en diferentes categorías para elegir.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <FiUsers className="text-primary-600 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunidad confiable</h3>
              <p className="text-gray-600">Vendedores verificados y sistema de reseñas transparente.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <FiCreditCard className="text-primary-600 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pagos seguros</h3>
              <p className="text-gray-600">Transacciones protegidas y múltiples métodos de pago.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <FiTruck className="text-primary-600 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Envío rápido</h3>
              <p className="text-gray-600">Opciones de envío eficientes a todo el país.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Productos destacados</h2>
            <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium">
              Ver todos
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando productos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Explora por categorías</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Cargando categorías...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                    <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={getImageUrl(category.image_url)}
                        alt={category.name}
                        fill
                        className="object-contain rounded"
                        unoptimized={process.env.NEXT_PUBLIC_API_URL?.includes('localhost')}
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad de compradores y vendedores hoy mismo y descubre una nueva forma de comprar y
            vender.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn bg-white text-primary-700 hover:bg-gray-100">
              Crear una cuenta
            </Link>
            <Link href="/products" className="btn border border-white hover:bg-primary-700">
              Explorar productos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
