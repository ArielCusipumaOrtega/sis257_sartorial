<template>
  <div class="configuracion-view">
    <div class="mb-4">
      <h2 class="font-serif fw-bold text-white mb-1">Configuración General de la Boutique</h2>
      <p class="text-secondary small mb-0 font-display">Parámetros corporativos, fiscales y de atención al cliente</p>
    </div>

    <div class="row g-4">
      <div class="col-12 col-lg-8">
        <div class="card-sartorial p-4">
          <form @submit.prevent="guardarConfig">
            <h5 class="font-serif text-gold mb-3"><i class="bi bi-shop me-2"></i> Identidad Comercial & Fiscal</h5>

            <div class="row g-3 mb-3">
              <div class="col-md-7">
                <label class="form-label">Nombre Comercial de la Boutique</label>
                <input v-model="config.nombre" type="text" class="form-control" />
              </div>
              <div class="col-md-5">
                <label class="form-label">NIT / Registro Fiscal</label>
                <input v-model="config.nit" type="text" class="form-control" />
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label">Teléfono de Atención al Cliente</label>
                <input v-model="config.telefono" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Correo Oficial de la Boutique</label>
                <input v-model="config.correo" type="email" class="form-control" />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Dirección Principal (Tienda Física)</label>
              <input v-model="config.direccion" type="text" class="form-control" />
            </div>

            <hr class="border-secondary my-4" />

            <h5 class="font-serif text-gold mb-3"><i class="bi bi-currency-dollar me-2"></i> Moneda & Envíos</h5>
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label">Moneda Principal</label>
                <input v-model="config.moneda" type="text" class="form-control" disabled />
              </div>
              <div class="col-md-6">
                <label class="form-label">Costo Estándar de Envío con Portatrajes (Bs.)</label>
                <input v-model.number="config.costoDelivery" type="number" step="0.5" class="form-control" />
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label">Políticas de Cambio & Garantía</label>
              <textarea v-model="config.politicas" class="form-control" rows="3"></textarea>
            </div>

            <button type="submit" class="btn btn-gold px-4 font-display">
              <i class="bi bi-check2-circle me-1"></i> GUARDAR CONFIGURACIÓN
            </button>
          </form>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <div class="card-sartorial p-4 h-100">
          <h5 class="font-serif text-gold mb-3"><i class="bi bi-info-circle me-2"></i> Información del Sistema</h5>
          <div class="small text-secondary mb-3">
            <strong class="text-white d-block mb-1">Ecosistema Boutique:</strong>
            Sartorial Prestige &bull; Suite Comercial de Confección & POS
          </div>
          <div class="small text-secondary mb-3">
            <strong class="text-white d-block mb-1">Arquitectura:</strong>
            NestJS 11 + TypeORM (Backend) &bull; Vue 3 + Vite + TypeScript (Frontend) &bull; PostgreSQL
          </div>
          <div class="small text-secondary mb-3">
            <strong class="text-white d-block mb-1">Versión del Sistema:</strong>
            v1.0.0 — Sartorial Prestige Monorepo
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Swal from 'sweetalert2'

const config = ref({
  nombre: 'Sartorial Prestige Boutique S.R.L.',
  nit: '1029384756',
  telefono: '+591 4 6451234 / 77123456',
  correo: 'contacto@sartorialprestige.com',
  direccion: 'Plaza 25 de Mayo #40, Sucre - Bolivia',
  moneda: 'Bolivianos (Bs.)',
  costoDelivery: 15.0,
  politicas: 'Cambios de prenda aceptados dentro de los 7 días naturales posteriores a la compra, presentando el ticket de venta y conservando las etiquetas intactas.',
})

const guardarConfig = () => {
  localStorage.setItem('sartorial_config', JSON.stringify(config.value))
  Swal.fire({
    icon: 'success',
    title: 'Ajustes Guardados',
    text: 'La configuración de la boutique se ha actualizado correctamente.',
    background: '#131A26',
    color: '#F8FAFC',
    timer: 1600,
    showConfirmButton: false,
  })
}
</script>
