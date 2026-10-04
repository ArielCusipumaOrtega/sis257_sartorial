# Sartorial Prestige - Sistema de Gestión de Boutique de Alta Confección & Estilo Formal

### Plataforma Integral de Administración, Punto de Venta (POS) y E-commerce de Moda Formal Ya Confeccionada

[![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Vue](https://img.shields.io/badge/Vue.js-v3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-v5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

---

**Sartorial Prestige** es una solución de software empresarial monorepo diseñada específicamente para la administración, comercialización y control operativo de una **Boutique de ropa formal y semiformal ya confeccionada**. 

Abarca trajes completos de dos y tres piezas, esmóquines de gala, blazers desestructurados y de terciopelo, pantalones de vestir y chinos formales, camisas de etiqueta en algodón egipcio, calzado artesanal de cuero curtido (Oxford, Derby, Monkstrap, Loafers) y accesorios de alta distinción (corbatas de seda siete pliegues, moños/pajaritas, mancuernillas/gemelos de plata y tirantes de etiqueta).

---

## Tabla de Contenidos

- [Acerca del Proyecto](#acerca-del-proyecto)
- [Arquitectura de Software](#arquitectura-de-software)
- [Funcionalidades por Rol](#funcionalidades-por-rol)
- [Módulos Especializados de Boutique](#módulos-especializados-de-boutique)
- [Diseño y Tematización Dinámica](#diseño-y-tematización-dinámica)
- [Modelo de Datos y Relaciones (18 Tablas)](#modelo-de-datos-y-relaciones-18-tablas)
- [Estructura del Proyecto Monorepo](#estructura-del-proyecto-monorepo)
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución en Contenedores (Docker)](#ejecución-en-contenedores-docker)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [Información Académica](#información-académica)

---

## Acerca del Proyecto

La solución satisface los requerimientos de digitalización y excelencia operativa de boutiques de alta gama, abordando:

1. **Gestión de Prendas con Atributos de Sastrería**: Registro exhaustivo con tallas estándar de confección formal (36R, 38R, 40R, 42L, 44R; tallas de calzado 39 a 44), colores clásicos de etiqueta, tipos de paño/tejido (Lana Super 130s, Algodón Egipcio, Seda Italiana, Cuero Curtido) y cortes estilizados (*Slim Fit*, *Tailored Fit*, *Classic Fit*, *Modern Fit*).
2. **Punto de Venta Ágil para Tienda Física (POS)**: Búsqueda instantánea por código SKU/código de barras, selección ágil de cliente o consumidor final en mostrador, múltiples métodos de pago (Efectivo con cálculo automático de cambio, Tarjeta y QR) y emisión/impresión inmediata de recibo formal de etiqueta.
3. **Módulo de Apertura, Arqueo y Cierre de Caja**: Control estricto de dinero base en gaveta, ventas acumuladas por medio de cobro, conciliación de arqueo físico y registro automático de diferencias (sobrante o faltante).
4. **Catálogo E-commerce de Ultra-Lujo**: Experiencia de compra en línea para clientes con offcanvas interactivo de bolsa de compras, visualización técnica de paño/corte y checkout express con cálculo de portes.
5. **Control de Despachos con Planchado al Vapor**: Módulo de seguimiento de entregas a domicilio donde las prendas pasan por control de calidad, planchado vertical al vapor y embalaje en portatrajes impermeables antes de su envío.
6. **Bitácora de Auditoría Inalterable**: Auditoría automática de todas las mutaciones realizadas en las entidades críticas (Clientes, Ventas, Prendas, Cajas).

---

## Arquitectura de Software

El sistema implementa una arquitectura desacoplada y modular sobre una base de datos relacional robusta:

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente Frontend                     │
│    (Vue 3, Vite, Pinia, TypeScript, Bootstrap 5)        │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Solicitudes REST / JWT Bearer
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Servidor Backend                     │
│         (NestJS 11, TypeORM, Passport, Express)         │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Transacciones ACID / SQL
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   Base de Datos Relacional              │
│                 (PostgreSQL - 18 Tablas)                │
└─────────────────────────────────────────────────────────┘
```

---

## Funcionalidades por Rol

El sistema implementa un Control de Acceso Basado en Roles (**RBAC**) con guards en el backend (`RolesGuard`) y guards de navegación en Vue Router:

### Administrador (ADMIN)
- **Dashboard Ejecutivo**: Métricas en tiempo real de ingresos del día, facturación acumulada del mes, transacciones totales, clientes registrados y alertas de existencias bajas.
- **Gráficos Analíticos Interactivos**: Curva de ingresos mensuales y distribución porcentual del catálogo mediante Chart.js.
- **Gestión Integral de Catálogos**: Control CRUD de Prendas, Categorías de Vestir, Marcas/Firmas Internacionales y Proveedores Textiles.
- **Gestión de Outfits & Looks Completos**: Creación de colecciones combinadas (ej. Traje + Camisa + Moño + Mancuernillas + Calzado) a precio de paquete.
- **Abastecimiento & Compras**: Registro transaccional de compras a proveedores con incremento automático de existencias en almacén.
- **Supervisión de Cajas**: Historial completo de turnos y arqueos de caja de todos los asesores.
- **Centro de Promociones**: Parametrización de descuentos estacionales con porcentaje y rango de vigencia.
- **Bitácora de Auditoría**: Monitoreo inalterable de acciones de usuarios en el sistema.

### Asesor de Estilo / Vendedor (VENDEDOR)
- **Terminal de Ventas POS de Alta Velocidad**: Buscador reactivo por SKU/nombre, selección visual de prendas, carrito de venta en vivo y cálculo de subtotales.
- **Módulo de Turno de Caja**: Apertura con monto base, arqueo de dinero en efectivo y cierre de turno conciliado.
- **Registro Rápido de Clientes**: Alta inmediata de clientes en mostrador para registrar su cédula/NIT y preferencia de talla habitual.
- **Control de Despachos**: Consulta y actualización de estados de envíos a domicilio (Pendiente &rarr; En Planchado &rarr; En Camino &rarr; Entregado).
- **Consulta de Stock en Probadores**: Verificación rápida de disponibilidad de tallas y colores sin salir del punto de venta.

### Cliente Exclusivo (CLIENTE)
- **Catálogo E-commerce**: Exploración de trajes, blazers, camisas y calzado con filtros dinámicos por categoría, firma de moda y ordenamiento por precio.
- **Ficha Técnica de Sastrería**: Visualización ampliada de composición de paño, tipo de corte y sugerencias de uso.
- **Bolsa de Compras Reactiva**: Offcanvas lateral persistente con selector de cantidades y resumen de costos.
- **Checkout Guiado**: Confirmación de pedido con opción de Retiro en Boutique o Envío a Domicilio con portatrajes, selección de método de pago (Efectivo, Tarjeta, QR) y código de seguimiento inmediato.

---

## Módulos Especializados de Boutique

### 1. Sistema de Outfits & Looks Completos (Combos)
Permite agrupar múltiples prendas individuales en una sola unidad de comercialización (por ejemplo, el *"Outfit Gala Black Tie Completo"* que agrupa Esmóquin, Camisa Smoking, Moño de Seda, Mancuernillas y Calzado Oxford). Al concretar la venta del outfit, el sistema descuenta atómicamente el inventario de cada prenda componente.

### 2. Conciliación y Arqueo de Caja de Turno
Cada asesor abre su turno indicando el fondo de caja en efectivo disponible en gaveta. El sistema acumula en tiempo real las ventas realizadas en efectivo, tarjeta o QR. Al finalizar el turno, el cajero digita el monto físico contado y el sistema calcula automáticamente la diferencia de arqueo (sobrante, faltante o cuadre exacto), sellando la caja.

### 3. Logística de Entrega con Planchado al Vapor
Para prendas de etiqueta que requieren un trato delicado, el sistema gestiona un flujo de entrega especializado con los estados:
- **Pendiente**: Orden recibida en boutique.
- **En Preparación**: Prenda en taller para planchado al vapor y colocación en portatrajes impermeable.
- **En Camino**: Despacho en vehículo climatizado con chofer.
- **Entregado**: Recepción confirmada por el cliente.
- **Cancelado**: Anulación con restitución de inventario.

---

## Modelo de Datos y Relaciones (18 Tablas)

El esquema de la base de datos relacional PostgreSQL consta de **18 tablas principales** estructuradas y administradas a través de TypeORM:

```
                               ┌───────────────┐
                               │     roles     │
                               └───────┬───────┘
                                       │ 1
                                       │
                                       │ N
┌───────────────┐              ┌───────▼───────┐
│   clientes    │              │   usuarios    │
└───────┬───────┘              └───────┬───────┘
        │ 1                            │ 1
        │                              ├──────────────────────────┐
        │ N                            │ N                        │ N
┌───────▼───────┐              ┌───────▼───────┐          ┌───────▼───────┐
│    ventas     │              │  auditorias   │          │    compras    │
└───────┬───────┘              └───────────────┘          └───────┬───────┘
        │ 1                                                       │ 1
        │                                                         │
        ├──────────────────────┬──────────────────────┐           │
        │ 1                    │ 1                    │ 1         │
        │ N                    │ N                    │ 1         │ N
┌───────▼───────┐      ┌───────▼───────┐      ┌───────▼───────┐   │
│detalles_venta │      │     pagos     │      │  deliveries   │   │
└───────┬───────┘      └───────▲───────┘      └───────────────┘   │
        │ N                    │ N                                │
        │                      │ 1                                │
        │              ┌───────┴───────┐                          │
        │              │ metodos_pago  │                          │
        │              └───────────────┘                          │
        │                                                         │
        │                                                         │
        └──────────────────────┬──────────────────────────────────┘
                               │
                               ▼ N
                       ┌───────────────┐                          ┌───────────────┐
                       │   productos   │◄─────────────────────────┤  proveedores  │
                       └───────▲───────┘ 1                      N └───────▲───────┘
                               │                                          │ 1
                               ├──────────────────────────┐               │ N
                               │ 1                        │ 1     ┌───────┴───────┐
                       ┌───────┴───────┐          ┌───────┴───────┤detalles_compra│
                       │  categorias   │          │    marcas     │└──────────────┘
                       └───────────────┘          └───────────────┘
                               ▲
                               │ 1
                               │ N
                       ┌───────┴───────┐          ┌───────────────┐
                       │  promociones  │          │     cajas     │
                       └───────────────┘          └───────────────┘
```

### Detalle de las 18 Tablas

| N° | Tabla | Descripción | Llave Primaria | Relaciones Clave |
|:---|:---|:---|:---|:---|
| 1 | `roles` | Roles del sistema (ADMIN, VENDEDOR, CLIENTE) | `id` (PK) | 1:N con `usuarios` |
| 2 | `usuarios` | Cuentas del personal y clientes con bcrypt | `id` (PK) | N:1 con `roles`, 1:N con `ventas`, `compras`, `cajas` |
| 3 | `clientes` | Padrón de clientes, CI/NIT y talla preferida | `id` (PK) | 1:N con `ventas` |
| 4 | `categorias` | Clasificación de trajes, blazers, camisas, calzado | `id` (PK) | 1:N con `productos` |
| 5 | `marcas` | Firmas de moda (Zegna, Hugo Boss, Armani, Canali) | `id` (PK) | 1:N con `productos` |
| 6 | `proveedores` | Casas textiles, pañerías e importadoras | `id` (PK) | 1:N con `productos`, 1:N con `compras` |
| 7 | `promociones` | Descuentos con vigencia estacional | `id` (PK) | 1:N con `productos` |
| 8 | `productos` | Prendas con talla, color, paño, corte, stock y precio | `id` (PK) | N:1 con `categorias`, `marcas`, `proveedores` |
| 9 | `combo_productos` | Componentes de outfits y looks combinados | `id` (PK) | N:1 con `productos` (combo y prendas) |
| 10 | `compras` | Reabastecimientos de lotes a proveedores | `id` (PK) | N:1 con `proveedores` y `usuarios`, 1:N con `detalles_compra` |
| 11 | `detalles_compra`| Desglose de prendas adquiridas en lote | `id` (PK) | N:1 con `compras` y `productos` |
| 12 | `ventas` | Transacciones de mostrador (POS) o e-commerce | `id` (PK) | N:1 con `clientes`, `usuarios`, `cajas`, 1:N con detalles y pagos |
| 13 | `detalles_venta` | Líneas de prendas vendidas con talla y color | `id` (PK) | N:1 con `ventas` y `productos` |
| 14 | `metodos_pago` | Efectivo, Tarjetas, QR Simple, Transferencia | `id` (PK) | 1:N con `pagos` |
| 15 | `pagos` | Montos liquidados asociados a la venta | `id` (PK) | N:1 con `ventas` y `metodos_pago` |
| 16 | `cajas` | Turnos de apertura, ventas por canal y arqueo | `id` (PK) | N:1 con `usuarios`, 1:N con `ventas` |
| 17 | `deliveries` | Envíos a domicilio con planchado y portatrajes | `id` (PK) | 1:1 con `ventas` |
| 18 | `auditorias` | Bitácora estricta de acciones sensibles | `id` (PK) | N:1 opcional con `usuarios` |

### Soporte Integral de Soft Delete (Borrado Lógico)

La plataforma cuenta con soporte integral de **Soft Delete (Borrado Lógico)** para proteger la integridad referencial y asegurar la trazabilidad histórica de transacciones comerciales:

* **Columna Timestamp `@DeleteDateColumn`**: Integrada en las entidades clave (`productos`, `clientes`, `categorias`, `marcas`, `proveedores`, `usuarios`, `roles`, `promociones`, `ventas` y `compras`) mapeada al campo `fecha_eliminacion`.
* **Sincronización de Estado**: Al dar de baja un registro (`DELETE /api/v1/:modulo/:id`), TypeORM ejecuta `softRemove` estampando la fecha de eliminación y ajustando `estado = false`.
* **Filtrado Automático y Transparente**: Las consultas `findAll` y `findOne` excluyen automáticamente los registros dados de baja sin romper claves foráneas de ventas pasadas.
* **Endpoints de Restauración**: Cada módulo provee `PATCH /api/v1/:modulo/:id/restaurar` para rehabilitar registros dados de baja.
* **Interfaz de Administración con Papelera/Recuperación**: Las vistas del frontend (como Productos y Clientes) incorporan conmutadores para visualizar y restaurar elementos eliminados con un solo clic.

---

## Estructura del Proyecto Monorepo

```
sis257_sartorial/
├── backend_sartorial/              # Servidor API NestJS 11
│   ├── src/
│   │   ├── auditoria/              # Módulo de bitácora y logs
│   │   ├── auth/                   # Autenticación JWT, Guards de Rol y Decoradores
│   │   ├── cajas/                  # Apertura, arqueo y cierre de turnos
│   │   ├── categorias/             # Catálogo de categorías
│   │   ├── clientes/               # Directorio de clientes con tallas
│   │   ├── compras/                # Registro de lotes y stock
│   │   ├── detalles-compra/        # Detalle relacional de compras
│   │   ├── detalles-venta/         # Detalle relacional de ventas
│   │   ├── marcas/                 # Firmas de alta confección
│   │   ├── metodos-pago/           # Efectivo, Tarjeta, QR
│   │   ├── pagos/                  # Control de cobros liquidados
│   │   ├── productos/              # Prendas, tallas, paños, cortes y combos
│   │   ├── promociones/            # Motor de descuentos estacionales
│   │   ├── proveedores/            # Importadoras y talleres
│   │   ├── roles/                  # Roles RBAC
│   │   ├── seeders/                # Seeder automatizado en onModuleInit
│   │   ├── usuarios/               # Cuentas de acceso del personal
│   │   ├── ventas/                 # Punto de venta, deliveries y ventas web
│   │   ├── app.module.ts           # Módulo principal y conexión TypeORM
│   │   └── main.ts                 # Bootstrap de NestJS y Swagger Docs
│   ├── uploads/                    # Almacenamiento multimedia local
│   ├── Dockerfile                  # Contenedor Docker para Backend
│   ├── package.json                # Dependencias NestJS
│   └── tsconfig.json               # Configuración TypeScript Backend
│
├── frontend_sartorial/             # Cliente Web SPA Vue 3
│   ├── src/
│   │   ├── assets/                 # Estilos CSS de Alta Costura Sartorial
│   │   ├── components/             # Layouts por rol (AdminLayout, VendedorLayout, Modales)
│   │   ├── helpers/                # Formateadores de precio Bs, fechas y token JWT
│   │   ├── plugins/                # Configuración de Axios e interceptores
│   │   ├── router/                 # Vue Router 4 con Navigation Guards de Rol
│   │   ├── stores/                 # Pinia AuthStore con persistencia
│   │   ├── views/                  # 19 Vistas CRUD, POS, Reportes y Catálogo
│   │   ├── App.vue                 # Componente raíz
│   │   └── main.ts                 # Inicialización Vue 3
│   ├── Dockerfile                  # Contenedor Docker para Frontend
│   ├── package.json                # Dependencias Vue 3 y Vite
│   └── vite.config.ts              # Configuración de Vite
│
├── docker-compose.yml              # Orquestación de contenedores
├── .gitignore                      # Exclusiones de control de versiones
└── README.md                       # Documentación técnica exhaustiva
```

---

## Instalación y Configuración

### Requisitos Previos
- **Node.js** (versión 18 o superior)
- **PostgreSQL** (versión 14, 15, 16 o 18 activa en puerto 5432)
- **npm** (versión 9 o superior)

---

### Paso 1: Configurar la Base de Datos PostgreSQL
Cree la base de datos `sis257_sartorial` mediante `psql` o pgAdmin:
```sql
CREATE DATABASE sis257_sartorial ENCODING 'UTF8';
```

---

### Paso 2: Configuración y Ejecución del Backend
1. Abra una terminal e ingrese al backend:
   ```bash
   cd sis257_sartorial/backend_sartorial
   ```
2. Instale las dependencias:
   ```bash
   npm install
   ```
3. Configure su archivo `.env` (si requiere cambiar credenciales de PostgreSQL):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=su_password
   DB_NAME=sis257_sartorial
   JWT_SECRET=sartorial_prestige_secret_key_sis257_2024
   ```
4. Compile y ejecute el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```
> **Nota**: El servidor ejecutará automáticamente el seeder al iniciar (`SeederService`), creando todas las 18 tablas, los 3 roles, usuarios de prueba, 8 categorías, 12 marcas de prestigio, 6 proveedores, 26 prendas con tallas y fotos reales, promociones y outfits completos.

- **API REST**: `http://localhost:3000/api/v1`
- **Documentación Interactiva Swagger**: `http://localhost:3000/api/docs`

---

### Paso 3: Configuración y Ejecución del Frontend
1. Abra una nueva pestaña en la terminal e ingrese al frontend:
   ```bash
   cd sis257_sartorial/frontend_sartorial
   ```
2. Instale las dependencias:
   ```bash
   npm install
   ```
3. Inicie el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
- **Cliente Web SPA**: `http://localhost:5173`

---

## Ejecución en Contenedores (Docker)

El proyecto incluye soporte listo para desplegarse mediante Docker Compose desde la raíz:

```bash
cd sis257_sartorial
docker-compose up --build
```

Esto compilará y desplegará:
- **Backend API**: puerto `3000`
- **Frontend SPA**: puerto `5173`

---

## Credenciales de Prueba

La pantalla de inicio de sesión (`/login`) cuenta con botones de **acceso rápido de 1 clic** con las siguientes credenciales preconfiguradas:

| Perfil | Nombre | Usuario | Contraseña | Destino tras Login |
|:---|:---|:---|:---|:---|
| **Administrador** | Gerardo De La Fuente | `admin` | `admin123` | `/admin/dashboard` |
| **Asesor POS / Vendedor** | Mauricio Castillo | `vendedor1` | `vend123` | `/vendedor/dashboard` |
| **Cliente Exclusivo** | Carlos Roca | `cliente1` | `client123` | `/` (Catálogo Boutique) |

---

## Información Académica

- **Asignatura**: SIS257 — Desarrollo de Aplicaciones Internet II
- **Estudiante**: Ariel Cusipuma Ortega
- **Docente**: Ing. Esnor Noel Enrique Vaca Moreno
- **Universidad**: Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca
- **Proyecto**: Solución Monorepo Integral para Boutique "Sartorial Prestige"
