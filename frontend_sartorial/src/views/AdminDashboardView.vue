<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Centro de Control Ejecutivo</h2>
        <p class="text-secondary small mb-0 font-display">Sartorial Prestige — Métricas de Venta, Inventario & Rendimiento</p>
      </div>
      <div class="d-flex gap-2">
        <router-link to="/admin/ventas/nueva" class="btn btn-gold d-flex align-items-center gap-2">
          <i class="bi bi-cart-plus-fill"></i> Nueva Venta (POS)
        </router-link>
        <router-link to="/admin/compras/nueva" class="btn btn-outline-gold d-flex align-items-center gap-2">
          <i class="bi bi-bag-plus"></i> Reabastecer Lote
        </router-link>
      </div>
    </div>

    <!-- KPIs Metric Cards -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-sartorial p-3 h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-secondary small text-uppercase font-display">Ventas Hoy</span>
            <div class="rounded p-2" style="background: rgba(212,175,55,0.15);">
              <i class="bi bi-cash-stack text-gold fs-5"></i>
            </div>
          </div>
          <h3 class="fw-bold text-white mb-1">{{ formatPrice(kpis.ventasHoyMonto) }}</h3>
          <small class="text-secondary">{{ kpis.ventasHoyCantidad }} transacciones registradas</small>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-sartorial p-3 h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-secondary small text-uppercase font-display">Facturación Mes</span>
            <div class="rounded p-2" style="background: rgba(16,185,129,0.15);">
              <i class="bi bi-graph-up-arrow text-success fs-5"></i>
            </div>
          </div>
          <h3 class="fw-bold text-white mb-1">{{ formatPrice(kpis.ventasMesMonto) }}</h3>
          <small class="text-success"><i class="bi bi-arrow-up-right me-1"></i> {{ kpis.ventasMesCantidad }} órdenes cerradas</small>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-sartorial p-3 h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-secondary small text-uppercase font-display">Cartera Clientes</span>
            <div class="rounded p-2" style="background: rgba(59,130,246,0.15);">
              <i class="bi bi-people-fill text-info fs-5"></i>
            </div>
          </div>
          <h3 class="fw-bold text-white mb-1">{{ totalClientes }}</h3>
          <small class="text-secondary">Clientes de etiqueta registrados</small>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-sartorial p-3 h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-secondary small text-uppercase font-display">Stock Crítico</span>
            <div class="rounded p-2" style="background: rgba(239,68,68,0.15);">
              <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
            </div>
          </div>
          <h3 class="fw-bold text-danger mb-1">{{ kpis.alertasStockBajo }}</h3>
          <small class="text-danger">Prendas con stock &le; stock mínimo</small>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-4 mb-4">
      <div class="col-12 col-lg-8">
        <div class="card-sartorial h-100">
          <div class="card-sartorial-header">
            <h6 class="mb-0 font-display text-gold"><i class="bi bi-bar-chart-fill me-2"></i> Rendimiento Semanal de Ventas (Bs.)</h6>
          </div>
          <div class="card-sartorial-body">
            <canvas ref="chartVentasRef" style="max-height: 280px;"></canvas>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <div class="card-sartorial h-100">
          <div class="card-sartorial-header">
            <h6 class="mb-0 font-display text-gold"><i class="bi bi-pie-chart-fill me-2"></i> Distribución de Catálogo</h6>
          </div>
          <div class="card-sartorial-body d-flex align-items-center justify-content-center">
            <canvas ref="chartCategoriasRef" style="max-height: 250px;"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Tables Row: Últimas Ventas & Stock Crítico -->
    <div class="row g-4">
      <!-- Últimas Ventas -->
      <div class="col-12 col-lg-7">
        <div class="card-sartorial h-100">
          <div class="card-sartorial-header">
            <h6 class="mb-0 font-display text-gold"><i class="bi bi-clock-history me-2"></i> Últimas Transacciones Registradas</h6>
            <router-link to="/admin/ventas" class="btn btn-sm btn-outline-gold">Ver Todas</router-link>
          </div>
          <div class="card-sartorial-body p-0">
            <div class="table-responsive">
              <table class="table-sartorial mb-0">
                <thead>
                  <tr>
                    <th>Comprobante</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="v in ultimasVentas" :key="v.id">
                    <td class="fw-bold text-gold">{{ v.codigoComprobante || 'TKT-' + v.id }}</td>
                    <td>{{ v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Consumidor Final' }}</td>
                    <td class="text-secondary small">{{ formatDate(v.fecha) }}</td>
                    <td class="fw-bold">{{ formatPrice(v.total) }}</td>
                    <td>
                      <span class="badge" :class="v.estado === 'Confirmada' ? 'bg-success' : 'bg-danger'">
                        {{ v.estado }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="ultimasVentas.length === 0">
                    <td colspan="5" class="text-center text-secondary py-4">No hay ventas registradas aún</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Prendas en Stock Crítico -->
      <div class="col-12 col-lg-5">
        <div class="card-sartorial h-100">
          <div class="card-sartorial-header">
            <h6 class="mb-0 font-display text-danger"><i class="bi bi-shield-exclamation me-2"></i> Alerta de Existencias Bajas</h6>
            <router-link to="/admin/compras/nueva" class="btn btn-sm btn-outline-danger">Reponer</router-link>
          </div>
          <div class="card-sartorial-body p-0">
            <div class="table-responsive">
              <table class="table-sartorial mb-0">
                <thead>
                  <tr>
                    <th>Prenda / SKU</th>
                    <th>Talla</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in prendasStockBajo" :key="p.id">
                    <td>
                      <div class="fw-bold text-white text-truncate" style="max-width: 180px;">{{ p.nombre }}</div>
                      <small class="text-secondary">{{ p.codigo }}</small>
                    </td>
                    <td><span class="badge-talla">{{ p.talla }}</span></td>
                    <td>
                      <span class="badge-stock-low">{{ p.stock }} unid. (mín {{ p.stockMinimo }})</span>
                    </td>
                  </tr>
                  <tr v-if="prendasStockBajo.length === 0">
                    <td colspan="3" class="text-center text-success py-4">
                      <i class="bi bi-check-circle me-1"></i> Todo el inventario tiene existencias óptimas
                    </td>
                  </tr>
                </tbody>
              </table>
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
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const chartVentasRef = ref<HTMLCanvasElement | null>(null)
const chartCategoriasRef = ref<HTMLCanvasElement | null>(null)

const kpis = ref({
  ventasHoyCantidad: 0,
  ventasHoyMonto: 0,
  ventasMesCantidad: 0,
  ventasMesMonto: 0,
  totalTransacciones: 0,
  alertasStockBajo: 0,
})

const totalClientes = ref(0)
const ultimasVentas = ref<any[]>([])
const prendasStockBajo = ref<any[]>([])

const cargarDashboard = async () => {
  try {
    const [statsRes, ventasRes, clientesRes, prodRes] = await Promise.all([
      http.get('ventas/estadisticas'),
      http.get('ventas?limit=5'),
      http.get('clientes'),
      http.get('productos'),
    ])

    kpis.value = statsRes.data
    ultimasVentas.value = ventasRes.data
    totalClientes.value = clientesRes.data.length
    prendasStockBajo.value = prodRes.data.filter((p: any) => p.stock <= p.stockMinimo)

    renderCharts(prodRes.data)
  } catch (err) {
    console.error('Error al cargar dashboard:', err)
  }
}

const renderCharts = (productos: any[]) => {
  // Gráfico de Barras Ventas Semanales simuladas
  if (chartVentasRef.value) {
    new Chart(chartVentasRef.value, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
          {
            label: 'Ventas Semanales (Bs.)',
            data: [4200, 6800, 5100, 8900, 12400, 15800, 9200],
            backgroundColor: 'rgba(212, 175, 55, 0.7)',
            borderColor: '#D4AF37',
            borderWidth: 1.5,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    })
  }

  // Gráfico Dona Categorías
  if (chartCategoriasRef.value) {
    const catCounts: Record<string, number> = {}
    productos.forEach((p) => {
      const cat = p.categoria?.nombre || 'Otros'
      catCounts[cat] = (catCounts[cat] || 0) + 1
    })

    new Chart(chartCategoriasRef.value, {
      type: 'doughnut',
      data: {
        labels: Object.keys(catCounts).slice(0, 5),
        datasets: [
          {
            data: Object.values(catCounts).slice(0, 5),
            backgroundColor: ['#D4AF37', '#1E3A8A', '#3B82F6', '#10B981', '#EC4899'],
            borderColor: '#131A26',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94A3B8', boxWidth: 12 },
          },
        },
      },
    })
  }
}

onMounted(() => {
  cargarDashboard()
})
</script>
