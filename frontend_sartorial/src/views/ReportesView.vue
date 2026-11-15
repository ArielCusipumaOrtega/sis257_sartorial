<template>
  <div class="reportes-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Centro de Reportes & Analítica Comercial</h2>
        <p class="text-secondary small mb-0 font-display">Informes financieros en tiempo real, kardex de inventario y exportación de datos</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-success d-flex align-items-center gap-1" @click="exportarVentasExcel">
          <i class="bi bi-file-earmark-excel-fill"></i> Ventas en Excel
        </button>
        <button class="btn btn-outline-info d-flex align-items-center gap-1" @click="exportarInventarioExcel">
          <i class="bi bi-file-earmark-spreadsheet-fill"></i> Inventario en Excel
        </button>
        <button class="btn btn-gold d-flex align-items-center gap-1" @click="imprimirReporte">
          <i class="bi bi-printer"></i> Imprimir Vista
        </button>
      </div>
    </div>

    <!-- KPIs de Reporte -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card-sartorial p-3">
          <small class="text-secondary text-uppercase font-display">Ventas Totales Registradas</small>
          <h3 class="fw-bold text-white my-1">{{ totalVentas }}</h3>
          <small class="text-gold">Órdenes cerradas en boutique</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card-sartorial p-3">
          <small class="text-secondary text-uppercase font-display">Ingresos Totales Acumulados</small>
          <div class="my-1">
            <PriceTag :amount="totalIngresos" size="lg" color="gold" />
          </div>
          <small class="text-secondary">Facturación bruta en bolivianos</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card-sartorial p-3">
          <small class="text-secondary text-uppercase font-display">Ticket Promedio</small>
          <div class="my-1">
            <PriceTag :amount="ticketPromedio" size="lg" color="info" />
          </div>
          <small class="text-secondary">Gasto promedio por orden</small>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card-sartorial p-3">
          <small class="text-secondary text-uppercase font-display">Modelos de Confección</small>
          <h3 class="fw-bold text-white my-1">{{ totalPrendas }}</h3>
          <small class="text-success">Prendas y trajes en catálogo</small>
        </div>
      </div>
    </div>

    <!-- Gráficos Vivos -->
    <div class="row g-4 mb-4">
      <div class="col-lg-8">
        <div class="card-sartorial p-4 h-100">
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <h5 class="font-serif text-gold mb-0"><i class="bi bi-graph-up me-2"></i> Evolución de Facturación Mensual (Bs.)</h5>
            <div class="d-flex align-items-center gap-2">
              <label class="small text-secondary mb-0">Gestión:</label>
              <select v-model="anioSeleccionado" class="form-select form-select-sm" style="width: 95px;" @change="cambiarAnio">
                <option :value="2026">2026</option>
                <option :value="2025">2025</option>
                <option :value="2024">2024</option>
              </select>
              <span class="badge bg-dark border border-gold text-gold font-display d-none d-sm-inline">SQL DATE_TRUNC</span>
            </div>
          </div>
          <canvas ref="chartMesesRef" style="max-height: 300px;"></canvas>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card-sartorial p-4 h-100">
          <h5 class="font-serif text-gold mb-3"><i class="bi bi-pie-chart me-2"></i> Medios de Cobro</h5>
          <canvas ref="chartMetodosRef" style="max-height: 280px;"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import http from '@/plugins/axios'
import PriceTag from '@/components/common/PriceTag.vue'
import { formatPrice } from '@/helpers'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const chartMesesRef = ref<HTMLCanvasElement | null>(null)
const chartMetodosRef = ref<HTMLCanvasElement | null>(null)
let chartMesesInstance: Chart | null = null
let chartMetodosInstance: Chart | null = null

const anioSeleccionado = ref(new Date().getFullYear())
const ventas = ref<any[]>([])
const productos = ref<any[]>([])
const pagos = ref<any[]>([])
const datosMensuales = ref<any>(null)

const totalVentas = computed(() => ventas.value.length)
const totalIngresos = computed(() => ventas.value.reduce((acc, v) => acc + Number(v.total || 0), 0))
const ticketPromedio = computed(() => (totalVentas.value > 0 ? totalIngresos.value / totalVentas.value : 0))
const totalPrendas = computed(() => productos.value.length)

const cargarReportes = async () => {
  try {
    const [vRes, pRes, pgRes, statsRes] = await Promise.all([
      http.get('ventas', { params: { all: true } }),
      http.get('productos', { params: { all: true } }),
      http.get('pagos'),
      http.get('ventas/estadisticas/mensuales', { params: { year: anioSeleccionado.value } }),
    ])

    ventas.value = Array.isArray(vRes.data) ? vRes.data : (vRes.data.data || [])
    productos.value = Array.isArray(pRes.data) ? pRes.data : (pRes.data.data || [])
    pagos.value = pgRes.data || []
    datosMensuales.value = statsRes.data

    renderizarGraficos()
  } catch (e) {
    console.error(e)
  }
}

const cambiarAnio = async () => {
  try {
    const statsRes = await http.get('ventas/estadisticas/mensuales', {
      params: { year: anioSeleccionado.value },
    })
    datosMensuales.value = statsRes.data
    renderizarGraficoMeses()
  } catch (e) {
    console.error(e)
  }
}

const renderizarGraficoMeses = () => {
  if (!chartMesesRef.value) return
  if (chartMesesInstance) chartMesesInstance.destroy()

  const labels = datosMensuales.value?.labels || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const dataTotales = datosMensuales.value?.totales || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const yearTitle = datosMensuales.value?.year || anioSeleccionado.value

  chartMesesInstance = new Chart(chartMesesRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `Ingresos Mensuales ${yearTitle} (Bs.)`,
          data: dataTotales,
          borderColor: '#D4AF37',
          backgroundColor: 'rgba(212,175,55,0.18)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#D4AF37',
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: {
          ticks: {
            color: '#94A3B8',
            callback: (value) => `Bs. ${value}`,
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  })
}

const renderizarGraficos = () => {
  renderizarGraficoMeses()

  if (chartMetodosRef.value) {
    if (chartMetodosInstance) chartMetodosInstance.destroy()

    const metCounts: Record<string, number> = {}
    pagos.value.forEach((p) => {
      const nombre = p.metodoPago?.nombre || 'Efectivo'
      metCounts[nombre] = (metCounts[nombre] || 0) + Number(p.monto || 0)
    })

    const labels = Object.keys(metCounts).length > 0 ? Object.keys(metCounts) : ['Efectivo', 'Tarjeta', 'QR']
    const data = Object.values(metCounts).length > 0 ? Object.values(metCounts) : [100, 0, 0]

    chartMetodosInstance = new Chart(chartMetodosRef.value, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ['#10B981', '#3B82F6', '#D4AF37', '#8B5CF6'],
            borderColor: '#131A26',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94A3B8' } },
        },
      },
    })
  }
}

const exportarVentasExcel = () => {
  const base = http.defaults.baseURL || '/api/v1/'
  const url = `${base.replace(/\/+$/, '')}/documentos/ventas/excel`
  window.open(url, '_blank')
}

const exportarInventarioExcel = () => {
  const base = http.defaults.baseURL || '/api/v1/'
  const url = `${base.replace(/\/+$/, '')}/documentos/inventario/excel`
  window.open(url, '_blank')
}

const imprimirReporte = () => {
  window.print()
}

onMounted(() => {
  cargarReportes()
})
</script>
