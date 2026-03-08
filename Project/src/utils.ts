import type { InventoryStats } from './types'
import { Product } from './product'

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return function (this: unknown, ...args: unknown[]) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  } as T
}

export function throttle<T extends (...args: unknown[]) => void>(fn: T, limit: number): T {
  let lastCall = 0
  return function (this: unknown, ...args: unknown[]) {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      fn.apply(this, args)
    }
  } as T
}

export function getCategories(products: Product[]): string[] {
  return [...new Set(products.map(p => p.category))]
}

export function getStats(products: Product[]): InventoryStats {
  return {
    total:      products.length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    lowStock:   products.filter(p => p.stock > 0 && p.stock <= 3).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  }
}