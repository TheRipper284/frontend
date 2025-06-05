import { create } from "zustand"
import { persist } from "zustand/middleware"
import axios from "@/lib/axios"
import toast from "react-hot-toast"

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Add item to cart
      addItem: async (product, quantity = 1) => {
        const { items } = get()

        // Check if item already exists in cart
        const existingItem = items.find((item) => item.id === product.id)

        if (existingItem) {
          // Update quantity if item exists
          const updatedItems = items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
          )

          set({ items: updatedItems })
          toast.success("Producto actualizado en el carrito")
        } else {
          // Add new item if it doesn't exist
          set({ items: [...items, { ...product, quantity }] })
          toast.success("Producto añadido al carrito")
        }

        // Sync with server if user is logged in
        try {
          const token = localStorage.getItem("token")
          if (token) {
            await axios.post("/carts/items", {
              product_id: product.id,
              quantity,
            })
          }
        } catch (error) {
          console.error("Error syncing cart with server:", error)
        }
      },

      // Remove item from cart
      removeItem: async (productId) => {
        const { items } = get()
        const updatedItems = items.filter((item) => item.id !== productId)

        set({ items: updatedItems })
        toast.success("Producto eliminado del carrito")

        // Sync with server if user is logged in
        try {
          const token = localStorage.getItem("token")
          if (token) {
            await axios.delete(`/carts/items/${productId}`)
          }
        } catch (error) {
          console.error("Error syncing cart with server:", error)
        }
      },

      // Update item quantity
      updateQuantity: async (productId, quantity) => {
        const { items } = get()

        if (quantity <= 0) {
          return get().removeItem(productId)
        }

        const updatedItems = items.map((item) => (item.id === productId ? { ...item, quantity } : item))

        set({ items: updatedItems })

        // Sync with server if user is logged in
        try {
          const token = localStorage.getItem("token")
          if (token) {
            await axios.put(`/carts/items/${productId}`, { quantity })
          }
        } catch (error) {
          console.error("Error syncing cart with server:", error)
        }
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] })

        // Sync with server if user is logged in
        try {
          const token = localStorage.getItem("token")
          if (token) {
            axios.delete("/carts/items")
          }
        } catch (error) {
          console.error("Error syncing cart with server:", error)
        }
      },

      // Load cart from server
      loadCart: async () => {
        try {
          set({ isLoading: true })

          const token = localStorage.getItem("token")
          if (token) {
            const res = await axios.get("/carts/items")

            if (res.data.success) {
              // Transform server response to match local cart format
              const cartItems = res.data.data.map((item) => ({
                id: item.product_id,
                title: item.product_title,
                price: item.product_price,
                image_url: item.product_image,
                quantity: item.quantity,
              }))

              set({ items: cartItems })
            }
          }
        } catch (error) {
          console.error("Error loading cart from server:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Get cart total
      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      // Get cart item count
      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },

      // Sync with server
      syncWithServer: async () => {
        try {
          const token = localStorage.getItem("token")
          if (!token) return

          const { items } = get()
          
          // Limpiar carrito del servidor
          await axios.delete("/carts/items")
          
          // Añadir cada item al servidor
          for (const item of items) {
            await axios.post("/carts/items", {
              product_id: item.id,
              quantity: item.quantity,
            })
          }
        } catch (error) {
          console.error("Error syncing cart with server:", error)
        }
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)

export default useCartStore
