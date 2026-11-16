<template>
  <div class="compras-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Compras & Abastecimiento</h2>
        <p class="text-secondary small mb-0 font-display">Ingreso de lotes de confección y pañería desde proveedores</p>
      </div>
      <router-link to="/admin/compras/nueva" class="btn btn-gold d-flex align-items-center gap-2">
        <i class="bi bi-bag-plus-fill"></i> Registrar Ingreso de Lote
      </router-link>
    </div>

    <!-- Tabla -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th class="text-nowrap-cell">ID</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Observaciones</th>
                <th>Registrado Por</th>
                <th class="text-nowrap-cell">Total Facturado</th>
                <th class="cell-actions text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in compras" :key="c.id">
                <td class="text-gold fw-bold text-nowrap-cell">#CMP-{{ c.id }}</td>
                <td>
                  <div class="fw-bold text-white">{{ c.proveedor?.nombre || 'Proveedor' }}</div>
                  <small class="text-secondary">NIT: {{ c.proveedor?.nit || 'S/N' }}</small>
                </td>
                <td class="small text-secondary">{{ formatDate(c.fecha) }}</td>
                <td class="small text-secondary">{{ c.observaciones || 'Ingreso de mercadería' }}</td>
                <td class="small text-white">{{ c.usuario ? `${c.usuario.nombre} ${c.usuario.apellido}` : 'Admin' }}</td>
                <td class="fw-bold text-nowrap-cell cell-price">
                  <PriceTag :amount="c.total" />
                </td>
                <td class="cell-actions text-end">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-gold" @click="verDetalle(c)">
                      <i class="bi bi-eye me-1"></i> Desglose
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="compras.length === 0">
                <td colspan="7" class="text-center text-secondary py-5">No hay compras registradas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Desglose -->
    <div v-if="compraSeleccionada" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">Lote de Compra #CMP-{{ compraSeleccionada.id }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="compraSeleccionada = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3 p-3 rounded" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
              <div class="row">
                <div class="col-md-6">
                  <span class="text-secondary small d-block">Proveedor:</span>
                  <strong class="text-white">{{ compraSeleccionada.proveedor?.nombre }}</strong>
                </div>
                <div class="col-md-6 text-md-end">
                  <span class="text-secondary small d-block">Fecha de Ingreso:</span>
                  <strong class="text-white">{{ formatDate(compraSeleccionada.fecha) }}</strong>
                </div>
              </div>
            </div>

            <h6 class="font-display text-gold mb-2">Prendas Ingresadas al Almacén:</h6>
            <div class="table-responsive mb-3">
              <table class="table-sartorial">
                <thead>
                  <tr>
                    <th>Prenda</th>
                    <th>Talla</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-end">Costo Unit.</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in compraSeleccionada.detalles" :key="d.id">
                    <td>
                      <div class="fw-bold text-white">{{ d.producto?.nombre }}</div>
                      <small class="text-secondary">{{ d.producto?.codigo }}</small>
                    </td>
                    <td><span class="badge-talla">{{ d.producto?.talla }}</span></td>
                    <td class="text-center fw-bold">{{ d.cantidad }}</td>
                    <td class="text-end">{{ formatPrice(d.precio) }}</td>
                    <td class="text-end fw-bold">
                      <PriceTag :amount="d.subtotal" size="sm" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="text-end pt-3 border-top border-secondary">
              <span class="text-secondary small">Total Factura Proveedor:</span>
              <div class="mt-1">
                <PriceTag :amount="compraSeleccionada.total" size="xl" />
              </div>
            </div>
          </div>
          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-outline-secondary" @click="compraSeleccionada = null">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/plugins/axios'
import { PriceTag } from '@/components/common'
import { formatPrice, formatDate } from '@/helpers'

const compras = ref<any[]>([])
const compraSeleccionada = ref<any | null>(null)

const cargarCompras = async () => {
  try {
    const res = await http.get('compras')
    compras.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const verDetalle = (c: any) => {
  compraSeleccionada.value = c
}

onMounted(() => {
  cargarCompras()
})
</script>
