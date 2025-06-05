import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "@/context/AuthContext"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Marketplace - Compra y vende productos",
  description: "Plataforma de marketplace para comprar y vender productos",
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
