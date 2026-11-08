<template>
  <div class="roles-view">
    <div class="mb-4">
      <h2 class="font-serif fw-bold text-white mb-1">Roles & Permisos del Sistema</h2>
      <p class="text-secondary small mb-0 font-display">Definición de privilegios según segregación de funciones</p>
    </div>

    <div class="row g-4">
      <div v-for="r in roles" :key="r.id" class="col-md-4">
        <div class="card-sartorial p-4 h-100 border-secondary">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <span class="badge" :class="r.nombre === 'ADMIN' ? 'bg-gold' : r.nombre === 'VENDEDOR' ? 'bg-primary' : 'bg-info'">
              {{ r.nombre }}
            </span>
            <i class="bi bi-shield-check fs-4 text-gold"></i>
          </div>
          <h4 class="font-serif text-white mb-2">{{ r.nombre }}</h4>
          <p class="text-secondary small mb-4" style="line-height: 1.6;">
            {{ r.descripcion || 'Sin descripción' }}
          </p>
          <div class="pt-3 border-top border-secondary mt-auto">
            <small class="text-secondary d-block mb-1">Módulos permitidos:</small>
            <ul v-if="r.nombre === 'ADMIN'" class="small text-white ps-3 mb-0">
              <li>Control total de catálogos y almacén</li>
              <li>Reportes analíticos & Dashboard</li>
              <li>Apertura y Cierre global de Cajas</li>
              <li>Bitácora de Auditoría</li>
            </ul>
            <ul v-else-if="r.nombre === 'VENDEDOR'" class="small text-white ps-3 mb-0">
              <li>Punto de Venta POS de mostrador</li>
              <li>Apertura / Cierre de su propia caja</li>
              <li>Consulta de prendas, tallas y stock</li>
              <li>Registro ágil de nuevos clientes</li>
            </ul>
            <ul v-else class="small text-white ps-3 mb-0">
              <li>Exploración y compra en Tienda Online</li>
              <li>Historial de pedidos y compras</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/plugins/axios'

const roles = ref<any[]>([])

const cargarRoles = async () => {
  try {
    const res = await http.get('roles')
    roles.value = res.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  cargarRoles()
})
</script>
