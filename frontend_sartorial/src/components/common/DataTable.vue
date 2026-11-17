<template>
  <div class="sartorial-datatable">
    <!-- Barra Superior de Filtros y Búsqueda -->
    <div class="card-sartorial p-3 mb-4">
      <div class="row g-2 align-items-center">
        <!-- Buscador -->
        <div class="col-12 col-md-6 col-lg-5">
          <div class="input-group">
            <span class="input-group-text bg-transparent text-gold border-secondary"><i class="bi bi-search"></i></span>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="searchPlaceholder || 'Buscar registros...'"
              @input="onSearchInput"
            />
            <button v-if="searchTerm" class="btn btn-outline-secondary" @click="clearSearch">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Filtros Personalizados (Slot) -->
        <div class="col-12 col-md-6 col-lg-4">
          <slot name="filters"></slot>
        </div>

        <!-- Opciones Rápidas: Conmutador Inactivos, Selector de Límite y Botón Recargar -->
        <div class="col-12 col-lg-3 d-flex justify-content-lg-end align-items-center gap-2">
          <!-- Selector de Límite -->
          <select v-if="totalPages !== undefined" v-model="currentLimit" class="form-select form-select-sm" style="width: 75px;" @change="onLimitChange">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>

          <!-- Conmutador Eliminados -->
          <div v-if="showInactivosToggle" class="form-check form-switch mb-0 text-nowrap">
            <input class="form-check-input" type="checkbox" id="checkInactivos" v-model="inactivosChecked" @change="onInactivosChange" />
            <label class="form-check-label text-secondary small ms-1" for="checkInactivos">
              {{ inactivosLabel || 'Eliminados' }}
            </label>
          </div>

          <!-- Recargar -->
          <button class="btn btn-sm btn-outline-secondary text-white" title="Recargar lista" @click="$emit('refresh')">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Datos -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <slot name="thead"></slot>
            </thead>
            <tbody>
              <!-- Cargando -->
              <tr v-if="loading">
                <td colspan="12" class="text-center py-5 text-secondary">
                  <div class="spinner-border text-gold spinner-border-sm me-2" role="status"></div>
                  Cargando información...
                </td>
              </tr>

              <!-- Vacío -->
              <tr v-else-if="!items || items.length === 0">
                <td colspan="12" class="text-center py-5 text-secondary">
                  <slot name="empty">
                    <i class="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                    No se encontraron registros disponibles
                  </slot>
                </td>
              </tr>

              <!-- Filas de datos -->
              <template v-else>
                <slot v-for="(item, index) in items" :key="item.id || index" name="row" :item="item" :index="index"></slot>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pie de Tabla: Paginador -->
      <div v-if="totalPages !== undefined && totalPages > 0" class="card-footer bg-transparent border-secondary p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <small class="text-secondary font-display">
          Página <span class="text-gold fw-bold">{{ page }}</span> de <span class="text-white">{{ totalPages }}</span>
          <span v-if="totalItems !== undefined"> (Total: <span class="text-gold fw-bold">{{ totalItems }}</span> registros)</span>
        </small>
        <div class="btn-group">
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page <= 1 || loading"
            @click="onPageChange(page - 1)"
          >
            <i class="bi bi-chevron-left me-1"></i> Anterior
          </button>
          <button
            v-for="p in visiblePages"
            :key="p"
            class="btn btn-sm"
            :class="p === page ? 'btn-gold' : 'btn-outline-secondary'"
            @click="onPageChange(p)"
          >
            {{ p }}
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page >= totalPages || loading"
            @click="onPageChange(page + 1)"
          >
            Siguiente <i class="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    items: any[]
    loading?: boolean
    searchPlaceholder?: string
    page?: number
    totalPages?: number
    totalItems?: number
    limit?: number
    showInactivosToggle?: boolean
    inactivosLabel?: string
  }>(),
  {
    loading: false,
    page: 1,
    limit: 10,
    showInactivosToggle: false,
  },
)

const emit = defineEmits<{
  (e: 'search', term: string): void
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
  (e: 'inactivos-toggle', val: boolean): void
  (e: 'refresh'): void
}>()

const searchTerm = ref('')
const currentLimit = ref(props.limit)
const inactivosChecked = ref(false)

let debounceTimer: any = null
const onSearchInput = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', searchTerm.value)
  }, 350)
}

const clearSearch = () => {
  searchTerm.value = ''
  emit('search', '')
}

const onPageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= (props.totalPages || 1)) {
    emit('page-change', newPage)
  }
}

const onLimitChange = () => {
  emit('limit-change', currentLimit.value)
}

const onInactivosChange = () => {
  emit('inactivos-toggle', inactivosChecked.value)
}

// Calcular páginas visibles (máximo 5 botones alrededor de la página actual)
const visiblePages = computed(() => {
  const total = props.totalPages || 1
  const curr = props.page || 1
  const start = Math.max(1, curr - 2)
  const end = Math.min(total, start + 4)
  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})
</script>
