"use client"

import { useState } from "react"
import { FiStar } from "react-icons/fi"
import axios from "@/lib/axios"
import toast from "react-hot-toast"

export default function ReviewForm({ productId, onSubmitted, onCancel }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error("Por favor selecciona una calificación")
      return
    }

    if (!comment.trim()) {
      toast.error("Por favor escribe un comentario")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await axios.post("/reviews", {
        product_id: productId,
        rating,
        comment: comment.trim()
      })

      if (res.data.success) {
        const newReview = {
          id: res.data.data.id,
          rating,
          comment: comment.trim(),
          reviewer_name: "Tu reseña",
          created_at: new Date().toISOString()
        }
        onSubmitted(newReview)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error(error.response?.data?.message || "Error al enviar reseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStarSelector = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <FiStar
              size={24}
              className={`${
                star <= rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Escribe tu reseña</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación *
          </label>
          {renderStarSelector()}
          <p className="text-xs text-gray-500 mt-1">
            Haz clic en las estrellas para calificar
          </p>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comentario *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Comparte tu experiencia con este producto..."
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? "Enviando..." : "Enviar reseña"}
          </button>
        </div>
      </form>
    </div>
  )
}