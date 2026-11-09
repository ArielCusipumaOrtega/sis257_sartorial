<template>
  <div class="combos-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Outfits & Colecciones Completas</h2>
        <p class="text-secondary small mb-0 font-display">Conjuntos armados por asesores de estilo con descuento de paquete</p>
      </div>
      <button class="btn btn-gold d-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#createComboModal">
        <i class="bi bi-stars"></i> Crear Nuevo Outfit / Look
      </button>
    </div>

    <!-- Grid de Outfits -->
    <div class="row g-4">
      <div v-for="c in combos" :key="c.id" class="col-12 col-lg-6">
        <div class="card-sartorial p-4 h-100 d-flex flex-column border-warning">
          <div class="d-flex gap-3 mb-3">
            <img :src="getImageUrl(c.imagen)" class="rounded object-fit-cover" style="width: 100px; height: 100px; background: #111;" />
            <div class="flex-grow-1">
              <span class="badge bg-gold px-2 py-1 mb-1 font-display">OUTFIT COMPLETO</span>
              <h4 class="font-serif text-white mb-1">{{ c.nombre }}</h4>
              <small class="text-gold fw-bold">{{ c.codigo }}</small>
            </div>
            <div class="text-end">
              <small class="text-secondary d-block">Precio Look:</small>
              <div class="fs-4 fw-bold text-gold">{{ formatPrice(c.precioVenta) }}</div>
              <span class="badge bg-dark border border-secondary text-secondary">{{ c.stock }} disponibles</span>
            </div>
          </div>

          <p class="text-secondary small mb-3" style="line-height: 1.5;">
            {{ c.descripcion }}
          </p>

          <!-- Componentes del Look -->
          <div class="p-3 rounded mt-auto" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
            <h6 class="small font-display text-gold mb-2"><i class="bi bi-diagram-2 me-1"></i> Prendas Incluidas en el Conjunto:</h6>
            <div class="d-flex flex-column gap-1">
              <div v-for="item in c.items" :key="item.id" class="d-flex justify-content-between align-items-center small py-1 border-bottom border-secondary">
                <span class="text-white">
                  &bull; {{ item.producto?.nombre }}
                  <span class="badge-talla ms-1">{{ item.producto?.talla }}</span>
                </span>
                <span class="text-gold fw-bold">x{{ item.cantidad }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="combos.length === 0" class="col-12 text-center py-5 text-secondary">
        No hay outfits registrados actualmente
      </div>
    </div>

    <!-- Modal Crear Outfit -->
    <CreateComboModal @saved="cargarCombos" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/plugins/axios'
import { getImageUrl, formatPrice } from '@/helpers'
import CreateComboModal from '@/components/CreateComboModal.vue'

const combos = ref<any[]>([])

const cargarCombos = async () => {
  try {
    const res = await http.get('combos')
    combos.value = res.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  cargarCombos()
})
</script>
