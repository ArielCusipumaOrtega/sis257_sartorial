<template>
  <div class="d-flex min-vh-100" style="background: var(--bg-dark); overflow-x: hidden;">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ show: sidebarOpen }">
      <div class="sidebar-brand">
        <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
          <i class="bi bi-gem text-gold" style="font-size: 1.3rem;"></i>
          <h4 class="mb-0">SARTORIAL</h4>
        </div>
        <small class="text-gold" style="font-weight: 700;">PRESTIGE BOUTIQUE</small>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">Principal</div>
        <router-link to="/admin/dashboard" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-speedometer2"></i> Dashboard Ejecutivo
        </router-link>

        <div class="nav-section-title">Catálogo Sastrería</div>
        <router-link to="/admin/productos" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-suit-heart-fill"></i> Prendas & Calzado
        </router-link>
        <router-link to="/admin/combos" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-collection-fill"></i> Outfits & Looks
        </router-link>
        <router-link to="/admin/categorias" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-tags-fill"></i> Categorías
        </router-link>
        <router-link to="/admin/marcas" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-award-fill"></i> Marcas & Firmas
        </router-link>
        <router-link to="/admin/promociones" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-percent"></i> Promociones
        </router-link>

        <div class="nav-section-title">Comercial & Caja</div>
        <router-link to="/admin/ventas/nueva" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-cart-plus-fill"></i> Punto de Venta (POS)
        </router-link>
        <router-link to="/admin/ventas" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-receipt"></i> Ventas & Facturación
        </router-link>
        <router-link to="/admin/caja" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-cash-stack"></i> Apertura / Cierre Caja
        </router-link>
        <router-link to="/admin/delivery" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-box2-heart-fill"></i> Envíos & Planchado
        </router-link>
        <router-link to="/admin/pagos" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-credit-card-fill"></i> Control de Pagos
        </router-link>

        <div class="nav-section-title">Almacén & Proveedores</div>
        <router-link to="/admin/compras" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-truck"></i> Compras & Lotes
        </router-link>
        <router-link to="/admin/proveedores" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-building"></i> Proveedores Textiles
        </router-link>
        <router-link to="/admin/clientes" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-people-fill"></i> Clientes Exclusivos
        </router-link>

        <div class="nav-section-title">Inteligencia & Seguridad</div>
        <router-link to="/admin/reportes" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-bar-chart-line-fill"></i> Reportes & Métricas
        </router-link>
        <router-link to="/admin/auditoria" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-journal-check"></i> Bitácora de Auditoría
        </router-link>
        <router-link to="/admin/usuarios" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-person-badge-fill"></i> Usuarios del Sistema
        </router-link>
        <router-link to="/admin/roles" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-shield-lock-fill"></i> Roles & Permisos
        </router-link>
        <router-link to="/admin/configuracion" class="nav-link" @click="sidebarOpen = false">
          <i class="bi bi-gear-fill"></i> Configuración Boutique
        </router-link>
      </nav>
    </aside>

    <!-- Backdrop móvil para cerrar sidebar al hacer clic fuera -->
    <div
      v-if="sidebarOpen"
      class="sidebar-backdrop d-lg-none"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Wrapper -->
    <div class="main-wrapper flex-grow-1">
      <header class="top-navbar">
        <button class="btn btn-outline-secondary d-lg-none border-0" @click="sidebarOpen = !sidebarOpen">
          <i class="bi bi-list fs-4 text-white"></i>
        </button>

        <div class="d-flex align-items-center gap-2 gap-sm-3">
          <router-link to="/" class="btn btn-outline-gold btn-sm d-flex align-items-center gap-2 position-relative" title="Ir a la Tienda / Catálogo">
            <i class="bi bi-shop"></i>
            <span>Catálogo</span>
            <span v-if="cartStore.totalItems > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem;">
              {{ cartStore.totalItems }}
            </span>
          </router-link>

          <router-link to="/admin/ventas/nueva" class="btn btn-gold btn-sm d-none d-sm-flex align-items-center gap-2">
            <i class="bi bi-cart-plus"></i> Abrir POS
          </router-link>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="text-end d-none d-md-block">
            <div class="fw-bold text-white fs-6">{{ authStore.fullName }}</div>
            <small class="badge bg-gold px-2 py-1">ADMINISTRADOR</small>
          </div>
          <div class="dropdown">
            <button class="btn btn-navy rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;" data-bs-toggle="dropdown">
              <i class="bi bi-person-fill text-gold fs-5"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow" style="background: var(--bg-card); border: 1px solid var(--border-color);">
              <li><router-link to="/admin/perfil" class="dropdown-item text-white py-2"><i class="bi bi-person me-2"></i> Mi Perfil</router-link></li>
              <li><router-link to="/admin/configuracion" class="dropdown-item text-white py-2"><i class="bi bi-gear me-2"></i> Ajustes</router-link></li>
              <li><hr class="dropdown-divider border-secondary" /></li>
              <li><a href="#" class="dropdown-item text-danger py-2" @click.prevent="logout"><i class="bi bi-box-arrow-right me-2"></i> Cerrar Sesión</a></li>
            </ul>
          </div>
        </div>
      </header>

      <main class="p-2 p-sm-3 p-md-4 flex-grow-1">
        <router-view />
      </main>

      <footer class="p-3 text-center border-top border-secondary text-secondary" style="font-size: 0.8rem; background: var(--bg-card);">
        &copy; 2026 Sartorial Prestige Boutique &bull; Confección Formal, Sastrería a Medida & Alta Costura
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()
const sidebarOpen = ref(false)

const logout = () => {
  authStore.logout()
}
</script>
