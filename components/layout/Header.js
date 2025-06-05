"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import useCartStore from "@/store/cartStore"
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch } from "react-icons/fi"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  const pathname = usePathname()
  const { user, logout } = useAuth()
  const cartItemCount = useCartStore((state) => state.getItemCount())

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle click outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  // Toggle profile menu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary-600">Marketplace</span>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/products"
              className={`px-3 py-2 rounded-md ${
                pathname === "/products" ? "text-primary-600" : "text-gray-700 hover:text-primary-600"
              }`}
            >
              Productos
            </Link>

            {user ? (
              <>
                <Link href="/cart" className="relative p-2">
                  <FiShoppingCart className="text-gray-700 hover:text-primary-600" size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    className="flex items-center space-x-1 p-2"
                    onClick={toggleProfileMenu}
                    aria-expanded={isProfileMenuOpen}
                  >
                    <FiUser className="text-gray-700" size={20} />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-20">
                      <div className="py-2">
                        <span className="block px-4 py-2 text-sm text-gray-700 border-b">{user.name}</span>
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Mi perfil
                        </Link>
                        <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Mis pedidos
                        </Link>
                        {user.role === "seller" && (
                          <Link
                            href="/seller/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Panel de vendedor
                          </Link>
                        )}
                        {user.role === "admin" && (
                          <Link
                            href="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Panel de administrador
                          </Link>
                        )}
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 text-gray-700 hover:text-primary-600">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">
                  Registrarse
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FiX className="text-gray-700" size={24} /> : <FiMenu className="text-gray-700" size={24} />}
          </button>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </form>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/products"
                className={`px-3 py-2 rounded-md ${pathname === "/products" ? "text-primary-600" : "text-gray-700"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Productos
              </Link>

              <Link
                href="/cart"
                className="flex items-center px-3 py-2 rounded-md text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiShoppingCart className="mr-2" />
                Carrito
                {cartItemCount > 0 && (
                  <span className="ml-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 rounded-md text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUser className="mr-2" />
                    Mi perfil
                  </Link>

                  <Link
                    href="/orders"
                    className="px-3 py-2 rounded-md text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis pedidos
                  </Link>

                  {user.role === "seller" && (
                    <Link
                      href="/seller/dashboard"
                      className="px-3 py-2 rounded-md text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Panel de vendedor
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="px-3 py-2 rounded-md text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Panel de administrador
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-gray-700"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-md text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>

                  <Link
                    href="/register"
                    className="px-3 py-2 rounded-md bg-primary-600 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
