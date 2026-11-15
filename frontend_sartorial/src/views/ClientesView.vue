<template>
  <div class="clientes-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Cartera de Clientes Exclusivos</h2>
        <p class="text-secondary small mb-0 font-display">Perfiles de compradores, ficha antropométrica de sastrería y preferencias de corte</p>
      </div>
      <button class="btn btn-gold d-flex align-items-center gap-2" @click="abrirCrear">
        <i class="bi bi-person-plus-fill"></i> Registrar Cliente
      </button>
    </div>

    <!-- Buscador y Filtro -->
    <div class="card-sartorial p-3 mb-4">
      <div class="row g-2 align-items-center">
        <div class="col-md-7">
          <div class="input-group">
            <span class="input-group-text bg-transparent text-gold border-secondary"><i class="bi bi-search"></i></span>
            <input
              v-model="busqueda"
              type="text"
              class="form-control"
              placeholder="Buscar por nombre, apellido, CI/NIT, teléfono o correo..."
              @input="onSearchInput"
            />
          </div>
        </div>
        <div class="col-md-5 d-flex justify-content-md-end align-items-center gap-3">
          <div class="d-flex align-items-center gap-2">
            <label class="text-secondary small mb-0 font-display">Por pág:</label>
            <select v-model="limit" class="form-select form-select-sm" style="width: 75px;" @change="cambiarLimit">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
          <div class="form-check form-switch mb-0">
            <input class="form-check-input" type="checkbox" id="checkClientesInactivos" v-model="verInactivos" @change="cargarClientes(1)" />
            <label class="form-check-label text-secondary small ms-2" for="checkClientesInactivos">
              Mostrar dados de baja
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th>Cliente</th>
                <th class="text-nowrap-cell">CI / NIT</th>
                <th class="text-nowrap-cell">Teléfono</th>
                <th>Correo Electrónico</th>
                <th class="text-nowrap-cell">Talla / Ficha</th>
                <th>Dirección</th>
                <th class="cell-actions text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="cargando">
                <td colspan="7" class="text-center py-4 text-secondary">
                  <div class="spinner-border text-gold spinner-border-sm me-2" role="status"></div>
                  Cargando cartera de clientes...
                </td>
              </tr>
              <tr v-else-if="clientes.length === 0">
                <td colspan="7" class="text-center py-5 text-secondary">
                  <i class="bi bi-person-x fs-2 d-block mb-2"></i>
                  No se encontraron clientes registrados con el criterio de búsqueda.
                </td>
              </tr>
              <tr v-for="c in clientes" :key="c.id">
                <td>
                  <div class="fw-bold text-white">{{ c.nombre }} {{ c.apellido }}</div>
                  <small class="text-secondary">
                    Registrado: {{ formatDate(c.fechaCreacion) }}
                    <span v-if="c.usuarioId" class="badge bg-dark border border-gold text-gold ms-1" style="font-size: 0.65rem;">
                      <i class="bi bi-person-check"></i> Usuario Web
                    </span>
                  </small>
                </td>
                <td class="text-gold fw-bold text-nowrap-cell cell-nit">{{ c.ciNit || 'S/N' }}</td>
                <td class="text-nowrap-cell">{{ c.telefono || 'Sin teléfono' }}</td>
                <td class="small">{{ c.correo || 'Sin correo' }}</td>
                <td class="text-nowrap-cell cell-badge">
                  <div class="d-flex align-items-center gap-1">
                    <span class="badge-talla">{{ c.preferenciaTalla || 'General' }}</span>
                    <button
                      class="btn btn-sm p-1"
                      :class="c.medidas && c.medidas.length > 0 ? 'text-gold' : 'text-secondary'"
                      title="Ficha Antropométrica de Medidas"
                      @click="abrirMedidas(c)"
                    >
                      <i class="bi bi-rulers fs-6"></i>
                    </button>
                  </div>
                </td>
                <td class="small text-secondary">{{ c.direccion || 'Sin dirección' }}</td>
                <td class="cell-actions text-end">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" @click="abrirMedidas(c)" title="Ficha de Sastrería & Medidas">
                      <i class="bi bi-rulers"></i>
                    </button>
                    <template v-if="c.fechaEliminacion">
                      <span class="badge bg-danger me-2">Dado de baja</span>
                      <button class="btn btn-sm btn-outline-success" @click="restaurar(c)" title="Restaurar Cliente">
                        <i class="bi bi-arrow-counterclockwise"></i> Restaurar
                      </button>
                    </template>
                    <template v-else>
                      <button class="btn btn-sm btn-outline-gold" @click="abrirEditar(c)" title="Editar Perfil"><i class="bi bi-pencil"></i></button>
                      <button v-if="c.ciNit !== '0'" class="btn btn-sm btn-outline-danger" @click="eliminar(c)" title="Eliminar Cliente"><i class="bi bi-trash"></i></button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Paginador Profesional -->
      <div class="card-footer bg-transparent border-secondary p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <small class="text-secondary font-display">
          Mostrando página <span class="text-gold fw-bold">{{ page }}</span> de <span class="text-white">{{ totalPages }}</span>
          (Total: <span class="text-gold fw-bold">{{ totalClientes }}</span> clientes registrados)
        </small>
        <div class="btn-group">
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page <= 1 || cargando"
            @click="cargarClientes(page - 1)"
          >
            <i class="bi bi-chevron-left me-1"></i> Anterior
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="btn btn-sm"
            :class="p === page ? 'btn-gold' : 'btn-outline-secondary'"
            @click="cargarClientes(p)"
          >
            {{ p }}
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page >= totalPages || cargando"
            @click="cargarClientes(page + 1)"
          >
            Siguiente <i class="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Formulario Cliente -->
    <div v-if="modalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">{{ modoEdicion ? 'Editar Cliente' : 'Registrar Cliente' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="modalOpen = false"></button>
          </div>
          <form @submit.prevent="guardar">
            <div class="modal-body p-4">
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Nombre *</label>
                  <input v-model="form.nombre" type="text" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label">Apellido *</label>
                  <input v-model="form.apellido" type="text" class="form-control" required />
                </div>
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Cédula de Identidad o NIT</label>
                  <input v-model="form.ciNit" type="text" class="form-control" />
                </div>
                <div class="col-6">
                  <label class="form-label">Teléfono Móvil (WhatsApp)</label>
                  <input v-model="form.telefono" type="text" class="form-control" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Correo Electrónico</label>
                <input v-model="form.correo" type="email" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Preferencia de Talla (Traje / Pantalón / Calzado)</label>
                <input v-model="form.preferenciaTalla" type="text" class="form-control" placeholder="Ej. Traje 40R / Pantalón 32 / Calzado 42" />
              </div>
              <div class="mb-3">
                <label class="form-label">Dirección de Envío Habitual</label>
                <input v-model="form.direccion" type="text" class="form-control" />
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-secondary" @click="modalOpen = false">Cancelar</button>
              <button type="submit" class="btn btn-gold" :disabled="guardando">
                <i class="bi bi-check2-circle me-1"></i> Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Ficha de Medidas de Sastrería (MedidaCliente) -->
    <div v-if="modalMedidasOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <div>
              <h5 class="modal-title font-display text-gold mb-0">
                <i class="bi bi-rulers me-2"></i> Ficha Antropométrica de Sastrería
              </h5>
              <small class="text-secondary font-display">
                Cliente: <strong class="text-white">{{ clienteSeleccionado?.nombre }} {{ clienteSeleccionado?.apellido }}</strong>
                (CI: {{ clienteSeleccionado?.ciNit || 'S/N' }})
              </small>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="modalMedidasOpen = false"></button>
          </div>

          <div class="modal-body p-4">
            <!-- Tabs o Conmutador: Ver Medidas Actuales / Registrar Nuevas -->
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
              <div class="small text-secondary font-display text-uppercase">
                {{ formularioMedidas ? 'Registrar o Modificar Medidas' : 'Medidas Registradas del Cliente' }}
              </div>
              <button
                class="btn btn-sm"
                :class="formularioMedidas ? 'btn-outline-secondary' : 'btn-outline-gold'"
                @click="formularioMedidas = !formularioMedidas"
              >
                <i class="bi" :class="formularioMedidas ? 'bi-eye' : 'bi-plus-circle'"></i>
                {{ formularioMedidas ? 'Ver Ficha Actual' : 'Nueva Toma de Medidas' }}
              </button>
            </div>

            <!-- Vista 1: Resumen de Medidas Registradas -->
            <div v-if="!formularioMedidas">
              <div v-if="medidasHistorial.length === 0" class="text-center py-4 text-secondary">
                <i class="bi bi-tape fs-1 text-gold d-block mb-2"></i>
                Este cliente aún no cuenta con una ficha de medidas antropométricas registrada.<br />
                <button class="btn btn-sm btn-gold mt-3" @click="formularioMedidas = true">
                  <i class="bi bi-plus-lg me-1"></i> Registrar Primera Ficha de Sastrería
                </button>
              </div>

              <div v-else>
                <!-- Tarjeta de Ficha Vigente -->
                <div class="card-sartorial p-3 mb-3 border-warning" style="background: rgba(212,175,55,0.04);">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="badge bg-gold text-dark font-display px-2 py-1">
                      <i class="bi bi-check-circle-fill me-1"></i> Ficha Activa (Toma: {{ formatDate(medidaActual.fechaMedicion) }})
                    </span>
                    <span class="badge bg-dark border border-secondary text-info">
                      Corte: {{ medidaActual.ajustePreferido || 'Tailored Fit' }}
                    </span>
                  </div>

                  <!-- Grid de las 9 Medidas Clave -->
                  <div class="row g-2 text-center mb-3">
                    <div class="col-4 col-md-3">
                      <div class="p-2 rounded bg-dark border border-secondary">
                        <small class="text-secondary d-block" style="font-size: 0.7rem;">PECHO</small>
                        <span class="fw-bold text-gold fs-5">{{ medidaActual.pecho }}</span> <small class="text-muted">cm</small>
                      </div>
                    </div>
                    <div class="col-4 col-md-3">
                      <div class="p-2 rounded bg-dark border border-secondary">
                        <small class="text-secondary d-block" style="font-size: 0.7rem;">CINTURA</small>
                        <span class="fw-bold text-gold fs-5">{{ medidaActual.cintura }}</span> <small class="text-muted">cm</small>
                      </div>
                    </div>
                    <div class="col-4 col-md-3">
                      <div class="p-2 rounded bg-dark border border-secondary">
                        <small class="text-secondary d-block" style="font-size: 0.7rem;">CADERA</small>
                        <span class="fw-bold text-gold fs-5">{{ medidaActual.cadera }}</span> <small class="text-muted">cm</small>
                      </div>
                    </div>
                    <div class="col-4 col-md-3">
                      <div class="p-2 rounded bg-dark border border-secondary">
                        <small class="text-secondary d-block" style="font-size: 0.7rem;">HOMBRO A HOMBRO</small>
                        <span class="fw-bold text-gold fs-5">{{ medidaActual.hombroAHombro }}</span> <small class="text-muted">cm</small>
                      </div>
                    </div>
                    <div class="col-4 col-md-3">
                      <div class="p-2 rounded bg-dark border border-secondary">
                        <small class="text-secondary d-block" style="font-size: 0.7rem;">LARGO DE MANGA</small>
                        <span class="fw-bold text-gold fs-5">{{ medidaActual.largoManga }}</span> <small class="text-muted">cm</small>
                      </div>
                    </div>
                    <div class="col-4 col-md-3">
                      <div class="p-2 rounded bg-dark border border-secondary">
                        <small class="text-secondary d-block" style="font-size: 0.7rem;">CUELLO</small>
                        <span class="fw-bold text-gold fs-5">{{ medidaActual.cuello }}</span> <small class="text-muted">cm</small>
                      </div>
                    </div>
                    <div class="col-4 col-md-3">
                      <div class="p-2 rounded bg-dark border border-secondary">
                        <small class="text-secondary d-block" style="font-size: 0.7rem;">TIRO PANTALÓN</small>
                        <span class="fw-bold text-gold fs-5">{{ medidaActual.tiroPantalon }}</span> <small class="text-muted">cm</small>
                      </div>
                    </div>
                    <div class="col-4 col-md-3">
                      <div class="p-2 rounded bg-dark border border-secondary">
                        <small class="text-secondary d-block" style="font-size: 0.7rem;">ENTREPIERNA</small>
                        <span class="fw-bold text-gold fs-5">{{ medidaActual.largoEntrepierna }}</span> <small class="text-muted">cm</small>
                      </div>
                    </div>
                    <div class="col-4 col-md-3">
                      <div class="p-2 rounded bg-dark border border-secondary">
                        <small class="text-secondary d-block" style="font-size: 0.7rem;">BASTAS</small>
                        <span class="fw-bold text-gold fs-5">{{ medidaActual.bastas }}</span> <small class="text-muted">cm</small>
                      </div>
                    </div>
                  </div>

                  <div class="small text-secondary mb-1">
                    <strong class="text-white">Observaciones de Sastrería:</strong>
                    {{ medidaActual.observaciones || 'Sin especificaciones anatómicas adicionales.' }}
                  </div>
                  <div class="small text-muted">
                    Sastre: {{ medidaActual.sastre || 'Maestro Sastre Sartorial' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Vista 2: Formulario de Toma de Medidas -->
            <form v-else @submit.prevent="guardarMedidas">
              <div class="row g-3 mb-3">
                <div class="col-6 col-md-4">
                  <label class="form-label small">Pecho (cm) *</label>
                  <input v-model.number="medidaForm.pecho" type="number" step="0.5" class="form-control" placeholder="Ej. 102.5" required />
                </div>
                <div class="col-6 col-md-4">
                  <label class="form-label small">Cintura (cm) *</label>
                  <input v-model.number="medidaForm.cintura" type="number" step="0.5" class="form-control" placeholder="Ej. 86.0" required />
                </div>
                <div class="col-6 col-md-4">
                  <label class="form-label small">Cadera (cm) *</label>
                  <input v-model.number="medidaForm.cadera" type="number" step="0.5" class="form-control" placeholder="Ej. 98.0" required />
                </div>

                <div class="col-6 col-md-4">
                  <label class="form-label small">Hombro a Hombro (cm) *</label>
                  <input v-model.number="medidaForm.hombroAHombro" type="number" step="0.5" class="form-control" placeholder="Ej. 46.5" required />
                </div>
                <div class="col-6 col-md-4">
                  <label class="form-label small">Largo de Manga (cm) *</label>
                  <input v-model.number="medidaForm.largoManga" type="number" step="0.5" class="form-control" placeholder="Ej. 64.0" required />
                </div>
                <div class="col-6 col-md-4">
                  <label class="form-label small">Cuello (cm) *</label>
                  <input v-model.number="medidaForm.cuello" type="number" step="0.5" class="form-control" placeholder="Ej. 40.5" required />
                </div>

                <div class="col-6 col-md-4">
                  <label class="form-label small">Tiro de Pantalón (cm) *</label>
                  <input v-model.number="medidaForm.tiroPantalon" type="number" step="0.5" class="form-control" placeholder="Ej. 27.0" required />
                </div>
                <div class="col-6 col-md-4">
                  <label class="form-label small">Largo Entrepierna (cm) *</label>
                  <input v-model.number="medidaForm.largoEntrepierna" type="number" step="0.5" class="form-control" placeholder="Ej. 81.5" required />
                </div>
                <div class="col-6 col-md-4">
                  <label class="form-label small">Bastas (cm) *</label>
                  <input v-model.number="medidaForm.bastas" type="number" step="0.5" class="form-control" placeholder="Ej. 19.5" required />
                </div>

                <div class="col-6">
                  <label class="form-label small">Corte / Ajuste Preferido</label>
                  <select v-model="medidaForm.ajustePreferido" class="form-select">
                    <option value="Slim Fit">Slim Fit (Entallado Moderno)</option>
                    <option value="Tailored Fit">Tailored Fit (Ajuste a la Medida)</option>
                    <option value="Classic Fit">Classic Fit (Corte Clásico Holgado)</option>
                    <option value="Modern Fit">Modern Fit (Corte Semiformal)</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label small">Maestro Sastre / Asesor</label>
                  <input v-model="medidaForm.sastre" type="text" class="form-control" placeholder="Ej. Maestro Sastre V. Hugo" />
                </div>

                <div class="col-12">
                  <label class="form-label small">Observaciones Antropométricas</label>
                  <textarea v-model="medidaForm.observaciones" class="form-control" rows="2" placeholder="Ej. Caída de hombro derecho, basta italiana con dobladillo de 4cm..."></textarea>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="formularioMedidas = false">Cancelar</button>
                <button type="submit" class="btn btn-gold" :disabled="guardandoMedidas">
                  <i class="bi bi-save me-1"></i> Guardar Ficha de Medidas
                </button>
              </div>
            </form>
          </div>
          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-secondary" @click="modalMedidasOpen = false">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/plugins/axios'
import { formatDate } from '@/helpers'
import Swal from 'sweetalert2'

const clientes = ref<any[]>([])
const busqueda = ref('')
const verInactivos = ref(false)
const cargando = ref(false)

// Paginación
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const totalClientes = ref(0)

// Modal Form Cliente
const modalOpen = ref(false)
const modoEdicion = ref(false)
const editId = ref<number | null>(null)
const guardando = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  ciNit: '',
  telefono: '',
  correo: '',
  preferenciaTalla: '',
  direccion: '',
})

// Modal Ficha de Medidas
const modalMedidasOpen = ref(false)
const clienteSeleccionado = ref<any>(null)
const medidasHistorial = ref<any[]>([])
const medidaActual = ref<any>({})
const formularioMedidas = ref(false)
const guardandoMedidas = ref(false)

const medidaForm = ref({
  pecho: 100,
  cintura: 85,
  cadera: 98,
  hombroAHombro: 46,
  largoManga: 64,
  cuello: 40,
  tiroPantalon: 27,
  largoEntrepierna: 82,
  bastas: 19.5,
  ajustePreferido: 'Tailored Fit',
  observaciones: '',
  sastre: 'Maestro Sastre Sartorial',
})

const cargarClientes = async (nuevaPagina = 1) => {
  cargando.value = true
  page.value = nuevaPagina
  try {
    const res = await http.get('clientes', {
      params: {
        page: page.value,
        limit: limit.value,
        search: busqueda.value || undefined,
        conInactivos: verInactivos.value ? 'true' : undefined,
      },
    })
    if (res.data && res.data.data) {
      clientes.value = res.data.data
      totalClientes.value = res.data.total
      totalPages.value = res.data.totalPages || 1
    } else {
      clientes.value = Array.isArray(res.data) ? res.data : []
      totalClientes.value = clientes.value.length
      totalPages.value = 1
    }
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

let debounceTimer: any = null
const onSearchInput = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    cargarClientes(1)
  }, 350)
}

const cambiarLimit = () => {
  cargarClientes(1)
}

const abrirCrear = () => {
  modoEdicion.value = false
  editId.value = null
  form.value = {
    nombre: '',
    apellido: '',
    ciNit: '',
    telefono: '',
    correo: '',
    preferenciaTalla: '',
    direccion: '',
  }
  modalOpen.value = true
}

const abrirEditar = (c: any) => {
  modoEdicion.value = true
  editId.value = c.id
  form.value = {
    nombre: c.nombre,
    apellido: c.apellido,
    ciNit: c.ciNit || '',
    telefono: c.telefono || '',
    correo: c.correo || '',
    preferenciaTalla: c.preferenciaTalla || '',
    direccion: c.direccion || '',
  }
  modalOpen.value = true
}

const guardar = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value && editId.value) {
      await http.patch(`clientes/${editId.value}`, form.value)
      Swal.fire({ icon: 'success', title: 'Cliente Actualizado', timer: 1500, showConfirmButton: false })
    } else {
      await http.post('clientes', form.value)
      Swal.fire({ icon: 'success', title: 'Cliente Creado', timer: 1500, showConfirmButton: false })
    }
    modalOpen.value = false
    cargarClientes(page.value)
  } catch (err: any) {
    Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al guardar cliente' })
  } finally {
    guardando.value = false
  }
}

const eliminar = async (c: any) => {
  const result = await Swal.fire({
    title: '¿Dar de baja cliente?',
    text: `El cliente ${c.nombre} ${c.apellido} no podrá operar activamente pero se preservará su historial de ventas.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, dar de baja',
    cancelButtonText: 'Cancelar',
  })
  if (result.isConfirmed) {
    try {
      await http.delete(`clientes/${c.id}`)
      Swal.fire('Dado de baja', 'Cliente desactivado con éxito.', 'success')
      cargarClientes(page.value)
    } catch (e: any) {
      Swal.fire('Error', e.response?.data?.message || 'Error al dar de baja', 'error')
    }
  }
}

const restaurar = async (c: any) => {
  try {
    await http.patch(`clientes/${c.id}/restaurar`)
    Swal.fire('Restaurado', 'Cliente rehabilitado exitosamente.', 'success')
    cargarClientes(page.value)
  } catch (e: any) {
    Swal.fire('Error', e.response?.data?.message || 'Error al restaurar', 'error')
  }
}

// LÓGICA DE MEDIDAS DE SASTRERÍA
const abrirMedidas = async (c: any) => {
  clienteSeleccionado.value = c
  formularioMedidas.value = false
  modalMedidasOpen.value = true

  try {
    const res = await http.get(`medidas-cliente/cliente/${c.id}`)
    medidasHistorial.value = res.data || []
    if (medidasHistorial.value.length > 0) {
      medidaActual.value = medidasHistorial.value[0]
      medidaForm.value = {
        pecho: Number(medidaActual.value.pecho) || 100,
        cintura: Number(medidaActual.value.cintura) || 85,
        cadera: Number(medidaActual.value.cadera) || 98,
        hombroAHombro: Number(medidaActual.value.hombroAHombro) || 46,
        largoManga: Number(medidaActual.value.largoManga) || 64,
        cuello: Number(medidaActual.value.cuello) || 40,
        tiroPantalon: Number(medidaActual.value.tiroPantalon) || 27,
        largoEntrepierna: Number(medidaActual.value.largoEntrepierna) || 82,
        bastas: Number(medidaActual.value.bastas) || 19.5,
        ajustePreferido: medidaActual.value.ajustePreferido || 'Tailored Fit',
        observaciones: medidaActual.value.observaciones || '',
        sastre: medidaActual.value.sastre || 'Maestro Sastre Sartorial',
      }
    } else {
      medidaActual.value = {}
    }
  } catch (e) {
    console.error(e)
  }
}

const guardarMedidas = async () => {
  if (!clienteSeleccionado.value) return
  guardandoMedidas.value = true
  try {
    await http.post('medidas-cliente', {
      clienteId: clienteSeleccionado.value.id,
      ...medidaForm.value,
    })
    Swal.fire({
      icon: 'success',
      title: 'Ficha de Medidas Guardada',
      text: 'Las medidas de sastrería han sido registradas exitosamente.',
      timer: 1800,
      showConfirmButton: false,
    })
    formularioMedidas.value = false
    abrirMedidas(clienteSeleccionado.value)
    cargarClientes(page.value)
  } catch (err: any) {
    Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al guardar medidas' })
  } finally {
    guardandoMedidas.value = false
  }
}

onMounted(() => {
  cargarClientes(1)
})
</script>
