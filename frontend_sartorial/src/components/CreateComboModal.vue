<template>
  <div class="modal fade" id="createComboModal" tabindex="-1" aria-labelledby="createComboModalLabel" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title font-display text-gold" id="createComboModalLabel">
            <i class="bi bi-collection-fill me-2"></i> Crear Nuevo Outfit / Colección Completa
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form @submit.prevent="guardarCombo">
          <div class="modal-body">
            <div class="row g-3 mb-3">
              <div class="col-md-7">
                <label class="form-label">Nombre del Outfit / Conjunto *</label>
                <input v-model="form.nombre" type="text" class="form-control" placeholder="Ej. Outfit Gala Black Tie Completo" required />
              </div>
              <div class="col-md-5">
                <label class="form-label">Código SKU *</label>
                <input v-model="form.codigo" type="text" class="form-control" placeholder="Ej. OUTFIT-GALA-02" required />
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label">Precio de Venta del Outfit (Bs.) *</label>
                <input v-model.number="form.precioVenta" type="number" step="0.01" class="form-control" placeholder="0.00" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Stock de Conjuntos Iniciales *</label>
                <input v-model.number="form.stock" type="number" class="form-control" placeholder="5" required />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">URL de Imagen Representativa</label>
              <input v-model="form.imagen" type="text" class="form-control" placeholder="https://..." />
            </div>

            <div class="mb-3">
              <label class="form-label">Descripción de las Prendas y Estilo</label>
              <textarea v-model="form.descripcion" class="form-control" rows="2" placeholder="Detalle de las prendas que conforman este look..."></textarea>
            </div>

            <hr class="border-secondary my-3" />

            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0 text-gold font-display"><i class="bi bi-diagram-3 me-2"></i> Prendas Componentes del Look</h6>
              <button type="button" class="btn btn-sm btn-outline-gold" @click="agregarItem">
                <i class="bi bi-plus-lg me-1"></i> Añadir Prenda
              </button>
            </div>

            <div v-for="(item, index) in form.items" :key="index" class="p-2 mb-2 rounded" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);">
              <div class="row g-2 align-items-center">
                <div class="col-md-7">
                  <select v-model="item.productoId" class="form-select form-select-sm" required>
                    <option :value="null" disabled>Seleccione una prenda del catálogo...</option>
                    <option v-for="p in prendasDisponibles" :key="p.id" :value="p.id">
                      {{ p.codigo }} - {{ p.nombre }} (Talla: {{ p.talla }}, Stock: {{ p.stock }})
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-transparent text-secondary border-secondary">Cant.</span>
                    <input v-model.number="item.cantidad" type="number" min="1" class="form-control" required />
                  </div>
                </div>
                <div class="col-md-2 text-end">
                  <button type="button" class="btn btn-sm btn-outline-danger" @click="quitarItem(index)" :disabled="form.items.length <= 1">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-gold" :disabled="loading">
              <i class="bi bi-check2-circle me-1"></i> {{ loading ? 'Guardando...' : 'Guardar Outfit' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/plugins/axios'
import Swal from 'sweetalert2'

const emit = defineEmits(['saved'])
const loading = ref(false)
const prendasDisponibles = ref<any[]>([])

const form = ref({
  nombre: '',
  codigo: '',
  precioVenta: 0,
  stock: 5,
  imagen: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600',
  descripcion: '',
  items: [
    { productoId: null, cantidad: 1 },
    { productoId: null, cantidad: 1 },
  ],
})

const cargarPrendas = async () => {
  try {
    const res = await http.get('productos?esCombo=false')
    prendasDisponibles.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const agregarItem = () => {
  form.value.items.push({ productoId: null, cantidad: 1 })
}

const quitarItem = (index: number) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
  }
}

const guardarCombo = async () => {
  // Validar items seleccionados
  const invalid = form.value.items.some((i) => !i.productoId || i.cantidad <= 0)
  if (invalid) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos Incompletos',
      text: 'Por favor seleccione prendas válidas para todos los componentes.',
      background: '#131A26',
      color: '#F8FAFC',
    })
    return
  }

  loading.value = true
  try {
    await http.post('combos', form.value)
    Swal.fire({
      icon: 'success',
      title: 'Outfit Creado',
      text: 'La colección / outfit completo ha sido registrado exitosamente.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1800,
      showConfirmButton: false,
    })
    emit('saved')
    // Reset form
    form.value = {
      nombre: '',
      codigo: '',
      precioVenta: 0,
      stock: 5,
      imagen: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600',
      descripcion: '',
      items: [
        { productoId: null, cantidad: 1 },
        { productoId: null, cantidad: 1 },
      ],
    }
    // Cerrar modal
    const modalEl = document.getElementById('createComboModal')
    if (modalEl) {
      const modalInstance = (window as any).bootstrap?.Modal.getInstance(modalEl)
      modalInstance?.hide()
    }
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo crear el outfit.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarPrendas()
})
</script>
