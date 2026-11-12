<template>
  <div class="delivery-tracking-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Control de Envíos & Planchado de Etiqueta</h2>
        <p class="text-secondary small mb-0 font-display">Seguimiento de entregas a domicilio y preparación de portatrajes</p>
      </div>
      <button class="btn btn-outline-secondary text-white" @click="cargarDeliveries">
        <i class="bi bi-arrow-clockwise me-1"></i> Actualizar
      </button>
    </div>

    <!-- Filtro de Estado -->
    <div class="card-sartorial p-3 mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <select v-model="filtroEstado" class="form-select">
            <option value="">Todos los Estados de Entrega</option>
            <option value="Pendiente">Pendiente de Preparación</option>
            <option value="En Preparacion">En Planchado / Embalaje</option>
            <option value="En Camino">En Camino con Chofer</option>
            <option value="Entregado">Entregado al Cliente</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla de Envíos -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th>Venta / Ticket</th>
                <th>Cliente Receptor</th>
                <th>Dirección & Destino</th>
                <th>Contacto</th>
                <th>Costo Portatraje</th>
                <th>Estado del Envío</th>
                <th class="text-end">Modificar Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in deliveriesFiltrados" :key="d.id">
                <td class="fw-bold text-gold">
                  {{ d.venta?.codigoComprobante || 'TKT-' + d.ventaId }}
                </td>
                <td>
                  <div class="fw-bold text-white">{{ d.venta?.cliente ? `${d.venta.cliente.nombre} ${d.venta.cliente.apellido}` : 'Cliente' }}</div>
                  <small class="text-secondary">{{ d.venta?.detalles?.length || 0 }} prendas a entregar</small>
                </td>
                <td>
                  <div class="text-white small">{{ d.direccion }}</div>
                  <small class="text-secondary">{{ d.referencia || 'Sin referencias extras' }}</small>
                </td>
                <td>
                  <a :href="'https://wa.me/591' + d.telefonoContacto" target="_blank" class="btn btn-sm btn-outline-success">
                    <i class="bi bi-whatsapp me-1"></i> {{ d.telefonoContacto }}
                  </a>
                </td>
                <td>{{ formatPrice(d.costoDelivery) }}</td>
                <td>
                  <span class="badge" :class="getEstadoBadge(d.estado)">
                    {{ d.estado }}
                  </span>
                </td>
                <td class="text-end">
                  <select
                    :value="d.estado"
                    class="form-select form-select-sm d-inline-block w-auto"
                    @change="cambiarEstado(d.id, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Preparacion">En Planchado / Embalaje</option>
                    <option value="En Camino">En Camino</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </td>
              </tr>
              <tr v-if="deliveriesFiltrados.length === 0">
                <td colspan="7" class="text-center text-secondary py-5">No hay envíos registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import http from '@/plugins/axios'
import { formatPrice } from '@/helpers'
import Swal from 'sweetalert2'

const deliveries = ref<any[]>([])
const filtroEstado = ref('')

const cargarDeliveries = async () => {
  try {
    const res = await http.get('deliveries')
    deliveries.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const deliveriesFiltrados = computed(() => {
  if (!filtroEstado.value) return deliveries.value
  return deliveries.value.filter((d) => d.estado === filtroEstado.value)
})

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case 'Pendiente': return 'bg-warning text-dark'
    case 'En Preparacion': return 'bg-info text-dark'
    case 'En Camino': return 'bg-primary'
    case 'Entregado': return 'bg-success'
    case 'Cancelado': return 'bg-danger'
    default: return 'bg-secondary'
  }
}

const cambiarEstado = async (id: number, nuevoEstado: string) => {
  try {
    await http.patch(`deliveries/${id}/estado`, { estado: nuevoEstado })
    cargarDeliveries()
    Swal.fire({
      icon: 'success',
      title: 'Estado Actualizado',
      text: `El envío ahora está "${nuevoEstado}".`,
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo actualizar el estado.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  }
}

onMounted(() => {
  cargarDeliveries()
})
</script>
