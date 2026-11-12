<template>
  <div class="vendedor-dashboard">
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Terminal de Asesor & Caja</h2>
        <p class="text-secondary small mb-0 font-display">Bienvenido, {{ authStore.fullName }} — Sartorial Prestige Boutique</p>
      </div>
      <div class="d-flex gap-2">
        <router-link to="/vendedor/ventas/nueva" class="btn btn-gold btn-lg d-flex align-items-center gap-2">
          <i class="bi bi-cart-plus-fill fs-5"></i> ABRIR PUNTO DE VENTA (POS)
        </router-link>
      </div>
    </div>

    <!-- Estado de Caja del Turno -->
    <div class="card-sartorial p-4 mb-4 border-warning" style="background: linear-gradient(90deg, rgba(212,175,55,0.06) 0%, rgba(19,26,38,0.9) 100%);">
      <div class="row align-items-center g-3">
        <div class="col-md-8">
          <div class="d-flex align-items-center gap-3">
            <div class="p-3 rounded-circle" :class="cajaActiva ? 'bg-success' : 'bg-danger'">
              <i class="bi bi-cash-stack text-white fs-4"></i>
            </div>
            <div>
              <h5 class="mb-1 text-white font-serif">
                Estado de Turno: <span :class="cajaActiva ? 'text-success' : 'text-danger'">{{ cajaActiva ? 'CAJA ABIERTA' : 'CAJA CERRADA' }}</span>
              </h5>
              <p v-if="cajaActiva" class="text-secondary small mb-0">
                Apertura: {{ formatDate(cajaActiva.fechaApertura) }} &bull; Monto inicial: {{ formatPrice(cajaActiva.montoApertura) }}
              </p>
              <p v-else class="text-secondary small mb-0">
                Debe abrir su caja de turno antes de realizar ventas físicas en tienda.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4 text-md-end">
          <router-link to="/vendedor/caja" class="btn btn-outline-gold">
            <i class="bi bi-wallet2 me-1"></i> {{ cajaActiva ? 'Gestionar / Cerrar Caja' : 'Abrir Turno de Caja' }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Resumen de Ventas del Turno -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card-sartorial p-3 h-100">
          <span class="text-secondary small text-uppercase font-display">Ventas Totales Hoy</span>
          <h3 class="fw-bold text-gold my-2">{{ formatPrice(resumenVentas.totalMonto) }}</h3>
          <small class="text-secondary">{{ resumenVentas.cantidad }} prendas/órdenes despachadas</small>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card-sartorial p-3 h-100">
          <span class="text-secondary small text-uppercase font-display">Cobros en Efectivo</span>
          <h3 class="fw-bold text-white my-2">{{ formatPrice(cajaActiva ? cajaActiva.ventasEfectivo : 0) }}</h3>
          <small class="text-secondary">En gaveta física de caja</small>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card-sartorial p-3 h-100">
          <span class="text-secondary small text-uppercase font-display">Cobros Digitales (Tarjeta / QR)</span>
          <h3 class="fw-bold text-info my-2">{{ formatPrice(cajaActiva ? Number(cajaActiva.ventasTarjeta || 0) + Number(cajaActiva.ventasQr || 0) : 0) }}</h3>
          <small class="text-secondary">Liquidado vía POS y QR simple</small>
        </div>
      </div>
    </div>

    <!-- Accesos Rápidos del Asesor -->
    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="card-sartorial h-100 p-4">
          <h5 class="font-serif text-gold mb-3"><i class="bi bi-suit-heart me-2"></i> Consulta Rápida de Inventario</h5>
          <p class="text-secondary small mb-3">Busque prendas por código, talla o tejido en el probador o mostrador sin interrumpir la venta.</p>
          <router-link to="/vendedor/productos" class="btn btn-outline-light">
            <i class="bi bi-search me-1"></i> Catálogo de Tallas & Stock
          </router-link>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card-sartorial h-100 p-4">
          <h5 class="font-serif text-gold mb-3"><i class="bi bi-person-plus me-2"></i> Registro Rápido de Cliente</h5>
          <p class="text-secondary small mb-3">Registre un nuevo cliente en el mostrador para facturar a su nombre y almacenar su talla habitual.</p>
          <router-link to="/vendedor/clientes" class="btn btn-outline-light">
            <i class="bi bi-person-badge me-1"></i> Cartera de Clientes
          </router-link>
        </div>
      </div>
    </div>

    <!-- Historial de Ventas Recientes del Asesor -->
    <div class="card-sartorial">
      <div class="card-sartorial-header">
        <h6 class="mb-0 font-display text-gold"><i class="bi bi-clock-history me-2"></i> Mis Ventas de Hoy</h6>
        <router-link to="/vendedor/ventas" class="btn btn-sm btn-outline-gold">Ver Historial Completo</router-link>
      </div>
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th>Comprobante</th>
                <th>Cliente</th>
                <th>Fecha / Hora</th>
                <th>Total Venta</th>
                <th>Tipo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in misVentas" :key="v.id">
                <td class="fw-bold text-gold">{{ v.codigoComprobante || 'TKT-' + v.id }}</td>
                <td>{{ v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Consumidor Final' }}</td>
                <td class="text-secondary small">{{ formatDate(v.fecha) }}</td>
                <td class="fw-bold">{{ formatPrice(v.total) }}</td>
                <td><span class="badge bg-secondary">{{ v.tipoEntrega }}</span></td>
                <td><span class="badge bg-success">{{ v.estado }}</span></td>
              </tr>
              <tr v-if="misVentas.length === 0">
                <td colspan="6" class="text-center text-secondary py-4">No se han registrado ventas en su turno hoy</td>
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
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const cajaActiva = ref<any | null>(null)
const misVentas = ref<any[]>([])
const resumenVentas = ref({ cantidad: 0, totalMonto: 0 })

const cargarDatos = async () => {
  try {
    const [cajaRes, ventasRes] = await Promise.all([
      http.get('cajas/activa').catch(() => ({ data: null })),
      http.get(`ventas?usuarioId=${authStore.user?.id}&limit=5`).catch(() => ({ data: [] })),
    ])

    cajaActiva.value = cajaRes.data
    misVentas.value = ventasRes.data

    const total = misVentas.value.reduce((acc, v) => acc + Number(v.total || 0), 0)
    resumenVentas.value = {
      cantidad: misVentas.value.length,
      totalMonto: total,
    }
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  cargarDatos()
})
</script>
