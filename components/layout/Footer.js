import Link from "next/link"
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from "react-icons/fi"

export default function Footer() {
  return (
    <footer className="bg-gray-100 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Marketplace</h3>
            <p className="text-gray-600 mb-4">
              Tu plataforma para comprar y vender productos de forma segura y confiable.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-primary-600">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary-600">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary-600">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary-600">
                <FiYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary-600">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-600 hover:text-primary-600">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-primary-600">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/sellers" className="text-gray-600 hover:text-primary-600">
                  Vendedores
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Atención al cliente</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary-600">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-primary-600">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-primary-600">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-primary-600">
                  Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary-600">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary-600">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-primary-600">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6">
          <p className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} Marketplace. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
