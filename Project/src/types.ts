export const StockLevel = {
  OutOfStock: 0,
  Low:        3,
} as const

export interface ProductData {
  id:       number
  name:     string
  price:    number
  category: string
  stock:    number
}

export interface AuditEntry {
  id:   number
  time: string
  msg:  string
}

export interface InventoryStats {
  total:      number
  totalValue: number
  lowStock:   number
  outOfStock: number
}

export type ProductUpdate = Partial<Pick<ProductData, 'name' | 'price' | 'stock'>>

export function findByProp<T, K extends keyof T>(list: T[], key: K, value: T[K]): T | undefined {
  return list.find(item => item[key] === value)
}