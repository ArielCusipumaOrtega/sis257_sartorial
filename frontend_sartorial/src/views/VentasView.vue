<template>
  <div class="ventas-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Historial de Ventas & Facturación</h2>
        <p class="text-secondary small mb-0 font-display">Registro integral de operaciones en mostrador y pedidos online con emisión de PDF</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-success d-flex align-items-center gap-2" @click="exportarExcel" title="Descargar histórico en formato Excel">
          <i class="bi bi-file-earmark-excel-fill"></i> Exportar a Excel
        </button>
        <router-link to="/admin/ventas/nueva" class="btn btn-gold d-flex align-items-center gap-2">
          <i class="bi bi-cart-plus-fill"></i> Nueva Venta en Caja
        </router-link>
      </div>
    </div>

    <!-- Filtros de Ventas -->
    <div class="card-sartorial p-3 mb-4">
      <div class="row g-3 align-items-center">
        <div class="col-md-5">
          <div class="input-group">
            <span class="input-group-text bg-transparent text-gold border-secondary"><i class="bi bi-search"></i></span>
            <input
              v-model="filtroBusqueda"
              type="text"
              class="form-control"
              placeholder="Buscar por código de ticket o cliente..."
              @input="onSearchInput"
            />
          </div>
        </div>
        <div class="col-md-3">
          <select v-model="filtroEstado" class="form-select" @change="cargarVentas(1)">
            <option value="">Todos los Estados</option>
            <option value="Confirmada">Confirmadas</option>
            <option value="Cancelada">Canceladas</option>
          </select>
        </div>
        <div class="col-md-2">
          <select v-model="limit" class="form-select" @change="cargarVentas(1)">
            <option :value="10">10 por pág</option>
            <option :value="20">20 por pág</option>
            <option :value="50">50 por pág</option>
          </select>
        </div>
        <div class="col-md-2 text-end">
          <button class="btn btn-outline-secondary w-100 text-white" @click="cargarVentas(page)">
            <i class="bi bi-arrow-clockwise me-1"></i> Actualizar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Ventas -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th class="text-nowrap-cell">Comprobante</th>
                <th>Cliente</th>
                <th>Fecha y Hora</th>
                <th class="text-nowrap-cell">Total Facturado</th>
                <th class="text-nowrap-cell">Canal / Entrega</th>
                <th>Atendido Por</th>
                <th class="text-nowrap-cell">Estado</th>
                <th class="cell-actions text-end">Acciones & Documentos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="cargando">
                <td colspan="8" class="text-center py-4 text-secondary">
                  <div class="spinner-border text-gold spinner-border-sm me-2" role="status"></div>
                  Cargando operaciones comerciales...
                </td>
              </tr>
              <tr v-else-if="ventas.length === 0">
                <td colspan="8" class="text-center text-secondary py-5">
                  <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                  No se encontraron ventas registradas
                </td>
              </tr>
              <tr v-for="v in ventas" :key="v.id">
                <td class="fw-bold text-gold text-nowrap-cell">{{ v.codigoComprobante || 'TKT-' + v.id }}</td>
                <td>
                  <div class="fw-bold text-white">{{ v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Consumidor Final' }}</div>
                  <small class="text-secondary">CI: {{ v.cliente?.ciNit || '0' }}</small>
                </td>
                <td class="text-secondary small">{{ formatDate(v.fecha) }}</td>
                <td class="fw-bold text-nowrap-cell cell-price">
                  <PriceTag :amount="v.total" color="white" />
                </td>
                <td class="text-nowrap-cell cell-badge">
                  <StatusBadge :status="v.tipoEntrega" type="delivery" />
                </td>
                <td class="small text-secondary">{{ v.usuario ? `${v.usuario.nombre} ${v.usuario.apellido}` : 'Tienda Online' }}</td>
                <td class="text-nowrap-cell cell-badge">
                  <StatusBadge :status="v.estado" type="venta" />
                </td>
                <td class="cell-actions text-end">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-light" @click="descargarTicketPdf(v)" title="Imprimir Ticket Térmico 80mm en PDF con QR">
                      <i class="bi bi-receipt"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" @click="descargarFacturaPdf(v)" title="Descargar Factura A4 Formal en PDF">
                      <i class="bi bi-file-earmark-pdf"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-gold" @click="verDetalle(v)" title="Ver Detalle de Venta">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      v-if="v.estado === 'Confirmada' && authStore.isAdmin"
                      class="btn btn-sm btn-outline-danger"
                      @click="cancelarVenta(v)"
                      title="Anular / Revertir Stock"
                    >
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Paginación Server-Side -->
      <div class="card-footer bg-transparent border-secondary p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <small class="text-secondary font-display">
          Página <span class="text-gold fw-bold">{{ page }}</span> de <span class="text-white">{{ totalPages }}</span>
          (Total: <span class="text-gold fw-bold">{{ totalVentas }}</span> transacciones)
        </small>
        <div class="btn-group">
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page <= 1 || cargando"
            @click="cargarVentas(page - 1)"
          >
            <i class="bi bi-chevron-left me-1"></i> Anterior
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="btn btn-sm"
            :class="p === page ? 'btn-gold' : 'btn-outline-secondary'"
            @click="cargarVentas(p)"
          >
            {{ p }}
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page >= totalPages || cargando"
            @click="cargarVentas(page + 1)"
          >
            Siguiente <i class="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detalle de Venta -->
    <div v-if="ventaSeleccionada" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <div>
              <h5 class="modal-title font-display text-gold mb-0">Comprobante de Venta: {{ ventaSeleccionada.codigoComprobante }}</h5>
              <small class="text-secondary">{{ formatDate(ventaSeleccionada.fecha) }} &bull; Atendido por: {{ ventaSeleccionada.usuario ? `${ventaSeleccionada.usuario.nombre} ${ventaSeleccionada.usuario.apellido}` : 'Tienda Online' }}</small>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="ventaSeleccionada = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row mb-3 g-2">
              <div class="col-md-6">
                <span class="text-secondary small font-display">CLIENTE:</span>
                <div class="fw-bold text-white fs-6">{{ ventaSeleccionada.cliente ? `${ventaSeleccionada.cliente.nombre} ${ventaSeleccionada.cliente.apellido}` : 'Consumidor Final' }}</div>
                <div class="small text-secondary">CI / NIT: {{ ventaSeleccionada.cliente?.ciNit || '0' }}</div>
              </div>
              <div class="col-md-6 text-md-end">
                <span class="text-secondary small font-display">MODALIDAD DE ENTREGA:</span>
                <div>
                  <span class="badge" :class="ventaSeleccionada.tipoEntrega === 'Delivery' ? 'bg-info text-dark' : 'bg-dark border border-secondary text-secondary'">
                    <i :class="ventaSeleccionada.tipoEntrega === 'Delivery' ? 'bi bi-truck' : 'bi bi-shop'" class="me-1"></i>
                    {{ ventaSeleccionada.tipoEntrega === 'Delivery' ? 'Envío a Domicilio con Planchado al Vapor' : 'Retiro en Boutique' }}
                  </span>
                </div>
                <small v-if="ventaSeleccionada.direccionEntrega" class="text-secondary d-block mt-1">Dirección: {{ ventaSeleccionada.direccionEntrega }}</small>
              </div>
            </div>

            <!-- Tabla de Prendas -->
            <div class="table-responsive mb-3">
              <table class="table-sartorial table-sm mb-0">
                <thead>
                  <tr>
                    <th>Prenda / Modelo</th>
                    <th>Talla</th>
                    <th class="text-center">Cant</th>
                    <th class="text-end">Precio Unit.</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in ventaSeleccionada.detalles" :key="d.id">
                    <td>
                      <div class="fw-bold text-white">{{ d.producto?.nombre }}</div>
                      <small class="text-secondary">{{ d.producto?.categoria?.nombre }} &bull; {{ d.producto?.marca?.nombre }}</small>
                    </td>
                    <td><span class="badge-talla">{{ d.talla || d.producto?.talla }}</span></td>
                    <td class="text-center">{{ d.cantidad }}</td>
                    <td class="text-end"><PriceTag :amount="d.precio" size="sm" color="muted" /></td>
                    <td class="text-end fw-bold"><PriceTag :amount="d.subtotal" size="sm" color="gold" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="row align-items-center">
              <div class="col-md-6">
                <h6 class="small font-display text-secondary mb-1">MÉTODOS DE PAGO:</h6>
                <div v-for="p in ventaSeleccionada.pagos" :key="p.id" class="small text-white">
                  &bull; {{ p.metodoPago?.nombre }}: {{ formatPrice(p.monto) }} <span v-if="p.referencia" class="text-secondary">({{ p.referencia }})</span>
                </div>
              </div>
              <div class="col-md-6 text-end">
                <span class="text-secondary small">Total Transacción:</span>
                <div class="mt-1"><PriceTag :amount="ventaSeleccionada.total" size="xl" color="gold" /></div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-secondary d-flex flex-wrap justify-content-between gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="ventaSeleccionada = null">Cerrar</button>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-dark" @click="descargarTicketPdf(ventaSeleccionada)">
                <i class="bi bi-receipt me-1"></i> Ticket 80mm PDF
              </button>
              <button type="button" class="btn btn-gold text-dark" @click="descargarFacturaPdf(ventaSeleccionada)">
                <i class="bi bi-file-earmark-pdf-fill me-1"></i> Factura A4 PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/plugins/axios'
import { formatPrice, formatDate } from '@/helpers'
import { useAuthStore } from '@/stores/auth'
import StatusBadge from '@/components/common/StatusBadge.vue'
import PriceTag from '@/components/common/PriceTag.vue'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const ventas = ref<any[]>([])
const cargando = ref(false)

const filtroBusqueda = ref('')
const filtroEstado = ref('')
const ventaSeleccionada = ref<any | null>(null)

// Paginación
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const totalVentas = ref(0)

const cargarVentas = async (nuevaPagina = 1) => {
  cargando.value = true
  page.value = nuevaPagina
  try {
    const res = await http.get('ventas', {
      params: {
        page: page.value,
        limit: limit.value,
        search: filtroBusqueda.value || undefined,
        estado: filtroEstado.value || undefined,
      },
    })
    if (res.data && res.data.data) {
      ventas.value = res.data.data
      totalVentas.value = res.data.total
      totalPages.value = res.data.totalPages || 1
    } else {
      ventas.value = Array.isArray(res.data) ? res.data : []
      totalVentas.value = ventas.value.length
      totalPages.value = 1
    }
  } catch (err) {
    console.error(err)
  } finally {
    cargando.value = false
  }
}

let debounceTimer: any = null
const onSearchInput = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    cargarVentas(1)
  }, 350)
}

const verDetalle = (v: any) => {
  ventaSeleccionada.value = v
}

const descargarTicketPdf = (v: any) => {
  const base = http.defaults.baseURL || '/api/v1/'
  const url = `${base.replace(/\/+$/, '')}/documentos/ticket/${v.id}`
  window.open(url, '_blank')
}

const descargarFacturaPdf = (v: any) => {
  const base = http.defaults.baseURL || '/api/v1/'
  const url = `${base.replace(/\/+$/, '')}/documentos/factura/${v.id}`
  window.open(url, '_blank')
}

const exportarExcel = () => {
  const base = http.defaults.baseURL || '/api/v1/'
  const url = `${base.replace(/\/+$/, '')}/documentos/ventas/excel`
  window.open(url, '_blank')
}

const cancelarVenta = async (v: any) => {
  const result = await Swal.fire({
    title: '¿Anular esta venta?',
    text: `Se cancelará la venta ${v.codigoComprobante} y las prendas retornarán al stock de boutique.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Sí, anular venta',
    cancelButtonText: 'Cancelar',
    background: '#131A26',
    color: '#F8FAFC',
  })

  if (result.isConfirmed) {
    try {
      await http.post(`ventas/${v.id}/cancelar`)
      Swal.fire({
        icon: 'success',
        title: 'Venta Anulada',
        text: 'El inventario ha sido restituido exitosamente.',
        background: '#131A26',
        color: '#F8FAFC',
        timer: 1800,
        showConfirmButton: false,
      })
      cargarVentas(page.value)
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo anular la venta.',
        background: '#131A26',
        color: '#F8FAFC',
      })
    }
  }
}

onMounted(() => {
  cargarVentas(1)
})
</script>
