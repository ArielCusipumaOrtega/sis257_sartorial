<template>
  <div class="nueva-compra-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Registrar Ingreso de Lote</h2>
        <p class="text-secondary small mb-0 font-display">Reabastecimiento de prendas y actualización automática de stock</p>
      </div>
      <router-link to="/admin/compras" class="btn btn-outline-secondary text-white">
        <i class="bi bi-arrow-left me-1"></i> Volver a Compras
      </router-link>
    </div>

    <form @submit.prevent="guardarCompra">
      <div class="row g-4">
        <!-- Formulario Proveedor & Datos Generales -->
        <div class="col-12 col-lg-4">
          <div class="card-sartorial p-4 h-100 d-flex flex-column">
            <h5 class="font-serif text-gold mb-3"><i class="bi bi-building me-2"></i> Datos del Proveedor</h5>

            <div class="mb-3">
              <label class="form-label">Proveedor *</label>
              <select v-model="form.proveedorId" class="form-select" required>
                <option :value="null" disabled>Seleccione un proveedor...</option>
                <option v-for="p in proveedores" :key="p.id" :value="p.id">
                  {{ p.nombre }} (NIT: {{ p.nit || 'S/N' }})
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Observaciones / N° de Guía de Remisión</label>
              <textarea v-model="form.observaciones" class="form-control" rows="3" placeholder="Ej. Lote otoño, importación Milán #4928..."></textarea>
            </div>

            <div class="mt-auto p-3 rounded" style="background: rgba(212,175,55,0.08); border: 1px solid var(--primary);">
              <span class="text-secondary small d-block">TOTAL DEL LOTE:</span>
              <div class="display-6 fw-bold text-gold">{{ formatPrice(totalCompra) }}</div>
              <small class="text-secondary">{{ form.detalles.length }} ítems en la orden</small>
            </div>

            <button type="submit" class="btn btn-gold w-100 py-3 font-display mt-3" :disabled="guardando || form.detalles.length === 0">
              <i class="bi bi-check2-circle me-1"></i> {{ guardando ? 'Guardando...' : 'GUARDAR & AUMENTAR STOCK' }}
            </button>
          </div>
        </div>

        <!-- Desglose de Prendas del Lote -->
        <div class="col-12 col-lg-8">
          <div class="card-sartorial p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="font-serif text-white mb-0"><i class="bi bi-box-seam me-2"></i> Prendas a Reabastecer</h5>
              <button type="button" class="btn btn-sm btn-outline-gold" @click="agregarLinea">
                <i class="bi bi-plus-lg me-1"></i> Añadir Línea
              </button>
            </div>

            <div v-for="(det, index) in form.detalles" :key="index" class="p-3 mb-3 rounded" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
              <div class="row g-2 align-items-center">
                <div class="col-md-5">
                  <label class="form-label small">Prenda del Catálogo *</label>
                  <select v-model="det.productoId" class="form-select form-select-sm" required @change="alSeleccionarProducto(det)">
                    <option :value="null" disabled>Seleccionar prenda...</option>
                    <option v-for="prod in productos" :key="prod.id" :value="prod.id">
                      {{ prod.codigo }} - {{ prod.nombre }} (Talla: {{ prod.talla }}, Stock Actual: {{ prod.stock }})
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Cantidad a Ingresar *</label>
                  <input v-model.number="det.cantidad" type="number" min="1" class="form-control form-control-sm" required />
                </div>
                <div class="col-md-3">
                  <label class="form-label small">Costo Compra Unit. (Bs.) *</label>
                  <input v-model.number="det.precio" type="number" step="0.01" class="form-control form-control-sm" required />
                </div>
                <div class="col-md-1 text-end pt-4">
                  <button type="button" class="btn btn-sm btn-outline-danger" @click="eliminarLinea(index)" :disabled="form.detalles.length <= 1">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <div class="text-end mt-2 small text-secondary">
                Subtotal línea: <strong class="text-gold">{{ formatPrice(det.cantidad * det.precio) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import http from '@/plugins/axios'
import { formatPrice } from '@/helpers'
import Swal from 'sweetalert2'
import router from '@/router'

const proveedores = ref<any[]>([])
const productos = ref<any[]>([])
const guardando = ref(false)

const form = ref({
  proveedorId: null as number | null,
  observaciones: '',
  detalles: [
    { productoId: null as number | null, cantidad: 10, precio: 0 },
  ],
})

const totalCompra = computed(() => {
  return form.value.detalles.reduce((acc, d) => acc + (d.cantidad || 0) * (d.precio || 0), 0)
})

const cargarDatos = async () => {
  try {
    const [prRes, pRes] = await Promise.all([
      http.get('proveedores'),
      http.get('productos?esCombo=false'),
    ])
    proveedores.value = prRes.data
    productos.value = pRes.data
    if (proveedores.value.length > 0) {
      form.value.proveedorId = proveedores.value[0].id
    }
  } catch (e) {
    console.error(e)
  }
}

const alSeleccionarProducto = (det: any) => {
  const p = productos.value.find((x) => x.id === det.productoId)
  if (p && (!det.precio || det.precio === 0)) {
    det.precio = Number(p.precioCompra || 0)
  }
}

const agregarLinea = () => {
  form.value.detalles.push({ productoId: null, cantidad: 5, precio: 0 })
}

const eliminarLinea = (index: number) => {
  if (form.value.detalles.length > 1) {
    form.value.detalles.splice(index, 1)
  }
}

const guardarCompra = async () => {
  const invalid = form.value.detalles.some((d) => !d.productoId || d.cantidad <= 0 || d.precio <= 0)
  if (invalid) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos Incompletos',
      text: 'Verifique que todas las prendas tengan seleccionada una opción, cantidad y costo válido.',
      background: '#131A26',
      color: '#F8FAFC',
    })
    return
  }

  guardando.value = true
  try {
    await http.post('compras', form.value)
    Swal.fire({
      icon: 'success',
      title: '¡Compra Registrada!',
      text: 'El lote ha ingresado al almacén y el inventario ha sido actualizado.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 2000,
      showConfirmButton: false,
    })
    router.push('/admin/compras')
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo registrar la compra.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarDatos()
})
</script>
