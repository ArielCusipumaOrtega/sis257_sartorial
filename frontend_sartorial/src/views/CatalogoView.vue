<template>
  <div class="catalogo-wrapper min-vh-100" style="background: #070A0F; color: #F8FAFC;">
    <!-- Top Announcement Bar -->
    <div class="py-2 text-center text-gold" style="background: linear-gradient(90deg, #131A26 0%, #1F2937 50%, #131A26 100%); font-size: 0.8rem; letter-spacing: 2px; border-bottom: 1px solid rgba(212,175,55,0.2);">
      <i class="bi bi-gem me-2"></i> COLECCIÓN ETIQUETA & GALA 2026 — ENVÍO DE ALTA CONFECCIÓN CON PLANCHADO INCLUIDO
    </div>

    <!-- Luxury Navbar -->
    <header class="navbar navbar-expand-lg sticky-top" style="background: rgba(11, 15, 23, 0.95); backdrop-filter: blur(14px); border-bottom: 1px solid var(--border-color);">
      <div class="container-xl">
        <router-link to="/" class="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <i class="bi bi-suit-heart-fill text-gold fs-4"></i>
          <div>
            <div class="font-display fw-bold text-gold tracking-wide" style="font-size: 1.25rem; letter-spacing: 2.5px;">SARTORIAL PRESTIGE</div>
            <div class="text-secondary" style="font-size: 0.65rem; letter-spacing: 3px; font-weight: 600;">HAUTE COUTURE & BOUTIQUE</div>
          </div>
        </router-link>

        <div class="d-flex align-items-center gap-3 ms-auto order-lg-last">
          <!-- Botón Carrito -->
          <button class="btn btn-outline-gold position-relative px-3 py-2 d-flex align-items-center gap-2" @click="carritoOpen = true">
            <i class="bi bi-bag-check-fill fs-5"></i>
            <span class="d-none d-sm-inline">Bolsa</span>
            <span v-if="carrito.length > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {{ totalPrendasCarrito }}
            </span>
          </button>

          <!-- Auth Links -->
          <div v-if="authStore.isLoggedIn" class="dropdown">
            <button class="btn btn-navy dropdown-toggle d-flex align-items-center gap-2 py-2" data-bs-toggle="dropdown">
              <i class="bi bi-person-check-fill text-gold"></i>
              <span class="d-none d-sm-inline">{{ authStore.user?.nombre }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow" style="background: #131A26; border: 1px solid var(--border-color);">
              <li v-if="authStore.isAdmin"><router-link to="/admin/dashboard" class="dropdown-item text-gold py-2"><i class="bi bi-speedometer2 me-2"></i> Panel Administrador</router-link></li>
              <li v-if="authStore.isVendedor"><router-link to="/vendedor/dashboard" class="dropdown-item text-gold py-2"><i class="bi bi-cart-plus me-2"></i> Panel Vendedor POS</router-link></li>
              <li><a href="#" class="dropdown-item text-danger py-2" @click.prevent="logout"><i class="bi bi-box-arrow-right me-2"></i> Salir</a></li>
            </ul>
          </div>
          <div v-else class="d-flex gap-2">
            <router-link to="/login" class="btn btn-sm btn-outline-gold">Ingresar</router-link>
            <router-link to="/register" class="btn btn-sm btn-gold d-none d-sm-inline-block">Registrarse</router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Banner Luxury -->
    <section class="position-relative overflow-hidden py-5 text-center" style="background: radial-gradient(circle at center, #1E293B 0%, #0B0F17 80%); border-bottom: 1px solid var(--border-color);">
      <div class="container py-4 position-relative z-1">
        <span class="badge px-3 py-2 mb-3 bg-dark border border-warning text-gold font-display" style="letter-spacing: 2px;">
          ALTA SASTRERÍA & CONFECCIÓN DE ÉLITE
        </span>
        <h1 class="display-4 font-serif fw-bold mb-3 text-white">
          La Elegancia Trascendente de la Sastrería Clásica
        </h1>
        <p class="lead text-secondary mx-auto mb-4" style="max-width: 720px; font-size: 1.05rem;">
          Descubra trajes de dos y tres piezas, blazers de terciopelo, pantalones de corte sastre, calzado artesanal cosido a mano y accesorios confeccionados con los tejidos más nobles de Europa.
        </p>
        <div class="d-flex justify-content-center gap-3">
          <a href="#catalogo-seccion" class="btn btn-gold btn-lg px-4 py-3 font-display" style="letter-spacing: 1.5px;">
            EXPLORAR COLECCIÓN
          </a>
          <router-link
            v-if="authStore.isAdmin || authStore.isVendedor"
            :to="rutaAdministracion"
            class="btn btn-outline-light btn-lg px-4 py-3 font-display"
            style="letter-spacing: 1.5px;"
          >
            ADMINISTRACIÓN
          </router-link>
        </div>
      </div>
    </section>

    <!-- Main Catalog Section -->
    <main id="catalogo-seccion" class="container-xl py-5">
      <!-- Filtros Superiores & Búsqueda -->
      <div class="card-sartorial p-4 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-lg-4 col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-transparent text-gold border-secondary"><i class="bi bi-search"></i></span>
              <input v-model="filtroBusqueda" type="text" class="form-control" placeholder="Buscar por prenda, tela, color, código..." />
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <select v-model="categoriaSeleccionada" class="form-select">
              <option :value="null">Todas las Categorías</option>
              <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
          </div>
          <div class="col-lg-3 col-md-6">
            <select v-model="marcaSeleccionada" class="form-select">
              <option :value="null">Todas las Firmas / Marcas</option>
              <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
            </select>
          </div>
          <div class="col-lg-2 col-md-6">
            <select v-model="ordenPrecios" class="form-select">
              <option value="defecto">Relevancia</option>
              <option value="menor">Precio: Menor a Mayor</option>
              <option value="mayor">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        <!-- Tags de Categorías Rápidas -->
        <div class="d-flex flex-wrap gap-2 mt-3 pt-3 border-top border-secondary">
          <button
            class="btn btn-sm"
            :class="categoriaSeleccionada === null && soloCombos === false ? 'btn-gold' : 'btn-outline-secondary text-white'"
            @click="categoriaSeleccionada = null; soloCombos = false"
          >
            Todos
          </button>
          <button
            class="btn btn-sm"
            :class="soloCombos ? 'btn-gold' : 'btn-outline-secondary text-white'"
            @click="soloCombos = !soloCombos; categoriaSeleccionada = null"
          >
            <i class="bi bi-collection-fill me-1"></i> Outfits & Looks Completos
          </button>
          <button
            v-for="c in categorias"
            :key="c.id"
            class="btn btn-sm"
            :class="categoriaSeleccionada === c.id && !soloCombos ? 'btn-gold' : 'btn-outline-secondary text-white'"
            @click="categoriaSeleccionada = c.id; soloCombos = false"
          >
            {{ c.nombre }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="cargando" class="text-center py-5">
        <div class="spinner-border text-gold mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
        <p class="text-secondary font-display">Cargando colección exclusiva...</p>
      </div>

      <!-- Grid de Productos -->
      <div v-else-if="prendasFiltradas.length > 0" class="row g-4">
        <div v-for="p in prendasFiltradas" :key="p.id" class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="card-sartorial h-100 d-flex flex-column position-relative group-hover">
            <!-- Badge de Descuento o Outfit -->
            <div class="position-absolute top-0 start-0 m-3 z-2 d-flex flex-column gap-1">
              <span v-if="p.esCombo" class="badge bg-gold px-2 py-1 font-display">
                <i class="bi bi-stars me-1"></i> LOOK COMPLETO
              </span>
              <span v-else-if="p.descuentoPorcentaje > 0" class="badge bg-danger px-2 py-1 font-display">
                -{{ p.descuentoPorcentaje }}% OFF
              </span>
            </div>

            <!-- Imagen de la Prenda -->
            <div class="ratio ratio-4x3 overflow-hidden" style="background: #111827; cursor: pointer;" @click="abrirDetalle(p)">
              <img
                :src="getImageUrl(p.imagen)"
                :alt="p.nombre"
                class="img-fluid object-fit-cover transition-transform"
                style="transition: transform 0.4s ease;"
              />
            </div>

            <!-- Info Prenda -->
            <div class="card-sartorial-body p-3 d-flex flex-column flex-grow-1">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-gold fw-bold text-uppercase" style="font-size: 0.72rem; letter-spacing: 1px;">
                  {{ p.marca?.nombre || 'Sartorial Collection' }}
                </small>
                <span class="badge-talla">{{ p.talla }}</span>
              </div>

              <h6 class="fw-bold mb-2 text-white font-serif text-truncate-2" style="font-size: 0.95rem; min-height: 2.8rem; cursor: pointer;" @click="abrirDetalle(p)">
                {{ p.nombre }}
              </h6>

              <div class="d-flex flex-wrap gap-1 mb-3">
                <span v-if="p.corte" class="badge-corte">{{ p.corte }}</span>
                <span v-if="p.color" class="badge bg-dark border border-secondary text-secondary" style="font-size: 0.7rem;">{{ p.color }}</span>
              </div>

              <div class="mt-auto pt-2 border-top border-secondary d-flex justify-content-between align-items-center">
                <div>
                  <div v-if="p.descuentoPorcentaje > 0" class="text-decoration-line-through text-secondary" style="font-size: 0.8rem;">
                    {{ formatPrice(p.precioVenta) }}
                  </div>
                  <div class="fw-bold text-gold fs-5">
                    {{ formatPrice(p.precioFinal || p.precioVenta) }}
                  </div>
                </div>

                <button class="btn btn-sm btn-gold d-flex align-items-center gap-1" @click="agregarAlCarrito(p)">
                  <i class="bi bi-bag-plus"></i> Añadir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="text-center py-5 card-sartorial p-5">
        <i class="bi bi-search text-secondary display-4 mb-3"></i>
        <h4 class="font-serif text-white">No se encontraron prendas</h4>
        <p class="text-secondary">Intente ajustando los filtros de categoría, firma o términos de búsqueda.</p>
        <button class="btn btn-outline-gold mt-2" @click="resetFiltros">Restablecer Filtros</button>
      </div>
    </main>

    <!-- Modal Detalle de Prenda -->
    <div v-if="prendaModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">{{ prendaModal.nombre }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="prendaModal = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row g-4">
              <div class="col-md-5">
                <div class="ratio ratio-1x1 rounded overflow-hidden border border-secondary">
                  <img :src="getImageUrl(prendaModal.imagen)" :alt="prendaModal.nombre" class="img-fluid object-fit-cover" />
                </div>
              </div>
              <div class="col-md-7 d-flex flex-column">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span class="badge bg-gold px-2 py-1">{{ prendaModal.marca?.nombre }}</span>
                  <span class="badge bg-secondary px-2 py-1">{{ prendaModal.categoria?.nombre }}</span>
                  <span class="badge-talla">Talla: {{ prendaModal.talla }}</span>
                </div>

                <div class="mb-3">
                  <div v-if="prendaModal.descuentoPorcentaje > 0" class="text-decoration-line-through text-secondary">
                    {{ formatPrice(prendaModal.precioVenta) }}
                  </div>
                  <div class="display-6 fw-bold text-gold">
                    {{ formatPrice(prendaModal.precioFinal || prendaModal.precioVenta) }}
                  </div>
                </div>

                <p class="text-secondary mb-3" style="font-size: 0.9rem; line-height: 1.6;">
                  {{ prendaModal.descripcion || 'Confección de alta gama con costuras artesanales de precisión.' }}
                </p>

                <!-- Ficha Técnica de Sastrería -->
                <div class="p-3 rounded mb-3" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);">
                  <div class="row g-2" style="font-size: 0.85rem;">
                    <div class="col-6"><span class="text-secondary">Material / Tejido:</span> <strong class="text-white d-block">{{ prendaModal.material || 'Lana Virgen' }}</strong></div>
                    <div class="col-6"><span class="text-secondary">Corte / Fit:</span> <strong class="text-white d-block">{{ prendaModal.corte || 'Classic Fit' }}</strong></div>
                    <div class="col-6"><span class="text-secondary">Color:</span> <strong class="text-white d-block">{{ prendaModal.color || 'Negro' }}</strong></div>
                    <div class="col-6"><span class="text-secondary">Código SKU:</span> <strong class="text-white d-block">{{ prendaModal.codigo }}</strong></div>
                  </div>
                </div>

                <div class="mt-auto d-flex gap-2">
                  <button class="btn btn-gold flex-grow-1 py-2 font-display" @click="agregarAlCarrito(prendaModal); prendaModal = null">
                    <i class="bi bi-bag-plus me-1"></i> AÑADIR A LA BOLSA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Offcanvas Carrito de Compras -->
    <div class="offcanvas offcanvas-end text-white" :class="{ show: carritoOpen }" style="background: #0B0F17; border-left: 1px solid var(--border-color); visibility: visible; width: 420px;" v-if="carritoOpen">
      <div class="offcanvas-header border-bottom border-secondary p-3">
        <h5 class="offcanvas-title font-display text-gold"><i class="bi bi-bag-check-fill me-2"></i> Mi Bolsa de Compras</h5>
        <button type="button" class="btn-close btn-close-white" @click="carritoOpen = false"></button>
      </div>

      <div class="offcanvas-body p-3 d-flex flex-column">
        <div v-if="carrito.length === 0" class="text-center py-5 my-auto">
          <i class="bi bi-bag-x display-3 text-secondary mb-3"></i>
          <h5 class="font-serif">Su bolsa está vacía</h5>
          <p class="text-secondary small">Descubra trajes, blazers y calzado en nuestro catálogo exclusivo.</p>
        </div>

        <div v-else class="flex-grow-1 overflow-y-auto">
          <div v-for="item in carrito" :key="item.id" class="p-3 mb-2 rounded d-flex gap-3 align-items-center" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);">
            <img :src="getImageUrl(item.imagen)" class="rounded object-fit-cover" style="width: 60px; height: 60px;" />
            <div class="flex-grow-1">
              <div class="fw-bold small text-white text-truncate" style="max-width: 180px;">{{ item.nombre }}</div>
              <small class="text-gold">{{ formatPrice(item.precioFinal || item.precioVenta) }}</small>
              <div class="d-flex align-items-center gap-2 mt-2">
                <button class="btn btn-sm btn-outline-secondary py-0 px-2 text-white" @click="modificarCantidad(item, -1)">-</button>
                <span class="small fw-bold">{{ item.cantidad }}</span>
                <button class="btn btn-sm btn-outline-secondary py-0 px-2 text-white" @click="modificarCantidad(item, 1)">+</button>
                <button class="btn btn-sm btn-outline-danger ms-auto py-0 px-2" @click="quitarDelCarrito(item)"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="carrito.length > 0" class="pt-3 border-top border-secondary mt-auto">
          <div class="d-flex justify-content-between mb-2">
            <span class="text-secondary">Subtotal Prendas:</span>
            <span class="fw-bold">{{ formatPrice(subtotalCarrito) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-3">
            <span class="text-secondary">Planchado & Embalaje de Gala:</span>
            <span class="text-success fw-bold">Gratis</span>
          </div>
          <div class="d-flex justify-content-between mb-4 fs-5">
            <span class="fw-bold font-serif">Total:</span>
            <span class="fw-bold text-gold">{{ formatPrice(subtotalCarrito) }}</span>
          </div>

          <button class="btn btn-gold w-100 py-3 font-display" style="letter-spacing: 1.5px;" @click="abrirCheckout">
            FINALIZAR COMPRA
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Checkout de Lujo -->
    <div v-if="checkoutOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">Confirmar Pedido de Sastrería</h5>
            <button type="button" class="btn-close btn-close-white" @click="checkoutOpen = false"></button>
          </div>
          <form @submit.prevent="procesarPedido">
            <div class="modal-body p-4">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label">Nombre Completo *</label>
                  <input v-model="checkoutForm.nombre" type="text" class="form-control" placeholder="Ej. Carlos Montenegro" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Cédula de Identidad o NIT *</label>
                  <input v-model="checkoutForm.ciNit" type="text" class="form-control" placeholder="Ej. 4928172" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono Móvil (WhatsApp) *</label>
                  <input v-model="checkoutForm.telefono" type="text" class="form-control" placeholder="Ej. 77123456" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tipo de Entrega *</label>
                  <select v-model="checkoutForm.tipoEntrega" class="form-select" required>
                    <option value="Tienda">Retiro en Boutique (Plaza 25 de Mayo #40)</option>
                    <option value="Delivery">Envío a Domicilio con Porta-traje Especial (+Bs. 15.00)</option>
                  </select>
                </div>
                <div v-if="checkoutForm.tipoEntrega === 'Delivery'" class="col-12">
                  <label class="form-label">Dirección de Entrega *</label>
                  <input v-model="checkoutForm.direccion" type="text" class="form-control" placeholder="Calle, Número, Edificio, Depto..." required />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Método de Pago *</label>
                <div class="row g-2">
                  <div class="col-4" v-for="m in metodosPago" :key="m.id">
                    <label class="p-3 rounded w-100 text-center d-block cursor-pointer border" :class="checkoutForm.metodoPagoId === m.id ? 'border-warning bg-dark' : 'border-secondary bg-transparent'">
                      <input type="radio" :value="m.id" v-model="checkoutForm.metodoPagoId" class="d-none" />
                      <div class="small fw-bold text-white">{{ m.nombre }}</div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Vista previa QR si seleccionó QR -->
              <div v-if="esMetodoQr" class="text-center p-3 mb-3 rounded" style="background: #111827; border: 1px dashed var(--primary);">
                <div class="text-gold small mb-2"><i class="bi bi-qr-code-scan me-1"></i> Escanee el código QR oficial de Sartorial Prestige:</div>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SartorialPrestige_Pago" alt="QR de Pago" class="img-fluid rounded border p-1 bg-white mb-2" style="width: 140px;" />
                <div class="text-secondary small">Banco Bisa — Sartorial Prestige S.R.L. Cta: 1029384756</div>
              </div>

              <!-- Resumen Total -->
              <div class="p-3 rounded d-flex justify-content-between align-items-center" style="background: rgba(212,175,55,0.1); border: 1px solid var(--primary);">
                <span class="font-serif fw-bold">Total a Pagar:</span>
                <span class="fs-4 fw-bold text-gold">{{ formatPrice(totalConDelivery) }}</span>
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-secondary" @click="checkoutOpen = false">Cancelar</button>
              <button type="submit" class="btn btn-gold px-4" :disabled="procesandoPedido">
                <i class="bi bi-check2-circle me-1"></i> {{ procesandoPedido ? 'Confirmando...' : 'Confirmar Pedido' }}
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
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const cargando = ref(true)
const prendas = ref<any[]>([])
const categorias = ref<any[]>([])
const marcas = ref<any[]>([])
const metodosPago = ref<any[]>([])

const filtroBusqueda = ref('')
const categoriaSeleccionada = ref<number | null>(null)
const marcaSeleccionada = ref<number | null>(null)
const soloCombos = ref(false)
const ordenPrecios = ref('defecto')

const prendaModal = ref<any | null>(null)
const carritoOpen = ref(false)
const checkoutOpen = ref(false)
const procesandoPedido = ref(false)

const rutaAdministracion = computed(() => {
  if (authStore.isAdmin) return '/admin/dashboard'
  if (authStore.isVendedor) return '/vendedor/dashboard'
  return '/login'
})

// Carrito
const carrito = ref<any[]>([])

const checkoutForm = ref({
  nombre: authStore.user ? `${authStore.user.nombre} ${authStore.user.apellido}` : '',
  ciNit: '',
  telefono: '',
  tipoEntrega: 'Tienda',
  direccion: '',
  metodoPagoId: 1,
})

const totalPrendasCarrito = computed(() => {
  return carrito.value.reduce((acc, item) => acc + item.cantidad, 0)
})

const subtotalCarrito = computed(() => {
  return carrito.value.reduce((acc, item) => {
    const p = item.precioFinal || item.precioVenta
    return acc + Number(p) * item.cantidad
  }, 0)
})

const totalConDelivery = computed(() => {
  const delivery = checkoutForm.value.tipoEntrega === 'Delivery' ? 15.0 : 0
  return subtotalCarrito.value + delivery
})

const esMetodoQr = computed(() => {
  const m = metodosPago.value.find((x) => x.id === checkoutForm.value.metodoPagoId)
  return m && (m.nombre.toLowerCase().includes('qr') || m.nombre.toLowerCase().includes('transfer'))
})

const cargarDatos = async () => {
  cargando.value = true
  try {
    const [pRes, cRes, mRes, mpRes] = await Promise.all([
      http.get('productos'),
      http.get('categorias'),
      http.get('marcas'),
      http.get('metodos-pago'),
    ])
    prendas.value = pRes.data
    categorias.value = cRes.data
    marcas.value = mRes.data
    metodosPago.value = mpRes.data
    if (metodosPago.value.length > 0) {
      checkoutForm.value.metodoPagoId = metodosPago.value[0].id
    }
  } catch (err) {
    console.error('Error al cargar catálogo:', err)
  } finally {
    cargando.value = false
  }
}

const prendasFiltradas = computed(() => {
  let list = [...prendas.value]

  if (soloCombos.value) {
    list = list.filter((p) => p.esCombo)
  }
  if (categoriaSeleccionada.value) {
    list = list.filter((p) => p.categoriaId === categoriaSeleccionada.value)
  }
  if (marcaSeleccionada.value) {
    list = list.filter((p) => p.marcaId === marcaSeleccionada.value)
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

  if (ordenPrecios.value === 'menor') {
    list.sort((a, b) => (a.precioFinal || a.precioVenta) - (b.precioFinal || b.precioVenta))
  } else if (ordenPrecios.value === 'mayor') {
    list.sort((a, b) => (b.precioFinal || b.precioVenta) - (a.precioFinal || a.precioVenta))
  }

  return list
})

const resetFiltros = () => {
  filtroBusqueda.value = ''
  categoriaSeleccionada.value = null
  marcaSeleccionada.value = null
  soloCombos.value = false
  ordenPrecios.value = 'defecto'
}

const abrirDetalle = (p: any) => {
  prendaModal.value = p
}

const agregarAlCarrito = (p: any) => {
  const item = carrito.value.find((i) => i.id === p.id)
  if (item) {
    item.cantidad++
  } else {
    carrito.value.push({ ...p, cantidad: 1 })
  }
  carritoOpen.value = true
}

const modificarCantidad = (item: any, delta: number) => {
  item.cantidad += delta
  if (item.cantidad <= 0) {
    quitarDelCarrito(item)
  }
}

const quitarDelCarrito = (item: any) => {
  carrito.value = carrito.value.filter((i) => i.id !== item.id)
}

const abrirCheckout = () => {
  carritoOpen.value = false
  checkoutOpen.value = true
}

const procesarPedido = async () => {
  procesandoPedido.value = true
  try {
    const payload = {
      tipoEntrega: checkoutForm.value.tipoEntrega,
      direccion: checkoutForm.value.tipoEntrega === 'Delivery' ? checkoutForm.value.direccion : 'Retiro en Boutique',
      telefonoContacto: checkoutForm.value.telefono,
      costoDelivery: checkoutForm.value.tipoEntrega === 'Delivery' ? 15.0 : 0,
      detalles: carrito.value.map((i) => ({
        productoId: i.id,
        cantidad: i.cantidad,
        precio: i.precioFinal || i.precioVenta,
        talla: i.talla,
        color: i.color,
      })),
      pagos: [
        {
          metodoPagoId: checkoutForm.value.metodoPagoId,
          monto: totalConDelivery.value,
          referencia: `ONLINE-${Date.now().toString().slice(-6)}`,
        },
      ],
    }

    const res = await http.post('ventas', payload)
    checkoutOpen.value = false
    carrito.value = []

    Swal.fire({
      icon: 'success',
      title: '¡Pedido Confirmado con Éxito!',
      html: `
        <p class="text-white">Muchas gracias por su preferencia.</p>
        <div class="p-3 my-2 rounded bg-dark border border-warning text-gold font-display">
          Comprobante: <strong>${res.data.codigoComprobante}</strong>
        </div>
        <p class="small text-secondary">Su prenda está siendo preparada y planchada al vapor en nuestro taller.</p>
      `,
      background: '#131A26',
      color: '#F8FAFC',
      confirmButtonColor: '#D4AF37',
    })
    // Recargar existencias
    cargarDatos()
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al procesar pedido',
      text: err.response?.data?.message || 'Ocurrió un error al registrar la venta.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    procesandoPedido.value = false
  }
}

const logout = () => {
  authStore.logout()
}

onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.group-hover:hover img {
  transform: scale(1.05);
}
</style>
