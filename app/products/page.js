"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { FiFilter, FiGrid, FiList, FiSearch } from "react-icons/fi"
import ProductCard from "@/components/products/ProductCard"
import axios from "@/lib/axios"
import toast from "react-hot-toast"
import useCartStore from "@/store/cartStore"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch categories
        const categoriesRes = await axios.get("/categories")
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data)
        }

        // Prepare query params for products
        const queryParams = {}
        if (filters.search) queryParams.search = filters.search
        if (filters.category) queryParams.category = filters.category
        if (filters.minPrice) queryParams.min_price = filters.minPrice
        if (filters.maxPrice) queryParams.max_price = filters.maxPrice
        if (filters.sort) queryParams.sort = filters.sort

        // Fetch products
        const productsRes = await axios.get("/products", { params: queryParams })
        if (productsRes.data.success) {
          setProducts(productsRes.data.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar los productos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters, searchParams])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Update URL with search params
    const url = new URL(window.location)

    if (filters.search) {
      url.searchParams.set("search", filters.search)
    } else {
      url.searchParams.delete("search")
    }

    if (filters.category) {
      url.searchParams.set("category", filters.category)
    } else {
      url.searchParams.delete("category")
    }

    window.history.pushState({}, "", url)
  }

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Productos</h1>

      {/* Search and filters bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md flex items-center hover:bg-gray-50"
              onClick={toggleFilters}
            >
              <FiFilter className="mr-2" />
              Filtros
            </button>
            <div className="hidden md:flex border border-gray-300 rounded-md overflow-hidden">
              <button
                type="button"
                className={`p-2 ${viewMode === "grid" ? "bg-gray-100" : "bg-white"}`}
                onClick={() => setViewMode("grid")}
                aria-label="Vista de cuadrícula"
              >
                <FiGrid />
              </button>
              <button
                type="button"
                className={`p-2 ${viewMode === "list" ? "bg-gray-100" : "bg-white"}`}
                onClick={() => setViewMode("list")}
                aria-label="Vista de lista"
              >
                <FiList />
              </button>
            </div>
            <select
              name="sort"
              className="px-4 py-2 border border-gray-300 rounded-md appearance-none bg-white"
              value={filters.sort}
              onChange={handleFilterChange}
            >
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="rating">Mejor valorados</option>
            </select>
          </div>
        </form>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio mínimo
                </label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio máximo
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products grid/list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">No se encontraron productos</h2>
          <p className="text-gray-500 mb-6">Intenta con otros filtros de búsqueda</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
          {products.map((product) => (
            <div key={product.id} className={viewMode === "list" ? "bg-white rounded-lg shadow-md p-4" : ""}>
              {viewMode === "grid" ? (
                <ProductCard product={product} />
              ) : (
                <div className="flex">
                  <div className="flex-shrink-0 w-32 h-32 relative">
                    <Image
                      src={product.image_url || "/placeholder.jpg"}
                      alt={product.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <Link href={`/products/${product.id}`} className="hover:text-primary-600">
                      <h3 className="text-lg font-medium text-gray-900">{product.title}</h3>
                    </Link>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-sm text-gray-700">{product.average_rating || 0}</span>
                      </div>
                      <span className="mx-1 text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{product.review_count || 0} reseñas</span>
                    </div>
                    <p className="text-primary-600 font-medium mt-2">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">Vendedor: {product.seller_name}</p>
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          const addItem = useCartStore.getState().addItem
                          addItem(product)
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Añadir al carrito
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
