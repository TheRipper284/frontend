import axios from "./axios"

// Funciones para usuarios
export const getUsers = async (page = 1, limit = 10, sort = "created_at", order = "desc", role = "") => {
  try {
    const params = { page, limit, sort, order }
    if (role && role !== "all") {
      params.role = role
    }

    const response = await axios.get("/admin/users", { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getUsersStats = async () => {
  try {
    const response = await axios.get("/admin/users/stats")
    return response.data
  } catch (error) {
    throw error
  }
}

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`/admin/users/${userId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`/admin/users/${userId}`, userData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`/admin/users/${userId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await axios.patch(`/admin/users/${userId}/status`, { status })
    return response.data
  } catch (error) {
    throw error
  }
}

// Funciones para productos
export const getProducts = async (page = 1, limit = 10, sort = "created_at", order = "desc", category = "", status = "") => {
  try {
    const params = { page, limit, sort, order }
    if (category) {
      params.category = category
    }
    if (status) {
      params.status = status
    }

    const response = await axios.get("/admin/products", { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getProductsStats = async () => {
  try {
    const response = await axios.get("/admin/products/stats")
    return response.data
  } catch (error) {
    throw error
  }
}

export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`/admin/products/${productId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateProduct = async (productId, productData) => {
  try {
    const response = await axios.put(`/admin/products/${productId}`, productData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`/admin/products/${productId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateProductStatus = async (productId, status) => {
  try {
    const response = await axios.patch(`/admin/products/${productId}/status`, { status })
    return response.data
  } catch (error) {
    throw error
  }
}

// Funciones para categorías
export const getCategories = async () => {
  try {
    const response = await axios.get("/admin/categories")
    return response.data
  } catch (error) {
    throw error
  }
}

export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post("/admin/categories", categoryData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await axios.put(`/admin/categories/${categoryId}`, categoryData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteCategory = async (categoryId) => {
  try {
    const response = await axios.delete(`/admin/categories/${categoryId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Funciones para órdenes
export const getOrders = async (page = 1, limit = 10, sort = "created_at", order = "desc", status = "") => {
  try {
    const params = { page, limit, sort, order }
    if (status) {
      params.status = status
    }

    const response = await axios.get("/admin/orders", { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getOrdersStats = async () => {
  try {
    const response = await axios.get("/admin/orders/stats")
    return response.data
  } catch (error) {
    throw error
  }
}

export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`/admin/orders/${orderId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(`/admin/orders/${orderId}/status`, { status })
    return response.data
  } catch (error) {
    throw error
  }
} 