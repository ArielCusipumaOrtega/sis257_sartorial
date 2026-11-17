<template>
  <div
    v-if="modelValue"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(4, 7, 13, 0.88); backdrop-filter: blur(8px); z-index: 1060;"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" style="max-width: 960px;">
      <div class="modal-content border-secondary shadow-lg" style="background: #0D131F; color: #F8FAFC;">
        <!-- Header -->
        <div class="modal-header border-secondary p-3 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <div class="p-2 rounded-circle bg-dark border border-warning text-gold d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
              <i class="bi bi-stars fs-5"></i>
            </div>
            <div>
              <h5 class="modal-title font-serif text-white mb-0">Asesor de Estilo</h5>
              <small class="text-secondary font-display" style="font-size: 0.72rem; letter-spacing: 1px;">
                CONCIERGE DE ETIQUETA & ALTA CONFECCIÓN
              </small>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-dark border border-warning text-gold font-display d-none d-sm-inline-block" style="font-size: 0.7rem;">
              <i class="bi bi-cpu-fill me-1"></i> Gemini 3.8 Flash Lite
            </span>
            <button type="button" class="btn-close btn-close-white" @click="cerrar"></button>
          </div>
        </div>

        <!-- Body -->
        <div class="modal-body p-4">
          <!-- Entrada de Consulta -->
          <div class="card-sartorial p-3 mb-4">
            <label class="form-label text-gold font-display small mb-2 d-flex align-items-center gap-1">
              <i class="bi bi-chat-quote-fill"></i> Describa su ocasión, evento o código de vestimenta:
            </label>
            <div class="input-group mb-2">
              <textarea
                v-model="consulta"
                class="form-control"
                rows="2"
                placeholder="Ejemplo: Tengo una boda de gala en jardín a las 18:00, clima templado, código cóctel formal..."
                :disabled="consultando"
                @keydown.ctrl.enter="enviarConsulta"
              ></textarea>
              <button
                class="btn btn-gold px-4 d-flex align-items-center gap-2"
                :disabled="consultando || !consulta.trim()"
                @click="enviarConsulta"
              >
                <span v-if="consultando" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-magic"></i>
                <span class="d-none d-sm-inline">{{ consultando ? 'Analizando...' : 'Asesorar' }}</span>
              </button>
            </div>

            <!-- Chips de Atajos de Ocasión -->
            <div class="d-flex flex-wrap gap-1 align-items-center mt-2">
              <small class="text-secondary me-1" style="font-size: 0.72rem;">Sugerencias rápidas:</small>
              <button
                v-for="s in sugerencias"
                :key="s"
                type="button"
                class="btn btn-sm py-0 px-2 rounded-pill border border-secondary text-secondary bg-transparent hover-gold"
                style="font-size: 0.72rem;"
                :disabled="consultando"
                @click="consulta = s; enviarConsulta()"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <!-- Spinner Animado de Análisis -->
          <div v-if="consultando" class="text-center py-5">
            <div class="spinner-grow text-gold mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
            <h5 class="font-serif text-white">Consultando el protocolo de etiqueta...</h5>
            <p class="text-secondary small font-display">
              El Asesor de Estilo está analizando tejidos, cortes y colores de la colección para componer su look ideal.
            </p>
          </div>

          <!-- Mensaje de Error si ocurre -->
          <div v-else-if="errorMensaje" class="alert alert-danger bg-dark border-danger text-danger p-3 mb-3">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMensaje }}
          </div>

          <!-- Resultados del Asesor de Estilo -->
          <div v-else-if="resultado" class="resultado-asesor">
            <!-- Saludo & Análisis Protocolar -->
            <div class="p-3 rounded mb-3" style="background: rgba(212,175,55,0.06); border-left: 4px solid var(--primary); border-top: 1px solid rgba(212,175,55,0.2); border-right: 1px solid rgba(212,175,55,0.2); border-bottom: 1px solid rgba(212,175,55,0.2);">
              <h6 class="font-serif text-gold mb-1">{{ resultado.saludo }}</h6>
              <p class="text-white small mb-0" style="line-height: 1.6;">
                {{ resultado.analisisProtocolo }}
              </p>
            </div>

            <!-- Prendas Recomendadas -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="font-display text-gold small">
                  <i class="bi bi-gem me-1"></i> Prenda(s) Seleccionada(s) del Catálogo Real ({{ resultado.prendasRecomendadas.length }})
                </span>
                <span class="badge bg-secondary font-display" style="font-size: 0.7rem;">
                  Total Outfit: {{ formatPrice(resultado.totalOutfit) }}
                </span>
              </div>

              <div class="row g-3">
                <div
                  v-for="p in resultado.prendasRecomendadas"
                  :key="p.id"
                  class="col-12 col-md-6"
                >
                  <div class="card-sartorial p-3 h-100 d-flex flex-column border-secondary" style="background: rgba(19, 26, 38, 0.85);">
                    <div class="d-flex gap-3 align-items-start">
                      <!-- Imagen Prenda -->
                      <div class="ratio ratio-1x1 rounded overflow-hidden flex-shrink-0 border border-secondary" style="width: 85px; height: 85px; background: #111827;">
                        <img :src="getImageUrl(p.imagen)" :alt="p.nombre" class="img-fluid object-fit-cover" />
                      </div>

                      <!-- Contenido Prenda -->
                      <div class="flex-grow-1 min-w-0">
                        <!-- Marca y Código -->
                        <div class="text-gold fw-bold text-uppercase mb-1" style="font-size: 0.72rem; letter-spacing: 0.5px; word-break: break-word;">
                          {{ p.marca || 'Sartorial Collection' }} · <span class="text-secondary">{{ p.codigo }}</span>
                        </div>

                        <!-- Nombre Completo de la Prenda -->
                        <h6 class="text-white font-serif mb-2 fw-bold" style="font-size: 0.92rem; line-height: 1.35; word-break: break-word;" :title="p.nombre">
                          {{ p.nombre }}
                        </h6>

                        <!-- Precios y Talla (sin cortes) -->
                        <div class="d-flex flex-wrap align-items-center gap-2">
                          <span class="fs-6 fw-bold text-gold">{{ formatPrice(p.precio) }}</span>
                          <span class="badge bg-dark border border-warning text-gold font-sans px-2 py-1" style="font-size: 0.7rem; white-space: normal; line-height: 1.2;">
                            <i class="bi bi-tag-fill me-1"></i> Talla: {{ p.talla }}
                          </span>
                          <span v-if="p.color" class="badge bg-dark border border-secondary text-secondary" style="font-size: 0.68rem;">
                            {{ p.color }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Motivo de la IA -->
                    <div class="mt-3 pt-2 border-top border-secondary text-secondary" style="font-size: 0.78rem; line-height: 1.45;">
                      <i class="bi bi-info-circle text-gold me-1"></i>
                      <span>{{ p.motivo }}</span>
                    </div>

                    <!-- Botón Individual de Añadir -->
                    <div class="mt-auto pt-2 text-end">
                      <button
                        class="btn btn-sm btn-outline-gold px-3 py-1 d-inline-flex align-items-center gap-1 font-display"
                        style="font-size: 0.75rem;"
                        @click="agregarPrenda(p)"
                      >
                        <i class="bi bi-bag-plus"></i> Añadir prenda
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Consejo de Accesorios & Etiqueta -->
            <div v-if="resultado.consejoAccesorios" class="p-3 rounded mb-3" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);">
              <div class="text-gold small font-display mb-1">
                <i class="bi bi-lightbulb-fill text-warning me-1"></i> Consejo Maestro de Accesorios & Postura:
              </div>
              <p class="text-secondary small mb-0" style="line-height: 1.5;">
                {{ resultado.consejoAccesorios }}
              </p>
            </div>

            <!-- Barra Inferior de Acción: Añadir Look Completo -->
            <div class="p-3 rounded d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2" style="background: linear-gradient(90deg, rgba(212,175,55,0.15) 0%, rgba(30,58,138,0.2) 100%); border: 1px solid var(--primary);">
              <div>
                <div class="small text-secondary font-display">Outfit Completo Armonizado:</div>
                <div class="fs-5 fw-bold text-gold">{{ formatPrice(resultado.totalOutfit) }}</div>
              </div>
              <button
                class="btn btn-gold btn-lg px-4 py-2 font-display d-flex align-items-center gap-2"
                style="letter-spacing: 1px;"
                @click="agregarLookCompleto"
              >
                <i class="bi bi-bag-check-fill fs-5"></i>
                <span>Añadir Look Completo a la Bolsa</span>
              </button>
            </div>
          </div>

          <!-- Estado Inicial sin consulta -->
          <div v-else class="text-center py-4">
            <i class="bi bi-suit-heart text-secondary display-4 mb-3 d-block"></i>
            <h6 class="font-serif text-white">¿A qué evento o celebración asistirás?</h6>
            <p class="text-secondary small" style="max-width: 500px; margin: 0 auto;">
              Indica la ocasión, hora del día, lugar o código de etiqueta. Nuestro Asesor de Estilo con Inteligencia Artificial te seleccionará el atuendo perfecto de la colección.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer border-secondary p-2 d-flex justify-content-between">
          <small class="text-secondary" style="font-size: 0.7rem;">
            <i class="bi bi-shield-check text-success me-1"></i> Prendas verificadas con inventario real en base de datos.
          </small>
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="cerrar">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import http from '@/plugins/axios'
import { getImageUrl, formatPrice } from '@/helpers'
import Swal from 'sweetalert2'

const props = defineProps<{
  modelValue: boolean
  clienteId?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'add-prenda', prenda: any): void
  (e: 'add-look', prendas: any[]): void
}>()

const consulta = ref('')
const consultando = ref(false)
const errorMensaje = ref('')
const resultado = ref<any | null>(null)

const sugerencias = [
  'Boda de gala en jardín a las 18:00 (Cóctel)',
  'Cena diplomática de etiqueta Black Tie',
  'Entrevista corporativa de alta dirección',
  'Graduación universitaria solemne',
  'Look Riviera de verano en lino puro',
]

const cerrar = () => {
  emit('update:modelValue', false)
}

const enviarConsulta = async () => {
  if (!consulta.value.trim() || consultando.value) return

  consultando.value = true
  errorMensaje.value = ''
  resultado.value = null

  try {
    const res = await http.post('asesor-estilo/recomendar', {
      mensaje: consulta.value.trim(),
      clienteId: props.clienteId || undefined,
    })
    resultado.value = res.data
  } catch (err: any) {
    console.error('Error al consultar Asesor de Estilo:', err)
    errorMensaje.value =
      err.response?.data?.message ||
      'No se pudo conectar con el Asesor de Estilo. Inténtelo nuevamente en unos instantes.'
  } finally {
    consultando.value = false
  }
}

const agregarPrenda = (prenda: any) => {
  emit('add-prenda', prenda)
  Swal.fire({
    icon: 'success',
    title: 'Prenda Añadida',
    text: `${prenda.nombre} fue agregada a su bolsa.`,
    timer: 1400,
    showConfirmButton: false,
    background: '#131A26',
    color: '#F8FAFC',
  })
}

const agregarLookCompleto = () => {
  if (!resultado.value?.prendasRecomendadas?.length) return

  emit('add-look', resultado.value.prendasRecomendadas)
  cerrar()
  Swal.fire({
    icon: 'success',
    title: '¡Look Completo Añadido!',
    text: `Se agregaron las ${resultado.value.prendasRecomendadas.length} prendas a la bolsa.`,
    timer: 1800,
    showConfirmButton: false,
    background: '#131A26',
    color: '#F8FAFC',
  })
}
</script>

<style scoped>
.hover-gold:hover {
  border-color: var(--primary) !important;
  color: var(--primary) !important;
}
</style>
