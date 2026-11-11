<template>
  <div class="ventas-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Historial de Ventas & Facturación</h2>
        <p class="text-secondary small mb-0 font-display">Registro integral de operaciones en mostrador y pedidos online</p>
      </div>
      <router-link to="/admin/ventas/nueva" class="btn btn-gold d-flex align-items-center gap-2">
        <i class="bi bi-cart-plus-fill"></i> Nueva Venta en Caja
      </router-link>
    </div>

    <!-- Filtros de Ventas -->
    <div class="card-sartorial p-3 mb-4">
      <div class="row g-3 align-items-center">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text bg-transparent text-gold border-secondary"><i class="bi bi-search"></i></span>
            <input v-model="filtroBusqueda" type="text" class="form-control" placeholder="Buscar por código de ticket o cliente..." />
          </div>
        </div>
        <div class="col-md-3">
          <select v-model="filtroEstado" class="form-select">
            <option value="">Todos los Estados</option>
            <option value="Confirmada">Confirmadas</option>
            <option value="Cancelada">Canceladas</option>
          </select>
        </div>
        <div class="col-md-3 text-end">
          <button class="btn btn-outline-secondary w-100 text-white" @click="cargarVentas">
            <i class="bi bi-arrow-clockwise me-1"></i> Actualizar Lista
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
                <th>Comprobante</th>
                <th>Cliente</th>
                <th>Fecha y Hora</th>
                <th>Total Facturado</th>
                <th>Canal / Entrega</th>
                <th>Atendido Por</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in ventasFiltradas" :key="v.id">
                <td class="fw-bold text-gold">{{ v.codigoComprobante || 'TKT-' + v.id }}</td>
                <td>
                  <div class="fw-bold text-white">{{ v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Consumidor Final' }}</div>
                  <small class="text-secondary">CI: {{ v.cliente?.ciNit || '0' }}</small>
                </td>
                <td class="text-secondary small">{{ formatDate(v.fecha) }}</td>
                <td class="fw-bold text-white fs-6">{{ formatPrice(v.total) }}</td>
                <td>
                  <span class="badge" :class="v.tipoEntrega === 'Delivery' ? 'bg-info text-dark' : 'bg-dark border border-secondary text-secondary'">
                    <i :class="v.tipoEntrega === 'Delivery' ? 'bi bi-truck' : 'bi bi-shop'" class="me-1"></i>
                    {{ v.tipoEntrega }}
                  </span>
                </td>
                <td class="small text-secondary">{{ v.usuario ? `${v.usuario.nombre} ${v.usuario.apellido}` : 'Tienda Online' }}</td>
                <td>
                  <span class="badge" :class="v.estado === 'Confirmada' ? 'bg-success' : 'bg-danger'">
                    {{ v.estado }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-gold me-2" @click="verDetalle(v)" title="Ver Detalle">
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
                </td>
              </tr>
              <tr v-if="ventasFiltradas.length === 0">
                <td colspan="8" class="text-center text-secondary py-5">
                  <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                  No se encontraron ventas registradas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Detalle de Venta -->
    <div v-if="ventaSeleccionada" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <div>
              <h5 class="modal-title font-display text-gold mb-0">Comprobante {{ ventaSeleccionada.codigoComprobante }}</h5>
              <small class="text-secondary">Emitido el {{ formatDate(ventaSeleccionada.fecha) }}</small>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="ventaSeleccionada = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row g-3 mb-4 p-3 rounded" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
              <div class="col-md-6">
                <span class="text-secondary small d-block">Cliente Receptor:</span>
                <strong class="text-white">{{ ventaSeleccionada.cliente ? `${ventaSeleccionada.cliente.nombre} ${ventaSeleccionada.cliente.apellido}` : 'Consumidor Final' }}</strong>
                <div class="small text-secondary">CI/NIT: {{ ventaSeleccionada.cliente?.ciNit || '0' }} &bull; Tel: {{ ventaSeleccionada.cliente?.telefono || 'N/A' }}</div>
              </div>
              <div class="col-md-6 text-md-end">
                <span class="text-secondary small d-block">Modalidad de Venta:</span>
                <strong class="text-gold">{{ ventaSeleccionada.tipoEntrega }}</strong>
                <div v-if="ventaSeleccionada.direccionEntrega" class="small text-secondary">{{ ventaSeleccionada.direccionEntrega }}</div>
              </div>
            </div>

            <h6 class="font-display text-gold mb-2"><i class="bi bi-bag-check me-2"></i> Prendas y Artículos Incluidos</h6>
            <div class="table-responsive mb-4">
              <table class="table-sartorial">
                <thead>
                  <tr>
                    <th>Prenda</th>
                    <th>Talla</th>
                    <th>Color</th>
                    <th class="text-center">Cant</th>
                    <th class="text-end">Precio</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in ventaSeleccionada.detalles" :key="d.id">
                    <td>
                      <div class="fw-bold text-white">{{ d.producto?.nombre }}</div>
                      <small class="text-secondary">{{ d.producto?.codigo }}</small>
                    </td>
                    <td><span class="badge-talla">{{ d.talla || d.producto?.talla }}</span></td>
                    <td class="small">{{ d.color || d.producto?.color }}</td>
                    <td class="text-center">{{ d.cantidad }}</td>
                    <td class="text-end">{{ formatPrice(d.precio) }}</td>
                    <td class="text-end fw-bold text-gold">{{ formatPrice(d.subtotal) }}</td>
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
                <div class="display-6 fw-bold text-gold">{{ formatPrice(ventaSeleccionada.total) }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-outline-secondary" @click="ventaSeleccionada = null">Cerrar</button>
            <button type="button" class="btn btn-gold" @click="imprimirModal">
              <i class="bi bi-printer me-1"></i> Imprimir Comprobante
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import http from '@/plugins/axios'
import { formatPrice, formatDate } from '@/helpers'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const ventas = ref<any[]>([])
const filtroBusqueda = ref('')
const filtroEstado = ref('')
const ventaSeleccionada = ref<any | null>(null)

const cargarVentas = async () => {
  try {
    const res = await http.get('ventas')
    ventas.value = res.data
  } catch (err) {
    console.error(err)
  }
}

const ventasFiltradas = computed(() => {
  let list = [...ventas.value]
  if (filtroEstado.value) {
    list = list.filter((v) => v.estado === filtroEstado.value)
  }
  if (filtroBusqueda.value.trim()) {
    const s = filtroBusqueda.value.toLowerCase()
    list = list.filter(
      (v) =>
        v.codigoComprobante?.toLowerCase().includes(s) ||
        v.cliente?.nombre?.toLowerCase().includes(s) ||
        v.cliente?.apellido?.toLowerCase().includes(s) ||
        v.cliente?.ciNit?.toLowerCase().includes(s),
    )
  }
  return list
})

const verDetalle = (v: any) => {
  ventaSeleccionada.value = v
}

const imprimirModal = () => {
  window.print()
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
      cargarVentas()
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
  cargarVentas()
})
</script>
