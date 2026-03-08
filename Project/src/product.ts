import type { ProductData } from './types'
import { StockLevel } from './types'

export class Product implements ProductData {
  id:       number
  name:     string
  price:    number
  category: string
  stock:    number

  constructor(id: number, name: string, price: number, category: string, stock: number) {
    this.id       = id
    this.name     = name
    this.price    = price
    this.category = category
    this.stock    = stock
  }

  getInfo(): string {
    return `${this.name} ($${this.price}) — stock: ${this.stock}`
  }

  getStockStatus(): 'none' | 'low' | 'ok' {
    if (this.stock === StockLevel.OutOfStock) return 'none'
    if (this.stock <= StockLevel.Low)        return 'low'
    return 'ok'
  }

  static fromObject(obj: ProductData): Product {
    return new Product(obj.id, obj.name, obj.price, obj.category, obj.stock)
  }
}