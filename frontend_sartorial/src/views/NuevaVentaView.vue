<template>
  <div class="nueva-venta-pos">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="font-serif fw-bold text-white mb-0">Punto de Venta & Caja (POS)</h3>
        <small class="text-secondary font-display">Sartorial Prestige — Facturación Rápida en Mostrador</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-dark border border-warning text-gold px-3 py-2 font-display">
          <i class="bi bi-person-fill me-1"></i> Asesor: {{ authStore.fullName }}
        </span>
      </div>
    </div>

    <div class="row g-3">
      <!-- Columna Izquierda: Buscador & Catálogo de Prendas -->
      <div class="col-12 col-lg-7">
        <div class="card-sartorial p-3 h-100 d-flex flex-column">
          <!-- Filtro y Buscador -->
          <div class="row g-2 mb-3">
            <div class="col-8">
              <div class="input-group">
                <span class="input-group-text bg-transparent text-gold border-secondary"><i class="bi bi-upc-scan"></i></span>
                <input
                  ref="searchInputRef"
                  v-model="filtroBusqueda"
                  type="text"
                  class="form-control"
                  placeholder="Escanear SKU o buscar por nombre, talla, tela..."
                  @keydown.enter="escanearCodigo"
                />
              </div>
            </div>
            <div class="col-4">
              <select v-model="categoriaFiltro" class="form-select">
                <option :value="null">Todas las Categorías</option>
                <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
            </div>
          </div>

          <!-- Grid de Prendas Disponibles -->
          <div class="flex-grow-1 overflow-y-auto" style="max-height: 580px;">
            <div class="row g-2">
              <div v-for="p in prendasFiltradas" :key="p.id" class="col-6 col-md-4">
                <div
                  class="card-sartorial p-2 h-100 d-flex flex-column cursor-pointer hover-border"
                  :class="{ 'border-danger': p.stock <= 0 }"
                  @click="agregarAlTicket(p)"
                >
                  <div class="ratio ratio-4x3 rounded overflow-hidden mb-2" style="background: #111827;">
                    <img :src="getImageUrl(p.imagen)" class="img-fluid object-fit-cover" />
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge-talla">{{ p.talla }}</span>
                    <span class="small text-secondary" style="font-size: 0.7rem;">{{ p.codigo }}</span>
                  </div>
                  <div class="fw-bold small text-white text-truncate mb-1" :title="p.nombre">{{ p.nombre }}</div>
                  <div class="d-flex justify-content-between align-items-center mt-auto pt-1 border-top border-secondary">
                    <span class="fw-bold text-gold">{{ formatPrice(p.precioFinal || p.precioVenta) }}</span>
                    <small :class="p.stock > 0 ? 'text-success' : 'text-danger fw-bold'">
                      {{ p.stock > 0 ? p.stock + ' en stock' : 'Agotado' }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Ticket de Venta & Cobro -->
      <div class="col-12 col-lg-5">
        <div class="card-sartorial p-3 h-100 d-flex flex-column">
          <!-- Selección de Cliente -->
          <div class="p-2 mb-3 rounded" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="form-label mb-0 small text-gold font-display"><i class="bi bi-person-badge me-1"></i> Cliente de la Venta</label>
              <button class="btn btn-sm btn-link text-gold p-0 text-decoration-none" @click="crearClienteModal = true">
                <i class="bi bi-plus-circle me-1"></i> Nuevo Cliente
              </button>
            </div>
            <select v-model="clienteSeleccionadoId" class="form-select form-select-sm">
              <option :value="null">Consumidor Final / Cliente Ocasional (CI: 0)</option>
              <option v-for="c in clientes" :key="c.id" :value="c.id">
                {{ c.nombre }} {{ c.apellido }} — CI/NIT: {{ c.ciNit || 'S/N' }} (Talla: {{ c.preferenciaTalla || 'N/A' }})
              </option>
            </select>
          </div>

          <!-- Líneas de Detalle -->
          <div class="flex-grow-1 overflow-y-auto mb-3" style="max-height: 340px;">
            <div v-if="ticketItems.length === 0" class="text-center py-5 text-secondary">
              <i class="bi bi-cart-x fs-1 d-block mb-2"></i>
              No hay prendas añadidas a la orden.<br />
              Haga clic en una prenda o escanee su SKU.
            </div>

            <div v-for="(item, idx) in ticketItems" :key="idx" class="p-2 mb-2 rounded d-flex align-items-center gap-2" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);">
              <div class="flex-grow-1">
                <div class="fw-bold small text-white text-truncate" style="max-width: 170px;">{{ item.nombre }}</div>
                <div class="small text-secondary">Talla: <span class="text-gold">{{ item.talla }}</span> &bull; SKU: {{ item.codigo }}</div>
                <div class="text-gold small">{{ formatPrice(item.precio) }} c/u</div>
              </div>

              <!-- Controles de Cantidad -->
              <div class="d-flex align-items-center gap-1">
                <button class="btn btn-sm btn-outline-secondary py-0 px-2 text-white" @click="cambiarCantidad(item, -1)">-</button>
                <span class="small fw-bold px-1">{{ item.cantidad }}</span>
                <button class="btn btn-sm btn-outline-secondary py-0 px-2 text-white" @click="cambiarCantidad(item, 1)">+</button>
              </div>

              <div class="text-end" style="min-width: 75px;">
                <div class="fw-bold small text-white">{{ formatPrice(item.cantidad * item.precio) }}</div>
                <button class="btn btn-sm btn-link text-danger p-0" @click="eliminarItem(idx)"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </div>

          <!-- Desglose y Cobro -->
          <div class="pt-3 border-top border-secondary mt-auto">
            <div class="d-flex justify-content-between mb-1">
              <span class="text-secondary small">Subtotal:</span>
              <span class="fw-bold">{{ formatPrice(subtotalVenta) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 fs-4 font-serif">
              <span class="fw-bold text-white">TOTAL A COBRAR:</span>
              <span class="fw-bold text-gold">{{ formatPrice(subtotalVenta) }}</span>
            </div>

            <div class="d-grid gap-2">
              <button
                class="btn btn-gold py-3 font-display fs-6"
                :disabled="ticketItems.length === 0"
                @click="abrirModalCobro"
              >
                <i class="bi bi-cash-coin me-2"></i> PROCEDER AL COBRO
              </button>
              <button
                v-if="ticketItems.length > 0"
                class="btn btn-sm btn-outline-danger"
                @click="limpiarTicket"
              >
                <i class="bi bi-x-circle me-1"></i> Cancelar / Vaciar Orden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Cobro & Métodos de Pago -->
    <div v-if="cobroModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">Liquidar Venta en Caja</h5>
            <button type="button" class="btn-close btn-close-white" @click="cobroModalOpen = false"></button>
          </div>
          <form @submit.prevent="confirmarVenta">
            <div class="modal-body p-4">
              <div class="text-center p-3 mb-3 rounded" style="background: rgba(212,175,55,0.1); border: 1px solid var(--primary);">
                <span class="text-secondary small text-uppercase font-display">Monto Total a Liquidar</span>
                <div class="display-6 fw-bold text-gold">{{ formatPrice(subtotalVenta) }}</div>
              </div>

              <!-- Selector de Método -->
              <div class="mb-3">
                <label class="form-label">Método de Pago</label>
                <select v-model="metodoPagoId" class="form-select">
                  <option v-for="m in metodosPago" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                </select>
              </div>

              <!-- Cobro en Efectivo con Cambio -->
              <div v-if="esEfectivo" class="mb-3">
                <label class="form-label">Efectivo Recibido (Bs.)</label>
                <input
                  v-model.number="montoRecibido"
                  type="number"
                  step="0.01"
                  class="form-control form-control-lg text-end"
                  placeholder="0.00"
                  required
                />
                <div class="d-flex justify-content-between align-items-center mt-2 p-2 rounded bg-dark border border-secondary">
                  <span class="text-secondary small">Cambio a Devolver:</span>
                  <span class="fw-bold fs-5" :class="cambioDevolver >= 0 ? 'text-success' : 'text-danger'">
                    {{ formatPrice(cambioDevolver >= 0 ? cambioDevolver : 0) }}
                  </span>
                </div>
              </div>

              <!-- Vista QR si aplica -->
              <div v-if="esQr" class="text-center p-3 mb-3 rounded bg-dark border border-secondary">
                <p class="text-gold small mb-2"><i class="bi bi-qr-code me-1"></i> QR Simple para escaneo del cliente</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=Sartorial_Prestige_POS" class="p-1 bg-white rounded mb-2" style="width: 130px;" />
                <div class="small text-secondary">Referencia de transacción: TRX-{{ Math.round(Math.random() * 899999 + 100000) }}</div>
              </div>

              <!-- Referencia opcional para tarjeta o transferencia -->
              <div v-if="!esEfectivo" class="mb-3">
                <label class="form-label">N° de Comprobante / Voucher / Referencia</label>
                <input v-model="referenciaPago" type="text" class="form-control" placeholder="Ej. LOTE-48201 / AUT-9281" />
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-secondary" @click="cobroModalOpen = false">Volver</button>
              <button type="submit" class="btn btn-gold px-4" :disabled="procesandoCobro || (esEfectivo && montoRecibido < subtotalVenta)">
                <i class="bi bi-printer me-1"></i> {{ procesandoCobro ? 'Procesando...' : 'Completar & Emitir Recibo' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Recibo de Boutique Imprimible -->
    <div v-if="ventaCompletada" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-dark">
          <div class="modal-body p-4 printable-receipt">
            <div class="ticket-print-wrapper border p-4 bg-white text-dark">
              <div class="text-center mb-3">
                <h4 class="fw-bold mb-0" style="letter-spacing: 2px;">SARTORIAL PRESTIGE</h4>
                <div class="small text-uppercase" style="letter-spacing: 1px;">Boutique & Haute Couture</div>
                <div class="small text-muted">NIT: 1029384756 &bull; Tel: +591 4 6451234</div>
                <div class="small text-muted">Plaza 25 de Mayo #40, Sucre - Bolivia</div>
                <hr style="border-top: 1px dashed #000;" />
                <div class="fw-bold">RECIBO DE VENTA: {{ ventaCompletada.codigoComprobante }}</div>
                <div class="small text-muted">Fecha: {{ formatDate(ventaCompletada.fecha) }}</div>
              </div>

              <div class="small mb-3">
                <div><strong>Cliente:</strong> {{ ventaCompletada.cliente ? `${ventaCompletada.cliente.nombre} ${ventaCompletada.cliente.apellido}` : 'Consumidor Final' }}</div>
                <div><strong>CI/NIT:</strong> {{ ventaCompletada.cliente?.ciNit || '0' }}</div>
                <div><strong>Atendido por:</strong> {{ authStore.fullName }}</div>
              </div>

              <table class="w-100 small mb-3">
                <thead>
                  <tr style="border-bottom: 1px dashed #000;">
                    <th class="py-1">Cant</th>
                    <th class="py-1">Prenda / Talla</th>
                    <th class="py-1 text-end">P.Unit</th>
                    <th class="py-1 text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in ventaCompletada.detalles" :key="d.id">
                    <td class="py-1">{{ d.cantidad }}</td>
                    <td class="py-1">{{ d.producto?.nombre }} ({{ d.talla || d.producto?.talla }})</td>
                    <td class="py-1 text-end">{{ formatPrice(d.precio) }}</td>
                    <td class="py-1 text-end">{{ formatPrice(d.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>

              <hr style="border-top: 1px dashed #000;" />
              <div class="d-flex justify-content-between fw-bold fs-5 mb-2">
                <span>TOTAL PAGADO:</span>
                <span>{{ formatPrice(ventaCompletada.total) }}</span>
              </div>

              <div class="text-center mt-3 pt-2" style="border-top: 1px dashed #000;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=SartorialPrestige_Valido" class="mb-2" style="width: 80px;" />
                <div class="small text-muted">¡Gracias por vestir con distinción!</div>
                <div class="small text-muted" style="font-size: 0.7rem;">Cambios permitidos dentro de los 7 días con etiqueta intacta.</div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 p-3 bg-light">
            <button type="button" class="btn btn-secondary" @click="cerrarRecibo">Cerrar</button>
            <button type="button" class="btn btn-dark" @click="imprimirTicket">
              <i class="bi bi-printer me-1"></i> Imprimir Recibo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear Cliente Rápido -->
    <div v-if="crearClienteModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">Registrar Nuevo Cliente en Mostrador</h5>
            <button type="button" class="btn-close btn-close-white" @click="crearClienteModal = false"></button>
          </div>
          <form @submit.prevent="guardarNuevoCliente">
            <div class="modal-body p-3">
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <label class="form-label">Nombre *</label>
                  <input v-model="nuevoClienteForm.nombre" type="text" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label">Apellido *</label>
                  <input v-model="nuevoClienteForm.apellido" type="text" class="form-control" required />
                </div>
              </div>
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <label class="form-label">CI / NIT</label>
                  <input v-model="nuevoClienteForm.ciNit" type="text" class="form-control" />
                </div>
                <div class="col-6">
                  <label class="form-label">Teléfono Móvil</label>
                  <input v-model="nuevoClienteForm.telefono" type="text" class="form-control" />
                </div>
              </div>
              <div class="mb-2">
                <label class="form-label">Preferencia de Talla (Traje / Calzado)</label>
                <input v-model="nuevoClienteForm.preferenciaTalla" type="text" class="form-control" placeholder="Ej. 40R / Calzado 42" />
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-secondary" @click="crearClienteModal = false">Cancelar</button>
              <button type="submit" class="btn btn-gold">Guardar Cliente</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import http from '@/plugins/axios'
import { getImageUrl, formatPrice, formatDate } from '@/helpers'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const searchInputRef = ref<HTMLInputElement | null>(null)

const prendas = ref<any[]>([])
const categorias = ref<any[]>([])
const clientes = ref<any[]>([])
const metodosPago = ref<any[]>([])

const filtroBusqueda = ref('')
const categoriaFiltro = ref<number | null>(null)
const clienteSeleccionadoId = ref<number | null>(null)
const ticketItems = ref<any[]>([])

// Modal de Cobro
const cobroModalOpen = ref(false)
const metodoPagoId = ref(1)
const montoRecibido = ref(0)
const referenciaPago = ref('')
const procesandoCobro = ref(false)
const ventaCompletada = ref<any | null>(null)

// Modal Crear Cliente
const crearClienteModal = ref(false)
const nuevoClienteForm = ref({
  nombre: '',
  apellido: '',
  ciNit: '',
  telefono: '',
  preferenciaTalla: '',
})

const cargarDatos = async () => {
  try {
    const [pRes, cRes, clRes, mpRes] = await Promise.all([
      http.get('productos'),
      http.get('categorias'),
      http.get('clientes'),
      http.get('metodos-pago'),
    ])
    prendas.value = pRes.data
    categorias.value = cRes.data
    clientes.value = clRes.data
    metodosPago.value = mpRes.data
    if (metodosPago.value.length > 0) {
      metodoPagoId.value = metodosPago.value[0].id
    }
  } catch (err) {
    console.error(err)
  }
}

const prendasFiltradas = computed(() => {
  let list = [...prendas.value]
  if (categoriaFiltro.value) {
    list = list.filter((p) => p.categoriaId === categoriaFiltro.value)
  }
  if (filtroBusqueda.value.trim()) {
    const s = filtroBusqueda.value.toLowerCase()
    list = list.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(s) ||
        p.codigo?.toLowerCase().includes(s) ||
        p.talla?.toLowerCase().includes(s) ||
        p.color?.toLowerCase().includes(s),
    )
  }
  return list
})

const subtotalVenta = computed(() => {
  return ticketItems.value.reduce((acc, i) => acc + i.cantidad * i.precio, 0)
})

const esEfectivo = computed(() => {
  const m = metodosPago.value.find((x) => x.id === metodoPagoId.value)
  return m && m.nombre.toLowerCase().includes('efectivo')
})

const esQr = computed(() => {
  const m = metodosPago.value.find((x) => x.id === metodoPagoId.value)
  return m && (m.nombre.toLowerCase().includes('qr') || m.nombre.toLowerCase().includes('transfer'))
})

const cambioDevolver = computed(() => {
  return montoRecibido.value - subtotalVenta.value
})

const agregarAlTicket = (p: any) => {
  if (p.stock <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Prenda sin existencias',
      text: 'Esta prenda se encuentra actualmente agotada en almacén.',
      background: '#131A26',
      color: '#F8FAFC',
    })
    return
  }

  const existing = ticketItems.value.find((i) => i.id === p.id)
  if (existing) {
    if (existing.cantidad >= p.stock) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock Límite',
        text: `Solo hay ${p.stock} unidades disponibles en tienda.`,
        background: '#131A26',
        color: '#F8FAFC',
      })
      return
    }
    existing.cantidad++
  } else {
    ticketItems.value.push({
      id: p.id,
      nombre: p.nombre,
      codigo: p.codigo,
      talla: p.talla,
      color: p.color,
      precio: p.precioFinal || p.precioVenta,
      cantidad: 1,
      stockMax: p.stock,
    })
  }
}

const escanearCodigo = () => {
  if (!filtroBusqueda.value.trim()) return
  const match = prendas.value.find(
    (p) => p.codigo?.toLowerCase() === filtroBusqueda.value.trim().toLowerCase(),
  )
  if (match) {
    agregarAlTicket(match)
    filtroBusqueda.value = ''
  }
}

const cambiarCantidad = (item: any, delta: number) => {
  const nuevaCant = item.cantidad + delta
  if (nuevaCant <= 0) {
    const idx = ticketItems.value.indexOf(item)
    ticketItems.value.splice(idx, 1)
  } else if (nuevaCant > item.stockMax) {
    Swal.fire({
      icon: 'warning',
      title: 'Stock Superado',
      text: `Máximo disponible: ${item.stockMax} unidades.`,
      background: '#131A26',
      color: '#F8FAFC',
    })
  } else {
    item.cantidad = nuevaCant
  }
}

const eliminarItem = (index: number) => {
  ticketItems.value.splice(index, 1)
}

const limpiarTicket = () => {
  ticketItems.value = []
}

const abrirModalCobro = () => {
  montoRecibido.value = subtotalVenta.value
  referenciaPago.value = ''
  cobroModalOpen.value = true
}

const confirmarVenta = async () => {
  procesandoCobro.value = true
  try {
    const payload = {
      clienteId: clienteSeleccionadoId.value || undefined,
      tipoEntrega: 'Tienda',
      detalles: ticketItems.value.map((i) => ({
        productoId: i.id,
        cantidad: i.cantidad,
        precio: i.precio,
        talla: i.talla,
        color: i.color,
      })),
      pagos: [
        {
          metodoPagoId: metodoPagoId.value,
          monto: subtotalVenta.value,
          referencia: referenciaPago.value || undefined,
        },
      ],
    }

    const res = await http.post('ventas', payload)
    ventaCompletada.value = res.data
    cobroModalOpen.value = false
    ticketItems.value = []

    // Recargar inventario actualizado
    cargarDatos()
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al registrar venta',
      text: err.response?.data?.message || 'No se pudo procesar la transacción.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    procesandoCobro.value = false
  }
}

const cerrarRecibo = () => {
  ventaCompletada.value = null
}

const imprimirTicket = () => {
  window.print()
}

const guardarNuevoCliente = async () => {
  try {
    const res = await http.post('clientes', nuevoClienteForm.value)
    clientes.value.push(res.data)
    clienteSeleccionadoId.value = res.data.id
    crearClienteModal.value = false
    nuevoClienteForm.value = { nombre: '', apellido: '', ciNit: '', telefono: '', preferenciaTalla: '' }
    Swal.fire({
      icon: 'success',
      title: 'Cliente Creado',
      text: 'El cliente se ha seleccionado automáticamente para la orden.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo crear el cliente.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.hover-border:hover {
  border-color: var(--primary) !important;
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
