import axios from "axios"
import { currentUserTenant } from "@/utils/currentUserTenant";

import { Product, ProductCategory } from "../productmodels/Product"

// Get token from localStorage or environment
const token = "bennGJlPG_qUNKhCSE9WFUo6G_RnQAts" ||""

export class ProductService {
  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_URL}/items/products`
    this.axios = axios.create({
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
  }

 async getProducts() {
  try {
    const tenantId = currentUserTenant.getTenantId();
    console.debug('[getProducts] Tenant ID:', tenantId);

    const url = `${this.baseUrl}?filter[_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][serialNumber][_empty]=true`;
    console.debug('[getProducts] Request URL:', url);

    const response = await this.axios.get(url);
    console.debug('[getProducts] Response status:', response.status);

    if (response.status === 200) {
      const responseData = response.data;
      console.debug('[getProducts] Raw response data:', responseData);

      if (responseData.data && Array.isArray(responseData.data)) {
        const products = responseData.data.map((json) => Product.fromJson(json));
        console.debug('[getProducts] Parsed products:', products);
        return products;
      } else {
        console.error('[getProducts] Unexpected response format:', responseData);
        return [];
      }
    } else {
      throw new Error(`[getProducts] Failed to load products: ${response.status}`);
    }
  } catch (error) {
    console.error('[getProducts] Error getting products:', error);
    return [];
  }
}


 async fetchProductDetails(productId) {
  try {
    const url = `${this.baseUrl}?filter[_and][0][id][_eq]=${productId}`;
    console.log("fetchProductDetails API URL:", url);
    const response = await this.axios.get(url);
    console.log("fetchProductDetails API response:", response);
    
    if (response.status === 200) {
      const responseData = response.data;
      if (responseData.data && responseData.data.length > 0) {
        return Product.fromJson(responseData.data[0]); // ✅ Use the first item
      } else {
        console.error("No product data found:", responseData);
        return null;
      }
    } else {
      throw new Error(`Failed to fetch product details: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
}


  // addProduct now expects a Product object that is already prepared with all data, including productImageId
  async addProduct(product) {
    try {
      const payload = product.toJson() // Product.toJson() now handles productImageId

      if (product.id) {
        console.log("Posting serial number update payload (full product details):", payload)
      } else {
        console.log("Adding new product payload:", payload)
      }

      const response = await this.axios.post(this.baseUrl, payload)

      if (response.status >= 200 && response.status < 300) {
        console.log("Operation successful:", response.data)
        return true
      } else {
        console.error("API Error:", response.status, response.data)
        return false
      }
    } catch (error) {
      console.error("Product operation error:", error)
      throw error
    }
  }

  async updateProduct(productId, updateData, imageFile = null) {
    try {
      if (imageFile) {
        const fileId = await FileService.uploadImage(imageFile)
        if (fileId) {
          updateData.product = fileId
        }
      }

      console.log("Update API payload:", updateData)

      const response = await this.axios.patch(`${this.baseUrl}/${productId}`, updateData)

      if (response.status >= 200 && response.status < 300) {
        console.log("Successfully updated product")
        return true
      } else {
        console.error("Failed to update product. Status code:", response.status)
        console.error("Response body:", response.data)
        return false
      }
    } catch (error) {
      console.error("Error updating product:", error)
      return false
    }
  }

  async updateProductCategory(productId, categoryId) {
    try {
      const response = await this.axios.patch(`${this.baseUrl}/${productId}`, { category: categoryId })

      if (response.status >= 200 && response.status < 300) {
        console.log("Successfully updated product category")
        return true
      } else {
        console.error("Failed to update product category. Status code:", response.status)
        console.error("Response body:", response.data)
        return false
      }
    } catch (error) {
      console.error("Error updating product category:", error)
      return false
    }
  }

  async checkModelNumberExists(modelNumber) {
    try {
      const response = await this.axios.get(`${this.baseUrl}?filter[modelNumber][_eq]=${modelNumber}`)

      if (response.status === 200) {
        const responseData = response.data

        if (responseData.data && Array.isArray(responseData.data)) {
          return responseData.data.length > 0
        }
      }
      return false
    } catch (error) {
      console.error("Error checking model number:", error)
      return false
    }
  }
}

export class CategoryService {
  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_URL}/items/prodCategory`
    this.axios = axios.create({
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getCategories() {
          const tenantId = currentUserTenant.getTenantId();

    try {
      const response = await this.axios.get(`${this.baseUrl}?filter[_and][0][tenant][_eq]=${tenantId}`)

      if (response.status === 200) {
        const responseData = response.data
        console.log('Raw category API response:', responseData);
        if (responseData.data && Array.isArray(responseData.data)) {
          return responseData.data.map((json) => ProductCategory.fromJson(json))
          
        } else {
          console.error("Unexpected response format:", responseData)
          return []
        }
      } else {
        throw new Error(`Failed to load categories: ${response.status}`)
      }
    } catch (error) {
      console.error("Error getting categories:", error)
      return []
    }
  }

  async createCategory(category) {
    try {
        console.log("Creating category with payload:", category);
        console.log("Creating category with payload:", category);
      const response = await this.axios.post(this.baseUrl, category)

      if (response.status >= 200 && response.status < 300) {
        const responseData = response.data
        if (responseData.data) {
          return ProductCategory.fromJson(responseData.data)
        }
      }
      return null
    } catch (error) {
      console.error("Error creating category:", error)
      return null
    }
  }

  async deleteCategory(categoryId) {
    try {
      const response = await this.axios.delete(`${this.baseUrl}/${categoryId}`)

      if (response.status >= 200 && response.status < 300) {
        return true
      } else {
        console.error("Failed to delete category. Status code:", response.status)
        console.error("Response body:", response.data)
        return false
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      return false
    }
  }
}

export class FileService {
  static baseUrl = `${import.meta.env.VITE_API_URL}`
  static MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  static async uploadImage(file) {
    try {
      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error("File size exceeds maximum limit of 10MB")
      }

      const extension = file.name.split(".").pop().toLowerCase()
      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post(`${this.baseUrl}/files?access_token=${token}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.status === 200) {
        const fileId = response.data.data.id
        console.log("Image uploaded successfully with ID:", fileId)
        return fileId
      } else {
        console.error("Failed to upload image. Status code:", response.status)
        console.error("Response body:", response.data)
        throw new Error(`Failed to upload image: ${response.status}`)
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  }

  static async uploadFile(file) {
    try {
      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error("File size exceeds maximum limit of 10MB")
      }

      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post(`${this.baseUrl}/files?access_token=${token}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.status === 200) {
        const fileId = response.data.data.id
        console.log("File uploaded successfully with ID:", fileId)
        return fileId
      } else {
        console.error("Failed to upload file. Status code:", response.status)
        console.error("Response body:", response.data)
        throw new Error(`Failed to upload file: ${response.status}`)
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    }
  }
}
