<template>
  <div v-if="stacked" class="price-tag-stacked d-inline-flex flex-column align-items-end" :class="containerClass">
    <small
      v-if="originalAmount && Number(originalAmount) > Number(amount)"
      class="text-decoration-line-through text-secondary"
      style="font-size: 0.72rem; line-height: 1.1;"
    >
      {{ currency }} {{ formatNum(originalAmount) }}
    </small>
    <div class="d-inline-flex align-items-baseline gap-1" style="line-height: 1.2;">
      <span class="currency-symbol small" :class="colorClass">{{ currency }}</span>
      <span class="amount-val fw-bold" :class="[colorClass, sizeClass]">{{ formatNum(amount) }}</span>
    </div>
    <span
      v-if="discount && discount > 0"
      class="badge bg-danger mt-1"
      style="font-size: 0.65rem; padding: 2px 6px; font-family: sans-serif;"
    >
      -{{ discount }}%
    </span>
  </div>

  <span v-else class="price-tag d-inline-flex align-items-baseline gap-1" :class="containerClass">
    <small v-if="originalAmount && Number(originalAmount) > Number(amount)" class="text-decoration-line-through text-secondary me-1" style="font-size: 0.8em;">
      {{ currency }} {{ formatNum(originalAmount) }}
    </small>
    <span class="currency-symbol small" :class="colorClass">{{ currency }}</span>
    <span class="amount-val fw-bold" :class="[colorClass, sizeClass]">{{ formatNum(amount) }}</span>
    <span v-if="discount && discount > 0" class="badge bg-danger ms-1" style="font-size: 0.68rem;">
      -{{ discount }}%
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    amount: number | string | null | undefined
    currency?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    color?: 'gold' | 'white' | 'success' | 'info' | 'muted'
    discount?: number
    originalAmount?: number | string | null
    stacked?: boolean
  }>(),
  {
    currency: 'Bs.',
    size: 'md',
    color: 'gold',
    stacked: false,
  },
)

const formatNum = (val: any) => {
  const n = Number(val) || 0
  return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const containerClass = computed(() => {
  return 'font-display'
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'fs-7'
    case 'lg':
      return 'fs-4'
    case 'xl':
      return 'fs-2'
    case 'md':
    default:
      return 'fs-6'
  }
})

const colorClass = computed(() => {
  switch (props.color) {
    case 'white':
      return 'text-white'
    case 'success':
      return 'text-success'
    case 'info':
      return 'text-info'
    case 'muted':
      return 'text-secondary'
    case 'gold':
    default:
      return 'text-gold'
  }
})
</script>
