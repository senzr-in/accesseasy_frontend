// Product class to match the Flutter model
export class Product {
  constructor({
    id = null,
    productName,
    status = "draft",
    productImageId = null, // Stores the file ID for the API
    modelNumber = null,
    productId = null,
    tenant,
    userCreated,
    serialNumber = null,
    taskId = null,
    variant = null,
    deviceType = null,
    category = null,
    manual = null,
    warrantyDocument = null,
    technicalDocument = null,
    // imageUrl is for display purposes, not directly sent to API in toJson
    imageUrl = null,
  }) {
    this.id = id
    this.productName = productName
    this.status = status
    this.productImageId = productImageId // Store the ID
    this.imageUrl = imageUrl // For display purposes (e.g., full URL)
    this.modelNumber = modelNumber
    this.productId = productId || modelNumber // Use productId or fallback to modelNumber
    this.tenant = tenant
    this.userCreated = userCreated
    this.serialNumber = serialNumber
    this.taskId = taskId
    this.variant = variant
    this.deviceType = deviceType
    this.category = category
    this.manual = manual
    this.warrantyDocument = warrantyDocument
    this.technicalDocument = technicalDocument
  }

  // Convert to JSON for API
  toJson() {
    // Create base JSON object
    const json = {
      productName: this.productName,
      status: this.status,
      productId: this.productId || this.modelNumber,
      tenant: this.tenant,
      user_created: this.userCreated,
      serialNumber: this.serialNumber,
      taskId: this.taskId,
      variant: this.variant,
      deviceType: this.deviceType,
      manual: this.manual,
      warrantyDocument: this.warrantyDocument,
      technicalDocument: this.technicalDocument,
    }

    // Add productImageId if available, as 'product' field for the API
    if (this.productImageId) {
      json.product = this.productImageId
    }

    // Only add category if it's not null and can be parsed as integer
    if (this.category) {
      const categoryInt = Number.parseInt(this.category)
      if (!isNaN(categoryInt)) {
        json.category = categoryInt.toString()
      } else {
        json.category = this.category
      }
    }

    return json
  }

  // Create Product from JSON response
  static fromJson(json) {
    // Helper function to safely convert any value to String
    const toStringOrNull = (value) => {
      if (value === null || value === undefined) return null
      return value.toString()
    }

    return new Product({
      id: toStringOrNull(json.id),
      productName: json.productName || "",
      status: json.status || "draft",
      productImageId: toStringOrNull(json.product), // Read the file ID from 'product' field
      imageUrl: json.product ? `${import.meta.env.VITE_API_URL}/assets/${json.product}` : null, // Derive imageUrl for display
      modelNumber: toStringOrNull(json.modelNumber),
      productId: toStringOrNull(json.productId),
      tenant: toStringOrNull(json.tenant) || "",
      userCreated: toStringOrNull(json.user_created) || "",
      serialNumber: toStringOrNull(json.serialNumber),
      taskId: toStringOrNull(json.taskId),
      variant: toStringOrNull(json.variant),
      deviceType: toStringOrNull(json.deviceType || json.productType),
      category: toStringOrNull(json.category),
      manual: toStringOrNull(json.manual),
      warrantyDocument: toStringOrNull(json.warrantyDocument),
      technicalDocument: toStringOrNull(json.technicalDocument),
    })
  }
}

export class ProductCategory {
  constructor({ id, categoryName, tenant, productCount = null, color = null, icon = null }) {
    this.id = id || null
    this.categoryName = categoryName
    this.tenant = tenant
    this.productCount = productCount
    this.color = color
    this.icon = icon
  }

  toJson() {
    return {
      categoryName: this.categoryName,
      tenant: this.tenant,
      color: this.color,
      icon: this.icon,
    }
  }

  static fromJson(json) {
    // Helper function to safely convert any value to String
    const toStringOrNull = (value) => {
      if (value === null || value === undefined) return null
      return value.toString()
    }

    return new ProductCategory({
      id: toStringOrNull(json.id),
      categoryName: json.categoryName || "Uncategorized",
      tenant: toStringOrNull(json.tenant) || "",
      productCount: json.productCount !== null ? Number.parseInt(json.productCount) : null,
      color: toStringOrNull(json.color),
      icon: toStringOrNull(json.icon),
    })
  }
}
