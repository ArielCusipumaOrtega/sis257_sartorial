<template>
  <div class="pagos-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Registro de Ingresos & Pagos</h2>
        <p class="text-secondary small mb-0 font-display">Trazabilidad de pagos en efectivo, transferencias bancarias y tarjetas</p>
      </div>
      <button class="btn btn-outline-secondary text-white" @click="cargarPagos">
        <i class="bi bi-arrow-clockwise me-1"></i> Actualizar
      </button>
    </div>

    <!-- Tabla -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th class="text-nowrap-cell">ID Pago</th>
                <th class="text-nowrap-cell">Venta / Comprobante</th>
                <th>Cliente</th>
                <th class="text-nowrap-cell">Método de Pago</th>
                <th>Referencia Bancaria</th>
                <th>Fecha y Hora</th>
                <th class="text-nowrap-cell text-end">Monto Liquidado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in pagos" :key="p.id">
                <td class="text-gold fw-bold text-nowrap-cell">#PG-{{ p.id }}</td>
                <td class="text-nowrap-cell">
                  <span class="fw-bold text-white">{{ p.venta?.codigoComprobante || 'TKT-' + p.ventaId }}</span>
                </td>
                <td>
                  {{ p.venta?.cliente ? `${p.venta.cliente.nombre} ${p.venta.cliente.apellido}` : 'Consumidor Final' }}
                </td>
                <td class="text-nowrap-cell cell-badge">
                  <span class="badge" :class="getMetodoBadge(p.metodoPago?.nombre)">
                    <i :class="getMetodoIcon(p.metodoPago?.nombre)" class="me-1"></i>
                    {{ p.metodoPago?.nombre || 'General' }}
                  </span>
                </td>
                <td class="small text-secondary">{{ p.referencia || '-' }}</td>
                <td class="small text-secondary">{{ formatDate(p.fecha) }}</td>
                <td class="text-end fw-bold text-gold fs-6 text-nowrap-cell cell-price">{{ formatPrice(p.monto) }}</td>
              </tr>
              <tr v-if="pagos.length === 0">
                <td colspan="7" class="text-center text-secondary py-5">No hay pagos registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/plugins/axios'
import { formatPrice, formatDate } from '@/helpers'

const pagos = ref<any[]>([])

const cargarPagos = async () => {
  try {
    const res = await http.get('pagos')
    pagos.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const getMetodoBadge = (nombre?: string) => {
  if (!nombre) return 'bg-secondary'
  const n = nombre.toLowerCase()
  if (n.includes('efectivo')) return 'bg-success'
  if (n.includes('tarjeta')) return 'bg-primary'
  if (n.includes('qr') || n.includes('transfer')) return 'bg-warning text-dark'
  return 'bg-info text-dark'
}

const getMetodoIcon = (nombre?: string) => {
  if (!nombre) return 'bi-cash'
  const n = nombre.toLowerCase()
  if (n.includes('efectivo')) return 'bi-cash-coin'
  if (n.includes('tarjeta')) return 'bi-credit-card-2-front-fill'
  if (n.includes('qr') || n.includes('transfer')) return 'bi-qr-code'
  return 'bi-wallet'
}

onMounted(() => {
  cargarPagos()
})
</script>
