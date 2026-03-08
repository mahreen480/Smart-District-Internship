import type { AuditEntry } from './types'
import { Product }    from './product'
import { getStats, getCategories } from './utils'

export function renderStats(products: Product[]): void {
  const { total, totalValue, lowStock, outOfStock } = getStats(products)
  document.getElementById('statsBar')!.innerHTML = `
    <div class="stat-card"><h3>Total Products</h3><p>${total}</p></div>
    <div class="stat-card"><h3>Inventory Value</h3><p>${totalValue.toLocaleString()} PKR</p></div>
    <div class="stat-card"><h3>Low Stock</h3><p>${lowStock}</p></div>
    <div class="stat-card"><h3>Out of Stock</h3><p>${outOfStock}</p></div>
  `
}

export function renderCategoryFilter(products: Product[]): void {
  const select  = document.getElementById('categoryFilter') as HTMLSelectElement
  const current = select.value
  select.innerHTML = '<option value="">All Categories</option>'
  getCategories(products).forEach(cat => {
    const opt = document.createElement('option')
    opt.value = cat
    opt.textContent = cat
    if (cat === current) opt.selected = true
    select.appendChild(opt)
  })
}

export function renderGrid(list: Product[]): void {
  const grid = document.getElementById('productGrid')!
  grid.innerHTML = ''

  if (list.length === 0) {
    grid.innerHTML = '<p class="empty">No products found.</p>'
    return
  }

  const fragment = document.createDocumentFragment()
  list.forEach(product => {
    const status     = product.getStockStatus()
    const stockClass = { none: 'stock-none', low: 'stock-low', ok: 'stock-ok' }[status]
    const stockLabel =
      status === 'none' ? 'Out of stock' :
      status === 'low'  ? `Low: ${product.stock}` :
                          `In stock: ${product.stock}`

    const card = document.createElement('div')
    card.className     = 'product-card'
    card.dataset['id'] = String(product.id)
    card.innerHTML = `
      <div class="category">${product.category}</div>
      <h3>${product.name}</h3>
      <div class="price">${product.price} PKR</div>
      <span class="stock-badge ${stockClass}">${stockLabel}</span>
      <div class="card-actions">
        <button class="edit-btn"   data-id="${product.id}">Edit</button>
        <button class="delete-btn" data-id="${product.id}">Delete</button>
      </div>
    `
    fragment.appendChild(card)
  })
  grid.appendChild(fragment)
}

export function renderAuditLog(logs: AuditEntry[]): void {
  const list = document.getElementById('auditList')!
  list.innerHTML = ''
  logs.slice(0, 20).forEach(entry => {
    const li = document.createElement('li')
    li.textContent = `[${entry.time}] #${entry.id} — ${entry.msg}`
    list.appendChild(li)
  })
}