<template>
  <div class="auditoria-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Bitácora de Auditoría del Sistema</h2>
        <p class="text-secondary small mb-0 font-display">Trazabilidad estricta e inalterable de operaciones críticas</p>
      </div>
      <button class="btn btn-outline-secondary text-white" @click="cargarLogs">
        <i class="bi bi-arrow-clockwise me-1"></i> Actualizar Bitácora
      </button>
    </div>

    <!-- Filtros -->
    <div class="card-sartorial p-3 mb-4">
      <div class="row g-3">
        <div class="col-md-5">
          <input v-model="filtroTabla" type="text" class="form-control" placeholder="Filtrar por tabla (clientes, ventas, productos...)" @input="cargarLogs" />
        </div>
        <div class="col-md-4">
          <select v-model="filtroAccion" class="form-select" @change="cargarLogs">
            <option value="">Todas las Acciones</option>
            <option value="CREAR">CREAR</option>
            <option value="EDITAR">EDITAR</option>
            <option value="ELIMINAR">ELIMINAR</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla de Logs -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Usuario Ejecutor</th>
                <th>Acción</th>
                <th>Tabla Afectada</th>
                <th>ID Registro</th>
                <th>Detalle de Mutación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id">
                <td class="small text-secondary">{{ formatDate(log.fecha) }}</td>
                <td class="fw-bold text-white">{{ log.usuarioNombre }}</td>
                <td>
                  <span class="badge" :class="log.accion === 'CREAR' ? 'bg-success' : log.accion === 'EDITAR' ? 'bg-warning text-dark' : 'bg-danger'">
                    {{ log.accion }}
                  </span>
                </td>
                <td class="text-gold fw-bold small">{{ log.tabla }}</td>
                <td>{{ log.registroId || '-' }}</td>
                <td>
                  <code class="small text-secondary" style="font-size: 0.75rem; word-break: break-all;">
                    {{ log.detalle ? log.detalle.slice(0, 120) + (log.detalle.length > 120 ? '...' : '') : '-' }}
                  </code>
                </td>
              </tr>
              <tr v-if="logs.length === 0">
                <td colspan="6" class="text-center text-secondary py-5">No hay registros de auditoría</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/plugins/axios'
import { formatDate } from '@/helpers'

const logs = ref<any[]>([])
const filtroTabla = ref('')
const filtroAccion = ref('')

const cargarLogs = async () => {
  try {
    let url = 'auditoria?limit=100'
    if (filtroTabla.value) url += `&tabla=${filtroTabla.value}`
    if (filtroAccion.value) url += `&accion=${filtroAccion.value}`
    const res = await http.get(url)
    logs.value = res.data.items || res.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  cargarLogs()
})
</script>
