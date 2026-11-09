<template>
  <div class="promociones-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Promociones & Descuentos Estacionales</h2>
        <p class="text-secondary small mb-0 font-display">Ofertas de etiqueta, temporadas nupciales y rebajas exclusivas</p>
      </div>
      <button class="btn btn-gold d-flex align-items-center gap-2" @click="abrirCrear">
        <i class="bi bi-percent"></i> Crear Nueva Promoción
      </button>
    </div>

    <!-- Grid de Promociones -->
    <div class="row g-4 mb-4">
      <div v-for="p in promociones" :key="p.id" class="col-12 col-md-6 col-lg-4">
        <div class="card-sartorial p-4 h-100 d-flex flex-column border-warning">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-danger fs-6">-{{ p.descuento }}% OFF</span>
            <span class="badge" :class="p.estado ? 'bg-success' : 'bg-secondary'">
              {{ p.estado ? 'Activa' : 'Inactiva' }}
            </span>
          </div>

          <h4 class="font-serif text-white mb-2">{{ p.nombre }}</h4>
          <p class="text-secondary small mb-3 flex-grow-1" style="line-height: 1.5;">
            {{ p.descripcion || 'Sin condiciones específicas.' }}
          </p>

          <div class="p-2 mb-3 rounded bg-dark border border-secondary small text-secondary">
            <div><i class="bi bi-calendar-event me-1 text-gold"></i> Vigencia: {{ formatDate(p.fechaInicio) }} &rarr; {{ formatDate(p.fechaFin) }}</div>
            <div class="mt-1"><i class="bi bi-tags me-1 text-gold"></i> Prendas vinculadas: <strong class="text-white">{{ p.productos?.length || 0 }} modelos</strong></div>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-2 border-top border-secondary">
            <button class="btn btn-sm btn-outline-gold" @click="abrirEditar(p)"><i class="bi bi-pencil me-1"></i> Editar</button>
            <button class="btn btn-sm btn-outline-danger" @click="eliminar(p)"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
      <div v-if="promociones.length === 0" class="col-12 text-center py-5 text-secondary">
        No hay promociones registradas actualmente
      </div>
    </div>

    <!-- Modal Formulario -->
    <div v-if="modalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">{{ modoEdicion ? 'Editar Promoción' : 'Nueva Promoción' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="modalOpen = false"></button>
          </div>
          <form @submit.prevent="guardar">
            <div class="modal-body p-4">
              <div class="row g-3 mb-3">
                <div class="col-md-8">
                  <label class="form-label">Nombre de la Promoción *</label>
                  <input v-model="form.nombre" type="text" class="form-control" placeholder="Ej. Temporada Gala & Ceremonias" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Porcentaje de Descuento (%) *</label>
                  <input v-model.number="form.descuento" type="number" step="0.5" min="1" max="99" class="form-control" required />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label">Fecha de Inicio *</label>
                  <input v-model="form.fechaInicio" type="date" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Fecha de Fin *</label>
                  <input v-model="form.fechaFin" type="date" class="form-control" required />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Descripción de Condiciones y Beneficio</label>
                <textarea v-model="form.descripcion" class="form-control" rows="2"></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Prendas a las que aplica el descuento</label>
                <div class="p-2 rounded overflow-y-auto border border-secondary" style="max-height: 180px; background: rgba(255,255,255,0.02);">
                  <div v-for="prod in prendasDisponibles" :key="prod.id" class="form-check mb-1">
                    <input class="form-check-input" type="checkbox" :value="prod.id" v-model="form.productoIds" :id="'prod_' + prod.id" />
                    <label class="form-check-label small text-white" :for="'prod_' + prod.id">
                      {{ prod.codigo }} - {{ prod.nombre }} (Talla: {{ prod.talla }}, Precio Base: {{ formatPrice(prod.precioVenta) }})
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-secondary" @click="modalOpen = false">Cancelar</button>
              <button type="submit" class="btn btn-gold" :disabled="guardando">
                <i class="bi bi-check2-circle me-1"></i> Guardar Promoción
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/plugins/axios'
import { formatPrice, formatDate } from '@/helpers'
import Swal from 'sweetalert2'

const promociones = ref<any[]>([])
const prendasDisponibles = ref<any[]>([])
const modalOpen = ref(false)
const modoEdicion = ref(false)
const editId = ref<number | null>(null)
const guardando = ref(false)

const form = ref({
  nombre: '',
  descuento: 15,
  fechaInicio: new Date().toISOString().split('T')[0],
  fechaFin: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
  descripcion: '',
  productoIds: [] as number[],
})

const cargarDatos = async () => {
  try {
    const [promRes, prodRes] = await Promise.all([
      http.get('promociones'),
      http.get('productos?esCombo=false'),
    ])
    promociones.value = promRes.data
    prendasDisponibles.value = prodRes.data
  } catch (e) {
    console.error(e)
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  editId.value = null
  form.value = {
    nombre: '',
    descuento: 15,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    descripcion: '',
    productoIds: [],
  }
  modalOpen.value = true
}

const abrirEditar = (p: any) => {
  modoEdicion.value = true
  editId.value = p.id
  form.value = {
    nombre: p.nombre,
    descuento: Number(p.descuento),
    fechaInicio: p.fechaInicio ? new Date(p.fechaInicio).toISOString().split('T')[0] : '',
    fechaFin: p.fechaFin ? new Date(p.fechaFin).toISOString().split('T')[0] : '',
    descripcion: p.descripcion || '',
    productoIds: p.productos ? p.productos.map((x: any) => x.id) : [],
  }
  modalOpen.value = true
}

const guardar = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value && editId.value) {
      await http.patch(`promociones/${editId.value}`, form.value)
    } else {
      await http.post('promociones', form.value)
    }
    modalOpen.value = false
    cargarDatos()
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Promoción guardada correctamente.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo guardar la promoción.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    guardando.value = false
  }
}

const eliminar = async (p: any) => {
  const res = await Swal.fire({
    title: `¿Eliminar promoción ${p.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    confirmButtonText: 'Sí, eliminar',
    background: '#131A26',
    color: '#F8FAFC',
  })
  if (res.isConfirmed) {
    try {
      await http.delete(`promociones/${p.id}`)
      cargarDatos()
    } catch (e: any) {
      console.error(e)
    }
  }
}

onMounted(() => {
  cargarDatos()
})
</script>
