<template>
  <div class="productos-view">
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Catálogo de Prendas & Calzado</h2>
        <p class="text-secondary small mb-0 font-display">Administración de existencias, especificaciones textiles y precios</p>
      </div>
      <button v-if="authStore.isAdmin" class="btn btn-gold d-flex align-items-center gap-2" @click="abrirModalCrear">
        <i class="bi bi-plus-circle-fill"></i> Registrar Nueva Prenda
      </button>
    </div>

    <!-- Filtros -->
    <div class="card-sartorial p-3 mb-4">
      <div class="row g-3">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text bg-transparent text-gold border-secondary"><i class="bi bi-search"></i></span>
            <input v-model="filtroBusqueda" type="text" class="form-control" placeholder="Buscar por nombre, código SKU, color, material..." />
          </div>
        </div>
        <div class="col-md-3">
          <select v-model="categoriaFiltro" class="form-select">
            <option :value="null">Todas las Categorías</option>
            <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="marcaFiltro" class="form-select">
            <option :value="null">Todas las Marcas</option>
            <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla de Prendas -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial table-fixed mb-0" style="min-width: 860px;">
            <thead>
              <tr>
                <th style="width: 21%;">Prenda</th>
                <th style="width: 11%;">SKU</th>
                <th style="width: 13%;">Categoría / Firma</th>
                <th style="width: 13%;">Talla & Corte</th>
                <th style="width: 14%;">Tejido / Color</th>
                <th class="text-end" style="width: 12%;">Precio Venta</th>
                <th class="text-center" style="width: 8%;">Stock</th>
                <th v-if="authStore.isAdmin" class="cell-actions text-end pe-3" style="width: 8%;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in prendasFiltradas" :key="p.id">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <img :src="getImageUrl(p.imagen)" class="rounded object-fit-cover flex-shrink-0" style="width: 38px; height: 38px; background: #111;" />
                    <div class="min-w-0" style="overflow: hidden;">
                      <div class="fw-bold text-white text-truncate-2" style="font-size: 0.84rem; line-height: 1.25;" :title="p.nombre">{{ p.nombre }}</div>
                      <div class="d-flex flex-wrap gap-1 mt-1">
                        <small v-if="p.esCombo" class="badge bg-gold px-1 py-0" style="font-size: 0.65rem;">Outfit Completo</small>
                        <small v-if="p.fechaEliminacion" class="badge bg-danger px-1 py-0" style="font-size: 0.65rem;">Dado de baja</small>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-gold fw-bold small text-nowrap" style="letter-spacing: 0.3px;">{{ p.codigo }}</td>
                <td>
                  <div class="text-white small fw-semibold lh-sm text-truncate" :title="p.categoria?.nombre || 'General'">{{ p.categoria?.nombre || 'General' }}</div>
                  <small class="text-secondary d-block text-truncate mt-1" :title="p.marca?.nombre || 'Sartorial'">{{ p.marca?.nombre || 'Sartorial' }}</small>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-1 align-items-center">
                    <span class="badge-talla" style="font-size: 0.72rem; padding: 2px 7px;">{{ p.talla }}</span>
                    <span class="badge-corte" style="font-size: 0.72rem; padding: 2px 7px;">{{ p.corte }}</span>
                  </div>
                </td>
                <td>
                  <div class="small text-white lh-sm text-truncate" :title="p.material">{{ p.material }}</div>
                  <small class="text-secondary d-block text-truncate mt-1" :title="p.color">{{ p.color }}</small>
                </td>
                <td class="text-end">
                  <PriceTag
                    :amount="p.precioFinal || p.precioVenta"
                    :original-amount="p.descuentoPorcentaje > 0 ? p.precioVenta : undefined"
                    :discount="p.descuentoPorcentaje"
                    size="sm"
                    stacked
                  />
                </td>
                <td class="text-center">
                  <span
                    :class="p.stock <= p.stockMinimo ? 'badge-stock-low' : 'badge-stock-ok'"
                    class="d-inline-block text-nowrap"
                    style="font-size: 0.74rem; padding: 2px 7px;"
                  >
                    <i v-if="p.stock <= p.stockMinimo" class="bi bi-exclamation-triangle-fill me-1"></i>
                    {{ p.stock }} unid.
                  </span>
                  <div class="text-secondary" style="font-size: 0.68rem; margin-top: 2px;">
                    mín: {{ p.stockMinimo }}
                  </div>
                </td>
                <td v-if="authStore.isAdmin" class="cell-actions text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    <template v-if="p.fechaEliminacion">
                      <button class="btn btn-sm btn-outline-success px-2 py-1" @click="restaurarPrenda(p)" title="Restaurar Prenda">
                        <i class="bi bi-arrow-counterclockwise"></i>
                      </button>
                    </template>
                    <template v-else>
                      <button class="btn btn-sm btn-outline-gold px-2 py-1" @click="abrirModalEditar(p)" title="Editar">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger px-2 py-1" @click="eliminarPrenda(p)" title="Dar de baja (Soft Delete)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
              <tr v-if="prendasFiltradas.length === 0">
                <td :colspan="authStore.isAdmin ? 8 : 7" class="text-center text-secondary py-5">
                  No se encontraron prendas registradas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Crear / Editar Prenda -->
    <div v-if="modalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">
              {{ modoEdicion ? 'Editar Prenda de Sastrería' : 'Registrar Nueva Prenda Formal' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="modalOpen = false"></button>
          </div>
          <form @submit.prevent="guardarPrenda">
            <div class="modal-body p-4">
              <div class="row g-3 mb-3">
                <div class="col-md-8">
                  <label class="form-label">Nombre Comercial de la Prenda *</label>
                  <input v-model="form.nombre" type="text" class="form-control" placeholder="Ej. Blazer de Lino Italiano Desestructurado" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Código SKU / Barra *</label>
                  <input v-model="form.codigo" type="text" class="form-control" placeholder="Ej. BLZ-LIN-001" required />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-4">
                  <label class="form-label">Categoría *</label>
                  <select v-model="form.categoriaId" class="form-select" required>
                    <option :value="null" disabled>Seleccionar...</option>
                    <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Marca / Firma *</label>
                  <select v-model="form.marcaId" class="form-select" required>
                    <option :value="null" disabled>Seleccionar...</option>
                    <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Proveedor Habitual</label>
                  <select v-model="form.proveedorId" class="form-select">
                    <option :value="null">Ninguno / Stock Propio</option>
                    <option v-for="pr in proveedores" :key="pr.id" :value="pr.id">{{ pr.nombre }}</option>
                  </select>
                </div>
              </div>

              <!-- Especificaciones de Confección -->
              <div class="p-3 mb-3 rounded" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
                <h6 class="small font-display text-gold mb-3"><i class="bi bi-rulers me-2"></i> Atributos de Confección & Talla</h6>
                <div class="row g-2">
                  <div class="col-md-3">
                    <label class="form-label">Talla *</label>
                    <input v-model="form.talla" type="text" class="form-control" placeholder="40R, 42L, M, 42..." required />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Corte / Fit *</label>
                    <select v-model="form.corte" class="form-select">
                      <option value="Slim Fit">Slim Fit</option>
                      <option value="Tailored Fit">Tailored Fit</option>
                      <option value="Classic Fit">Classic Fit</option>
                      <option value="Modern Fit">Modern Fit</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Material / Paño *</label>
                    <input v-model="form.material" type="text" class="form-control" placeholder="Lana Super 130s, Lino..." required />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Color *</label>
                    <input v-model="form.color" type="text" class="form-control" placeholder="Negro, Azul Marino..." required />
                  </div>
                </div>
              </div>

              <!-- Precios y Stock -->
              <div class="row g-3 mb-3">
                <div class="col-md-3">
                  <label class="form-label">Precio Compra (Bs.)</label>
                  <input v-model.number="form.precioCompra" type="number" step="0.01" class="form-control" placeholder="0.00" />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Precio Venta (Bs.) *</label>
                  <input v-model.number="form.precioVenta" type="number" step="0.01" class="form-control" placeholder="0.00" required />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Stock en Boutique *</label>
                  <input v-model.number="form.stock" type="number" class="form-control" required />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Stock Mínimo</label>
                  <input v-model.number="form.stockMinimo" type="number" class="form-control" />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Imagen de la Prenda</label>
                <div class="input-group">
                  <input v-model="form.imagen" type="text" class="form-control" placeholder="URL externa o archivo subido..." />
                  <label class="btn btn-outline-warning text-gold border-secondary mb-0 cursor-pointer d-flex align-items-center gap-1" title="Subir imagen (JPG, PNG, WEBP, máx 2MB)">
                    <i class="bi bi-cloud-arrow-up-fill"></i>
                    <span>{{ subiendoImagen ? 'Subiendo...' : 'Subir Archivo' }}</span>
                    <input type="file" class="d-none" accept="image/jpeg,image/png,image/webp" :disabled="subiendoImagen" @change="onFileChange" />
                  </label>
                </div>
                <small class="text-secondary" style="font-size: 0.72rem;">Formatos permitidos: JPG, PNG, WEBP (Límite máximo: 2 MB).</small>
              </div>

              <div class="mb-3">
                <label class="form-label">Descripción & Cuidados de la Prenda</label>
                <textarea v-model="form.descripcion" class="form-control" rows="2" placeholder="Detalle de solapas, forros, instrucciones de limpieza en seco..."></textarea>
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-secondary" @click="modalOpen = false">Cancelar</button>
              <button type="submit" class="btn btn-gold" :disabled="guardando">
                <i class="bi bi-check2-circle me-1"></i> {{ guardando ? 'Guardando...' : 'Guardar Prenda' }}
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
import { getImageUrl, formatPrice } from '@/helpers'
import { useAuthStore } from '@/stores/auth'
import { PriceTag, StatusBadge } from '@/components/common'
import Swal from 'sweetalert2'

const authStore = useAuthStore()

const prendas = ref<any[]>([])
const categorias = ref<any[]>([])
const marcas = ref<any[]>([])
const proveedores = ref<any[]>([])

const filtroBusqueda = ref('')
const categoriaFiltro = ref<number | null>(null)
const marcaFiltro = ref<number | null>(null)

const modalOpen = ref(false)
const modoEdicion = ref(false)
const guardando = ref(false)
const subiendoImagen = ref(false)
const prendaEditandoId = ref<number | null>(null)

const form = ref({
  nombre: '',
  codigo: '',
  categoriaId: null as number | null,
  marcaId: null as number | null,
  proveedorId: null as number | null,
  talla: '40R',
  corte: 'Slim Fit',
  material: 'Lana Super 130s',
  color: 'Azul Marino',
  precioCompra: 0,
  precioVenta: 0,
  stock: 10,
  stockMinimo: 3,
  imagen: '',
  descripcion: '',
})

const cargarDatos = async () => {
  try {
    const promises: Promise<any>[] = [
      http.get('productos'),
      http.get('categorias'),
      http.get('marcas'),
    ]
    if (authStore.isAdmin) {
      promises.push(http.get('proveedores'))
    }

    const [pRes, cRes, mRes, prRes] = await Promise.all(promises)
    prendas.value = Array.isArray(pRes.data) ? pRes.data : (pRes.data?.data || [])
    categorias.value = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data || [])
    marcas.value = Array.isArray(mRes.data) ? mRes.data : (mRes.data?.data || [])
    if (prRes) {
      proveedores.value = Array.isArray(prRes.data) ? prRes.data : (prRes.data?.data || [])
    }
  } catch (err) {
    console.error('Error al cargar datos en ProductosView:', err)
  }
}

const prendasFiltradas = computed(() => {
  let list = Array.isArray(prendas.value) ? [...prendas.value] : []
  if (categoriaFiltro.value) {
    list = list.filter((p) => p.categoriaId === categoriaFiltro.value)
  }
  if (marcaFiltro.value) {
    list = list.filter((p) => p.marcaId === marcaFiltro.value)
  }
  if (filtroBusqueda.value.trim()) {
    const s = filtroBusqueda.value.toLowerCase()
    list = list.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(s) ||
        p.codigo?.toLowerCase().includes(s) ||
        p.color?.toLowerCase().includes(s) ||
        p.material?.toLowerCase().includes(s) ||
        p.talla?.toLowerCase().includes(s),
    )
  }
  return list
})

const abrirModalCrear = () => {
  modoEdicion.value = false
  prendaEditandoId.value = null
  form.value = {
    nombre: '',
    codigo: '',
    categoriaId: categorias.value[0]?.id || null,
    marcaId: marcas.value[0]?.id || null,
    proveedorId: null,
    talla: '40R',
    corte: 'Slim Fit',
    material: 'Lana Super 130s',
    color: 'Azul Marino Imperial',
    precioCompra: 0,
    precioVenta: 0,
    stock: 10,
    stockMinimo: 3,
    imagen: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600',
    descripcion: '',
  }
  modalOpen.value = true
}

const abrirModalEditar = (p: any) => {
  modoEdicion.value = true
  prendaEditandoId.value = p.id
  form.value = {
    nombre: p.nombre,
    codigo: p.codigo,
    categoriaId: p.categoriaId,
    marcaId: p.marcaId,
    proveedorId: p.proveedorId,
    talla: p.talla || '40R',
    corte: p.corte || 'Slim Fit',
    material: p.material || 'Lana Virgen',
    color: p.color || 'Negro',
    precioCompra: Number(p.precioCompra || 0),
    precioVenta: Number(p.precioVenta || 0),
    stock: Number(p.stock || 0),
    stockMinimo: Number(p.stockMinimo || 3),
    imagen: p.imagen || '',
    descripcion: p.descripcion || '',
  }
  modalOpen.value = true
}

const onFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    Swal.fire({
      icon: 'warning',
      title: 'Archivo Excede el Límite',
      text: 'La imagen seleccionada supera el límite máximo de 2 MB.',
      background: '#131A26',
      color: '#F8FAFC',
    })
    target.value = ''
    return
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    Swal.fire({
      icon: 'warning',
      title: 'Formato no admitido',
      text: 'Solo se admiten imágenes en formato JPG, PNG o WEBP.',
      background: '#131A26',
      color: '#F8FAFC',
    })
    target.value = ''
    return
  }

  subiendoImagen.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await http.post('productos/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    form.value.imagen = res.data.url
    Swal.fire({
      icon: 'success',
      title: '¡Imagen Subida!',
      text: 'La imagen fue validada y guardada correctamente.',
      timer: 1500,
      showConfirmButton: false,
      background: '#131A26',
      color: '#F8FAFC',
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al subir imagen',
      text: err.response?.data?.message || 'No se pudo subir la imagen.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    subiendoImagen.value = false
    target.value = ''
  }
}

const guardarPrenda = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value && prendaEditandoId.value) {
      await http.patch(`productos/${prendaEditandoId.value}`, form.value)
      Swal.fire({
        icon: 'success',
        title: 'Prenda Actualizada',
        text: 'Los datos textiles se han actualizado con éxito.',
        background: '#131A26',
        color: '#F8FAFC',
        timer: 1600,
        showConfirmButton: false,
      })
    } else {
      await http.post('productos', form.value)
      Swal.fire({
        icon: 'success',
        title: 'Prenda Creada',
        text: 'La prenda se ha incorporado al catálogo.',
        background: '#131A26',
        color: '#F8FAFC',
        timer: 1600,
        showConfirmButton: false,
      })
    }
    modalOpen.value = false
    cargarDatos()
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo guardar la prenda.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    guardando.value = false
  }
}

const eliminarPrenda = async (p: any) => {
  const result = await Swal.fire({
    title: `¿Dar de baja ${p.nombre}?`,
    text: 'Esta acción aplicará Soft Delete (borrado lógico), preservando el inventario histórico y las ventas asociadas.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Sí, dar de baja',
    cancelButtonText: 'Cancelar',
    background: '#131A26',
    color: '#F8FAFC',
  })

  if (result.isConfirmed) {
    try {
      await http.delete(`productos/${p.id}`)
      Swal.fire({
        icon: 'success',
        title: 'Baja Lógica Exitosa',
        text: 'La prenda ha sido dada de baja del catálogo sin destruir datos históricos.',
        background: '#131A26',
        color: '#F8FAFC',
        timer: 1600,
        showConfirmButton: false,
      })
      cargarDatos()
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo dar de baja la prenda.',
        background: '#131A26',
        color: '#F8FAFC',
      })
    }
  }
}

const restaurarPrenda = async (p: any) => {
  const result = await Swal.fire({
    title: `¿Restaurar ${p.nombre}?`,
    text: 'La prenda volverá a estar disponible y activa en el catálogo y POS de la boutique.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10B981',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Sí, restaurar',
    cancelButtonText: 'Cancelar',
    background: '#131A26',
    color: '#F8FAFC',
  })

  if (result.isConfirmed) {
    try {
      await http.patch(`productos/${p.id}/restaurar`)
      Swal.fire({
        icon: 'success',
        title: 'Prenda Restaurada',
        text: 'La prenda fue reactivada exitosamente.',
        background: '#131A26',
        color: '#F8FAFC',
        timer: 1600,
        showConfirmButton: false,
      })
      cargarDatos()
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo restaurar la prenda.',
        background: '#131A26',
        color: '#F8FAFC',
      })
    }
  }
}

onMounted(() => {
  cargarDatos()
})
</script>
