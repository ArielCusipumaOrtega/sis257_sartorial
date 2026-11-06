<template>
  <div class="d-flex min-vh-100" style="background: var(--bg-dark);">
    <!-- Sidebar Vendedor -->
    <aside class="sidebar" :class="{ show: sidebarOpen }">
      <div class="sidebar-brand">
        <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
          <i class="bi bi-gem text-gold" style="font-size: 1.3rem;"></i>
          <h4 class="mb-0">SARTORIAL</h4>
        </div>
        <small class="text-gold" style="font-weight: 700;">ASESOR DE ESTILO (POS)</small>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">Terminal de Ventas</div>
        <router-link to="/vendedor/dashboard" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-speedometer2"></i> Mi Resumen Diario
        </router-link>
        <router-link to="/vendedor/ventas/nueva" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-cart-plus-fill"></i> Punto de Venta (POS)
        </router-link>
        <router-link to="/vendedor/ventas" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-receipt"></i> Historial de Ventas
        </router-link>
        <router-link to="/vendedor/caja" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-cash-stack"></i> Mi Caja de Turno
        </router-link>

        <div class="nav-section-title">Consultas Rápidas</div>
        <router-link to="/vendedor/productos" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-suit-heart"></i> Consulta de Prendas & Tallas
        </router-link>
        <router-link to="/vendedor/clientes" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-people"></i> Cartera de Clientes
        </router-link>
        <router-link to="/vendedor/delivery" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-box2-heart"></i> Despachos & Entregas
        </router-link>
        <router-link to="/vendedor/perfil" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-person-badge"></i> Mi Perfil
        </router-link>
      </nav>
    </aside>

    <!-- Main Wrapper -->
    <div class="main-wrapper flex-grow-1">
      <header class="top-navbar">
        <button class="btn btn-outline-secondary d-lg-none border-0" @click="sidebarOpen = !sidebarOpen">
          <i class="bi bi-list fs-4 text-white"></i>
        </button>

        <div class="d-flex align-items-center gap-3">
          <router-link to="/vendedor/ventas/nueva" class="btn btn-gold btn-sm d-flex align-items-center gap-2">
            <i class="bi bi-cart-plus-fill"></i> Nueva Venta (Caja)
          </router-link>
          <router-link to="/" class="btn btn-sm btn-outline-gold d-none d-sm-inline-flex align-items-center gap-2">
            <i class="bi bi-shop"></i> Catálogo
          </router-link>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="text-end d-none d-md-block">
            <div class="fw-bold text-white fs-6">{{ authStore.fullName }}</div>
            <small class="badge bg-secondary px-2 py-1">ASESOR / VENDEDOR</small>
          </div>
          <div class="dropdown">
            <button class="btn btn-navy rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;" data-bs-toggle="dropdown">
              <i class="bi bi-person-fill text-gold fs-5"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow" style="background: var(--bg-card); border: 1px solid var(--border-color);">
              <li><router-link to="/vendedor/perfil" class="dropdown-item text-white py-2"><i class="bi bi-person me-2"></i> Mi Perfil</router-link></li>
              <li><hr class="dropdown-divider border-secondary" /></li>
              <li><a href="#" class="dropdown-item text-danger py-2" @click.prevent="logout"><i class="bi bi-box-arrow-right me-2"></i> Cerrar Sesión</a></li>
            </ul>
          </div>
        </div>
      </header>

      <main class="p-4 flex-grow-1">
        <router-view />
      </main>

      <footer class="p-3 text-center border-top border-secondary text-secondary" style="font-size: 0.8rem; background: var(--bg-card);">
        &copy; 2026 Sartorial Prestige Boutique - Terminal de Asesor de Ventas & POS (SIS257)
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const sidebarOpen = ref(false)

const logout = () => {
  authStore.logout()
}
</script>
