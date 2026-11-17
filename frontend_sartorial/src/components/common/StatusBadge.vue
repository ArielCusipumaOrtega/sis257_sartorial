<template>
  <span class="badge d-inline-flex align-items-center gap-1 font-display" :class="badgeClass" :style="badgeStyle">
    <i v-if="badgeIcon" :class="badgeIcon"></i>
    <span>{{ labelText }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status?: string | boolean | null
  type?: 'venta' | 'delivery' | 'caja' | 'general'
}>()

const statusNormalized = computed(() => {
  if (typeof props.status === 'boolean') {
    return props.status ? 'Activo' : 'Inactivo'
  }
  return (props.status || 'Pendiente').toString().trim()
})

const labelText = computed(() => statusNormalized.value)

const badgeClass = computed(() => {
  const s = statusNormalized.value.toLowerCase()
  if (s.includes('confirmad') || s.includes('entregad') || s === 'activo' || s === 'abierta') {
    return 'bg-success text-white'
  }
  if (s.includes('cancelad') || s === 'inactivo' || s.includes('baja') || s.includes('agotad')) {
    return 'bg-danger text-white'
  }
  if (s.includes('camino') || s.includes('delivery')) {
    return 'bg-info text-dark'
  }
  if (s.includes('preparaci') || s.includes('planchado') || s.includes('taller')) {
    return 'bg-primary text-white'
  }
  if (s.includes('pendiente') || s.includes('espera')) {
    return 'bg-warning text-dark'
  }
  if (s.includes('cerrad')) {
    return 'bg-dark border border-secondary text-secondary'
  }
  return 'bg-dark border border-secondary text-light'
})

const badgeIcon = computed(() => {
  const s = statusNormalized.value.toLowerCase()
  if (s.includes('confirmad') || s.includes('entregad') || s === 'activo') return 'bi bi-check2-circle'
  if (s.includes('cancelad') || s === 'inactivo' || s.includes('baja')) return 'bi bi-x-circle'
  if (s.includes('camino')) return 'bi bi-truck'
  if (s.includes('preparaci')) return 'bi bi-magic'
  if (s.includes('pendiente')) return 'bi bi-clock-history'
  if (s === 'abierta') return 'bi bi-unlock-fill'
  if (s === 'cerrada') return 'bi bi-lock-fill'
  return ''
})

const badgeStyle = computed(() => {
  return 'font-size: 0.78rem; padding: 0.35em 0.65em; letter-spacing: 0.5px;'
})
</script>
