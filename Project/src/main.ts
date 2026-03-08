import { auditLogs, logAudit } from './audit'
import { Product } from './product'
import { renderAuditLog, renderCategoryFilter, renderGrid, renderStats } from './renderer'
import './style.css'
import { findByProp, type ProductData, type ProductUpdate } from './types'
import { debounce, throttle } from './utils'

let products: Product[] = []

type DomRefs = {
  searchInput: HTMLInputElement
  categoryFilter: HTMLSelectElement
  productGrid: HTMLDivElement
  resizeInfo: HTMLParagraphElement
  addBtn: HTMLButtonElement
  exportBtn: HTMLButtonElement
}

let dom: DomRefs | null = null

function getById<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null
}

function buildAppShell(): DomRefs | null {
  const app = getById<HTMLDivElement>('app')
  if (!app) {
    console.error('Missing #app root container in index.html')
    return null
  }

  app.innerHTML = `
    <main class="inventory-app">
      <header>
        <h1>Inventory Dashboard</h1>
        <p id="resize-info" aria-live="polite"></p>
      </header>

      <section class="controls" aria-label="Inventory controls">
        <input id="searchInput" type="search" placeholder="Search products" />
        <select id="categoryFilter" aria-label="Filter by category">
          <option value="">All Categories</option>
        </select>
        <button id="addBtn" type="button">Add Product</button>
        <button id="exportBtn" type="button">Export JSON</button>
      </section>

      <section id="statsBar" aria-label="Inventory stats"></section>
      <section id="productGrid" aria-label="Product list"></section>

      <section aria-label="Audit log">
        <h2>Audit Log</h2>
        <ul id="auditList"></ul>
      </section>
    </main>
  `

  const searchInput = getById<HTMLInputElement>('searchInput')
  const categoryFilter = getById<HTMLSelectElement>('categoryFilter')
  const productGrid = getById<HTMLDivElement>('productGrid')
  const resizeInfo = getById<HTMLParagraphElement>('resize-info')
  const addBtn = getById<HTMLButtonElement>('addBtn')
  const exportBtn = getById<HTMLButtonElement>('exportBtn')

  if (!searchInput || !categoryFilter || !productGrid || !resizeInfo || !addBtn || !exportBtn) {
    console.error('Could not initialize required UI elements')
    return null
  }

  return { searchInput, categoryFilter, productGrid, resizeInfo, addBtn, exportBtn }
}

async function loadProducts(): Promise<void> {
  try {
    const res = await fetch('/products.json')
    if (!res.ok) throw new Error('Could not load products.json')
    const data = await res.json() as ProductData[]
    products = data.map(p => Product.fromObject(p))
    logAudit('Loaded products from JSON')
    render()
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message)
      logAudit('products.json missing or invalid. Starting with an empty list.')
      render()
    }
  }
}

function render(): void {
  if (!dom) return
  renderStats(products)
  renderCategoryFilter(products)
  renderGrid(getFiltered())
  renderAuditLog(auditLogs)
}

function getFiltered(): Product[] {
  if (!dom) return products
  const query = dom.searchInput.value.toLowerCase()
  const category = dom.categoryFilter.value
  return products.filter(p =>
    p.name.toLowerCase().includes(query) &&
    (category === '' || p.category === category)
  )
}

function addProduct(): void {
  const name = prompt('Product name:')
  if (!name) return
  const price = Number(prompt('Price:'))
  const category = prompt('Category:') ?? 'Uncategorized'
  const stock = Number(prompt('Stock quantity:'))
  const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1
  products.push(new Product(id, name, price, category, stock))
  logAudit(`Added: ${name}`)
  render()
}

function editProduct(id: number): void {
  const product = findByProp(products, 'id', id)
  if (!product) return
  const input = prompt(`New stock for "${product.name}" (current: ${product.stock}):`)
  if (input === null) return
  const update: ProductUpdate = { stock: Number(input) }
  product.stock = update.stock ?? product.stock
  logAudit(`Updated stock: "${product.name}" -> ${product.stock}`)
  render()
}

function deleteProduct(id: number): void {
  const product = findByProp(products, 'id', id)
  if (!product || !confirm(`Delete "${product.name}"?`)) return
  products = products.filter(p => p.id !== id)
  logAudit(`Deleted: ${product.name}`)
  render()
}

function exportJSON(): void {
  const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: 'inventory.json' })
  a.click()
  URL.revokeObjectURL(url)
  logAudit('Exported inventory to JSON')
  renderAuditLog(auditLogs)
}

// Event delegation: one listener handles all product cards.
function bindEvents(): void {
  if (!dom) return

  dom.productGrid.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('button') as HTMLButtonElement | null
  if (!btn) return
  const id = Number(btn.dataset['id'])
  if (btn.classList.contains('edit-btn')) editProduct(id)
  if (btn.classList.contains('delete-btn')) deleteProduct(id)
  })

  const handleSearch = debounce(() => {
    if (!dom) return
    const q = dom.searchInput.value
    logAudit(`Searched: "${q}"`)
    renderGrid(getFiltered())
    renderAuditLog(auditLogs)
  }, 500)

  dom.searchInput.addEventListener('input', handleSearch)

  dom.categoryFilter.addEventListener('change', function () {
    const val = (this as HTMLSelectElement).value
    logAudit(`Filtered by: ${val || 'All'}`)
    renderGrid(getFiltered())
    renderAuditLog(auditLogs)
  })

  const handleResize = throttle(() => {
    if (!dom) return
    dom.resizeInfo.textContent = `Window: ${window.innerWidth}px x ${window.innerHeight}px`
  }, 500)

  window.addEventListener('resize', handleResize)
  handleResize()

  dom.addBtn.addEventListener('click', addProduct)
  dom.exportBtn.addEventListener('click', exportJSON)
}

function init(): void {
  dom = buildAppShell()
  if (!dom) return
  bindEvents()
  void loadProducts()
}

init()