import { defineStore } from 'pinia'

export interface CartItem {
  id: number
  nombre: string
  codigo: string
  precioVenta: number
  precioFinal?: number
  descuentoPorcentaje?: number
  talla?: string
  color?: string
  imagen?: string
  corte?: string
  material?: string
  cantidad: number
  stock?: number
  esCombo?: boolean
  componentes?: any[]
}

export const useCartStore = defineStore('cart', {
  state: () => {
    let initialItems: CartItem[] = []
    try {
      const saved = localStorage.getItem('sartorial_cart')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          initialItems = parsed
        }
      }
    } catch (e) {
      initialItems = []
    }

    return {
      items: initialItems,
      isOpen: false,
    }
  },
  getters: {
    totalItems: (state) =>
      Array.isArray(state.items)
        ? state.items.reduce((acc, i) => acc + (Number(i.cantidad) || 0), 0)
        : 0,
    subtotal: (state) =>
      Array.isArray(state.items)
        ? state.items.reduce((acc, item) => {
            const p = item.precioFinal !== undefined ? item.precioFinal : item.precioVenta
            return acc + (Number(p) || 0) * (Number(item.cantidad) || 0)
          }, 0)
        : 0,
    isEmpty: (state) => !Array.isArray(state.items) || state.items.length === 0,
  },
  actions: {
    saveToStorage() {
      try {
        localStorage.setItem('sartorial_cart', JSON.stringify(this.items))
      } catch (e) {
        console.error('Error al guardar bolsa en localStorage', e)
      }
    },
    addItem(producto: any, cantidad = 1) {
      const existing = this.items.find((i) => i.id === producto.id)
      if (existing) {
        existing.cantidad += cantidad
      } else {
        this.items.push({
          id: producto.id,
          nombre: producto.nombre,
          codigo: producto.codigo,
          precioVenta: Number(producto.precioVenta),
          precioFinal: producto.precioFinal !== undefined ? Number(producto.precioFinal) : Number(producto.precioVenta),
          descuentoPorcentaje: producto.descuentoPorcentaje || 0,
          talla: producto.talla,
          color: producto.color,
          imagen: producto.imagen,
          corte: producto.corte,
          material: producto.material,
          cantidad: cantidad,
          stock: Number(producto.stock || 10),
          esCombo: producto.esCombo,
          componentes: producto.componentes,
        })
      }
      this.saveToStorage()
      this.isOpen = true
    },
    updateQuantity(productoId: number, delta: number) {
      const item = this.items.find((i) => i.id === productoId)
      if (!item) return
      item.cantidad += delta
      if (item.cantidad <= 0) {
        this.removeItem(productoId)
      } else {
        this.saveToStorage()
      }
    },
    removeItem(productoId: number) {
      this.items = this.items.filter((i) => i.id !== productoId)
      this.saveToStorage()
    },
    clearCart() {
      this.items = []
      this.saveToStorage()
    },
    toggleCart(val?: boolean) {
      this.isOpen = val !== undefined ? val : !this.isOpen
    },
    openCart() {
      this.isOpen = true
    },
    closeCart() {
      this.isOpen = false
    },
  },
})
