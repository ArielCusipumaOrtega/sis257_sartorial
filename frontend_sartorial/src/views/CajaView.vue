<template>
  <div class="caja-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Control & Arqueo de Caja</h2>
        <p class="text-secondary small mb-0 font-display">Gestión de aperturas, cierres de turno y conciliación de efectivo</p>
      </div>
      <div v-if="cajaActiva" class="badge bg-success px-3 py-2 fs-6">
        <i class="bi bi-unlock-fill me-1"></i> CAJA ABIERTA ACTUALMENTE
      </div>
      <div v-else class="badge bg-danger px-3 py-2 fs-6">
        <i class="bi bi-lock-fill me-1"></i> CAJA CERRADA
      </div>
    </div>

    <!-- Si la Caja está ABIERTA: Panel de Control del Turno -->
    <div v-if="cajaActiva" class="card-sartorial p-4 mb-4 border-warning">
      <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary">
        <div>
          <h4 class="font-serif text-gold mb-0">Turno Activo #CJ-{{ cajaActiva.id }}</h4>
          <small class="text-secondary">Apertura: {{ formatDate(cajaActiva.fechaApertura) }} &bull; Cajero: {{ authStore.fullName }}</small>
        </div>
        <button class="btn btn-outline-danger" @click="mostrarModalCierre = true">
          <i class="bi bi-lock-fill me-1"></i> Realizar Arqueo y Cerrar Caja
        </button>
      </div>

      <div class="row g-3">
        <div class="col-md-3">
          <div class="p-3 rounded" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);">
            <small class="text-secondary text-uppercase font-display">Monto Apertura (Base)</small>
            <h4 class="fw-bold text-white my-1">{{ formatPrice(cajaActiva.montoApertura) }}</h4>
            <small class="text-secondary">Efectivo inicial en caja</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="p-3 rounded" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);">
            <small class="text-secondary text-uppercase font-display">Ventas en Efectivo</small>
            <h4 class="fw-bold text-success my-1">+ {{ formatPrice(cajaActiva.ventasEfectivo) }}</h4>
            <small class="text-secondary">Cobrado en mostrador</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="p-3 rounded" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);">
            <small class="text-secondary text-uppercase font-display">Ventas Digitales (Tarjeta/QR)</small>
            <h4 class="fw-bold text-info my-1">{{ formatPrice(Number(cajaActiva.ventasTarjeta || 0) + Number(cajaActiva.ventasQr || 0)) }}</h4>
            <small class="text-secondary">Comprobantes bancarios</small>
          </div>
        </div>
        <div class="col-md-3">
          <div class="p-3 rounded" style="background: rgba(212,175,55,0.1); border: 1px solid var(--primary);">
            <small class="text-gold text-uppercase font-display">Efectivo Esperado en Gaveta</small>
            <h4 class="fw-bold text-gold my-1">{{ formatPrice(totalEfectivoEsperado) }}</h4>
            <small class="text-secondary">Apertura + Cobros Efectivo</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Si la Caja está CERRADA: Formulario de Apertura -->
    <div v-else class="card-sartorial p-4 mb-4 border-secondary text-center py-5">
      <i class="bi bi-safe2 text-gold display-4 mb-3 d-inline-block"></i>
      <h4 class="font-serif text-white mb-2">No tiene un turno de caja abierto</h4>
      <p class="text-secondary mx-auto mb-4" style="max-width: 500px;">
        Ingrese el monto de dinero base con el que iniciará el turno en la gaveta física para habilitar el cobro en mostrador.
      </p>

      <form @submit.prevent="abrirCaja" class="mx-auto" style="max-width: 400px;">
        <div class="mb-3 text-start">
          <label class="form-label">Monto de Apertura Base (Bs.) *</label>
          <input v-model.number="montoAperturaInput" type="number" step="0.01" class="form-control form-control-lg text-end" placeholder="500.00" required />
        </div>
        <div class="mb-3 text-start">
          <label class="form-label">Observaciones de Inicio</label>
          <input v-model="observacionesAperturaInput" type="text" class="form-control" placeholder="Ej. Billetes y monedas para cambio..." />
        </div>
        <button type="submit" class="btn btn-gold btn-lg w-100 font-display" :disabled="abriendo">
          <i class="bi bi-unlock-fill me-1"></i> {{ abriendo ? 'Abriendo Turno...' : 'ABRIR TURNO DE CAJA' }}
        </button>
      </form>
    </div>

    <!-- Historial de Cajas -->
    <div class="card-sartorial">
      <div class="card-sartorial-header">
        <h6 class="mb-0 font-display text-gold"><i class="bi bi-clock-history me-2"></i> Historial de Turnos de Caja</h6>
      </div>
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th>N° Turno</th>
                <th>Cajero / Asesor</th>
                <th>Apertura</th>
                <th>Cierre</th>
                <th>Monto Apertura</th>
                <th>Ventas Efectivo</th>
                <th>Monto Cierre Real</th>
                <th>Diferencia Arqueo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in historialCajas" :key="c.id">
                <td class="text-gold fw-bold">#CJ-{{ c.id }}</td>
                <td class="fw-bold text-white">{{ c.usuario ? `${c.usuario.nombre} ${c.usuario.apellido}` : 'Cajero' }}</td>
                <td class="small text-secondary">{{ formatDate(c.fechaApertura) }}</td>
                <td class="small text-secondary">{{ c.fechaCierre ? formatDate(c.fechaCierre) : 'En Curso' }}</td>
                <td>{{ formatPrice(c.montoApertura) }}</td>
                <td class="text-success">{{ formatPrice(c.ventasEfectivo) }}</td>
                <td class="fw-bold">{{ c.montoCierre ? formatPrice(c.montoCierre) : '-' }}</td>
                <td>
                  <span v-if="c.fechaCierre" class="badge" :class="Number(c.diferencia) === 0 ? 'bg-success' : Number(c.diferencia) > 0 ? 'bg-info' : 'bg-danger'">
                    {{ Number(c.diferencia) >= 0 ? '+' : '' }}{{ formatPrice(c.diferencia) }}
                  </span>
                  <span v-else class="text-secondary">-</span>
                </td>
                <td>
                  <span class="badge" :class="c.estado === 'Abierta' ? 'bg-success' : 'bg-secondary'">
                    {{ c.estado }}
                  </span>
                </td>
              </tr>
              <tr v-if="historialCajas.length === 0">
                <td colspan="9" class="text-center text-secondary py-4">No hay turnos de caja registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Cierre y Arqueo -->
    <div v-if="mostrarModalCierre" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">Arqueo y Cierre de Caja</h5>
            <button type="button" class="btn-close btn-close-white" @click="mostrarModalCierre = false"></button>
          </div>
          <form @submit.prevent="cerrarCaja">
            <div class="modal-body p-4">
              <div class="p-3 mb-3 rounded" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);">
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-secondary small">Monto Apertura Base:</span>
                  <span>{{ formatPrice(cajaActiva?.montoApertura) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-secondary small">Ventas Efectivo Mostrador:</span>
                  <span class="text-success">+ {{ formatPrice(cajaActiva?.ventasEfectivo) }}</span>
                </div>
                <hr class="border-secondary my-2" />
                <div class="d-flex justify-content-between fw-bold">
                  <span>Total Efectivo Esperado:</span>
                  <span class="text-gold fs-5">{{ formatPrice(totalEfectivoEsperado) }}</span>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Efectivo Físico Contado en Gaveta (Bs.) *</label>
                <input
                  v-model.number="montoCierreInput"
                  type="number"
                  step="0.01"
                  class="form-control form-control-lg text-end"
                  placeholder="0.00"
                  required
                />
              </div>

              <div class="p-3 mb-3 rounded d-flex justify-content-between align-items-center" :class="diferenciaArqueo === 0 ? 'bg-dark border border-success' : diferenciaArqueo > 0 ? 'bg-dark border border-info' : 'bg-dark border border-danger'">
                <span class="small font-display">DIFERENCIA DE ARQUEO:</span>
                <span class="fs-4 fw-bold" :class="diferenciaArqueo === 0 ? 'text-success' : diferenciaArqueo > 0 ? 'text-info' : 'text-danger'">
                  {{ diferenciaArqueo >= 0 ? '+' : '' }}{{ formatPrice(diferenciaArqueo) }}
                  <small style="font-size: 0.75rem;" class="d-block text-end">
                    {{ diferenciaArqueo === 0 ? '(Cuadre Exacto)' : diferenciaArqueo > 0 ? '(Sobrante)' : '(Faltante)' }}
                  </small>
                </span>
              </div>

              <div class="mb-3">
                <label class="form-label">Observaciones Finales del Cierre</label>
                <textarea v-model="observacionesCierreInput" class="form-control" rows="2" placeholder="Notas sobre billetes dañados, retiros, etc..."></textarea>
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-secondary" @click="mostrarModalCierre = false">Cancelar</button>
              <button type="submit" class="btn btn-danger" :disabled="cerrando">
                <i class="bi bi-lock-fill me-1"></i> {{ cerrando ? 'Cerrando...' : 'Confirmar Cierre de Turno' }}
              </button>
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
import { formatPrice, formatDate } from '@/helpers'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const authStore = useAuthStore()

const cajaActiva = ref<any | null>(null)
const historialCajas = ref<any[]>([])

// Apertura
const montoAperturaInput = ref(500)
const observacionesAperturaInput = ref('')
const abriendo = ref(false)

// Cierre
const mostrarModalCierre = ref(false)
const montoCierreInput = ref(0)
const observacionesCierreInput = ref('')
const cerrando = ref(false)

const totalEfectivoEsperado = computed(() => {
  if (!cajaActiva.value) return 0
  return Number(cajaActiva.value.montoApertura || 0) + Number(cajaActiva.value.ventasEfectivo || 0)
})

const diferenciaArqueo = computed(() => {
  return montoCierreInput.value - totalEfectivoEsperado.value
})

const cargarDatos = async () => {
  try {
    const [activaRes, histRes] = await Promise.all([
      http.get('cajas/activa').catch(() => ({ data: null })),
      http.get('cajas'),
    ])
    cajaActiva.value = activaRes.data
    historialCajas.value = histRes.data
    if (cajaActiva.value) {
      montoCierreInput.value = totalEfectivoEsperado.value
    }
  } catch (e) {
    console.error(e)
  }
}

const abrirCaja = async () => {
  abriendo.value = true
  try {
    const res = await http.post('cajas/abrir', {
      montoApertura: montoAperturaInput.value,
      observaciones: observacionesAperturaInput.value,
    })
    cajaActiva.value = res.data
    cargarDatos()
    Swal.fire({
      icon: 'success',
      title: 'Turno de Caja Abierto',
      text: 'La caja se encuentra habilitada para registrar ventas físicas.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1800,
      showConfirmButton: false,
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo abrir la caja.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    abriendo.value = false
  }
}

const cerrarCaja = async () => {
  if (!cajaActiva.value) return
  cerrando.value = true
  try {
    await http.post(`cajas/${cajaActiva.value.id}/cerrar`, {
      montoCierre: montoCierreInput.value,
      observaciones: observacionesCierreInput.value,
    })
    mostrarModalCierre.value = false
    cajaActiva.value = null
    cargarDatos()
    Swal.fire({
      icon: 'success',
      title: 'Caja Cerrada & Arqueada',
      text: 'El balance del turno ha sido consolidado en el sistema.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo cerrar la caja.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    cerrando.value = false
  }
}

onMounted(() => {
  cargarDatos()
})
</script>
