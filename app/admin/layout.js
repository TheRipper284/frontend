"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FiHome, FiUsers, FiShoppingBag, FiFolder, FiShoppingCart, FiBarChart, FiSettings } from "react-icons/fi"
import AdminRoute from "@/components/auth/AdminRoute"

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: FiHome },
    { name: "Usuarios", href: "/admin/users", icon: FiUsers },
    { name: "Productos", href: "/admin/products", icon: FiShoppingBag },
    { name: "Categorías", href: "/admin/categories", icon: FiFolder },
    { name: "Pedidos", href: "/admin/orders", icon: FiShoppingCart },
    { name: "Reportes", href: "/admin/reports", icon: FiBarChart },
    { name: "Configuración", href: "/admin/settings", icon: FiSettings },
  ]

  return (
    <AdminRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div 
          className={`bg-white border-r border-gray-200 ${
            sidebarOpen ? "w-64" : "w-20"
          } transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <div className="p-4 flex justify-between items-center">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold text-primary-700">Admin Panel</h1>
            ) : (
              <h1 className="text-xl font-bold text-primary-700">AP</h1>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>
          <nav className="mt-5 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 my-1 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className={`mr-3 ${
                  sidebarOpen ? "h-5 w-5" : "h-6 w-6"
                }`} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm z-10">
            <div className="px-4 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {navItems.find(item => pathname === item.href)?.name || "Panel de Administración"}
              </h2>
            </div>
          </header>
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  )
}