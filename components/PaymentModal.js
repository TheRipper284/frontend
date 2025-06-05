"use client"

import { useState } from "react"
import { FiX } from "react-icons/fi"
import toast from "react-hot-toast"

// Tarjetas de prueba
const TEST_CARDS = {
  '4242424242424242': { type: 'success', message: 'Pago aprobado' },
  '4000000000000002': { type: 'declined', message: 'Tarjeta declinada' },
  '4000000000009995': { type: 'insufficient', message: 'Fondos insuficientes' },
  '4000000000000069': { type: 'expired', message: 'Tarjeta expirada' },
  '4000000000000127': { type: 'invalid_cvc', message: 'CVC inválido' }
}

export default function PaymentModal({ order, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Formatear número de tarjeta con espacios
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '')
      const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
      setFormData(prev => ({ ...prev, [name]: formatted }))
      return
    }
    
    // Formatear fecha de expiración
    if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '')
      let formatted = cleaned
      if (cleaned.length >= 2) {
        formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
      }
      setFormData(prev => ({ ...prev, [name]: formatted }))
      return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateCard = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '')
    return TEST_CARDS[cleaned] || null
  }

  const validateCardData = (cardNumber, expiryDate, cvv) => {
    const cleaned = cardNumber.replace(/\s/g, '')
    const cardValidation = TEST_CARDS[cleaned]
    
    if (!cardValidation) return { valid: false, message: "Número de tarjeta no válido para pruebas" }
    
    // Validar fecha de expiración
    const [month, year] = expiryDate.split('/')
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1
    
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      return { valid: false, message: "Tarjeta expirada" }
    }
    
    // Validaciones específicas por tarjeta
    if (cleaned === '4000000000000069') {
      // Esta tarjeta siempre debe fallar por expirada, sin importar la fecha
      return { valid: false, message: cardValidation.message }
    }
    
    if (cleaned === '4000000000000127') {
      // Esta tarjeta requiere CVV específico
      if (cvv !== '123') {
        return { valid: false, message: cardValidation.message }
      }
    }
    
    return { valid: true, cardValidation }
  }

  const simulatePayment = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (paymentMethod === 'card') {
      // Validaciones básicas
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName) {
        toast.error("Por favor completa todos los campos de la tarjeta")
        return
      }
      
      // Validar número de tarjeta
      const cardNumber = formData.cardNumber.replace(/\s/g, '')
      const cardValidation = validateCard(cardNumber)
      
      if (!cardValidation) {
        toast.error("Número de tarjeta no válido para pruebas")
        return
      }
      
      // Validar CVC específico para tarjeta de CVC inválido
      if (cardNumber === '4000000000000127' && formData.cvv !== '123') {
        setIsProcessing(false)
        toast.error(cardValidation.message)
        return
      }
      
      setIsProcessing(true)
      
      // Simular procesamiento
      setTimeout(() => {
        setIsProcessing(false)
        
        if (cardValidation.type === 'success') {
          onSuccess(paymentMethod, 'paid')
          toast.success(cardValidation.message)
          onClose()
        } else {
          toast.error(cardValidation.message)
          // No cerrar el modal en caso de error para que puedan intentar otra tarjeta
        }
      }, 2000)
      
    } else {
      // Para OXXO y transferencia siempre exitoso pero queda en pending
      setIsProcessing(true)
      
      setTimeout(() => {
        setIsProcessing(false)
        onSuccess(paymentMethod, 'pending')
        toast.success(`Pago procesado con ${
          paymentMethod === 'oxxo' ? 'OXXO' : 'transferencia'
        }. El pedido quedará pendiente hasta confirmar el pago.`)
        onClose()
      }, 2000)
    }
  }

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md m-4"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Procesar Pago</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-lg font-semibold">Total: ${Number.parseFloat(order.total_amount).toFixed(2)}</p>
        </div>

        <form onSubmit={simulatePayment}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Método de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="card">Tarjeta de Crédito/Débito</option>
              <option value="oxxo">Pago en OXXO</option>
              <option value="transfer">Transferencia Bancaria</option>
            </select>
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-3 mb-4">
              <div>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Número de tarjeta"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  maxLength="19"
                />
                {/* Tarjetas de prueba disponibles */}
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <p className="font-medium mb-1">Tarjetas de prueba:</p>
                  <div className="space-y-1">
                    <p>✅ <code>4242 4242 4242 4242</code> - Aprobada</p>
                    <p>❌ <code>4000 0000 0000 0002</code> - Declinada</p>
                    <p>💰 <code>4000 0000 0000 9995</code> - Sin fondos</p>
                    <p>📅 <code>4000 0000 0000 0069</code> - Expirada</p>
                    <p>🔐 <code>4000 0000 0000 0127</code> - CVC inválido</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY (12/28)"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  maxLength="5"
                />
                <input
                  type="text"
                  name="cvv"
                  placeholder="CVV (123)"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  maxLength="4"
                />
              </div>
              <input
                type="text"
                name="cardName"
                placeholder="Nombre en la tarjeta"
                value={formData.cardName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          {paymentMethod === 'oxxo' && (
            <div className="text-center mb-4 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700">Se generará un código para pagar en OXXO</p>
              <p className="font-mono text-lg mt-2 font-semibold text-primary-600">Código: OXXO123456789</p>
              <p className="text-sm text-gray-500 mt-2">Presenta este código en cualquier tienda OXXO</p>
              <p className="text-xs text-yellow-600 mt-1">⚠️ El pedido quedará como PENDIENTE hasta confirmar el pago</p>
            </div>
          )}

          {paymentMethod === 'transfer' && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <p className="font-semibold text-gray-800 mb-2">Datos para transferencia:</p>
              <div className="space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">CLABE:</span> 012345678901234567</p>
                <p><span className="font-medium">Banco:</span> Banco de Pruebas S.A.</p>
                <p><span className="font-medium">Beneficiario:</span> Marketplace Test</p>
                <p className="text-xs text-yellow-600 mt-2">⚠️ El pedido quedará como PENDIENTE hasta confirmar el pago</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {isProcessing ? "Procesando..." : "Confirmar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}