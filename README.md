# Sartorial Prestige - Sistema de Gestión de Boutique de Alta Confección & Estilo Formal

### Plataforma Integral de Administración, Punto de Venta (POS), E-commerce de Moda Formal y Asesoría con Inteligencia Artificial

[![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Vue](https://img.shields.io/badge/Vue.js-v3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-v5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-GenAI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

---

**Sartorial Prestige** es una solución de software empresarial monorepo diseñada para la administración integral, comercialización física/digital y control operativo de una **Boutique de ropa formal y semiformal ya confeccionada**.

Abarca trajes completos de dos y tres piezas en lanas Super 130s/150s, esmóquines de gala Black Tie, blazers desestructurados de terciopelo y lino, pantalones de corte Gurkha y clásicos, camisas de etiqueta en algodón egipcio, calzado artesanal de cuero curtido (Oxford Wholecut, Derby, Monkstrap, Loafers), accesorios de distinción (corbatas 7-fold de seda jacquard, tirantes de etiqueta, mancuernillas de plata) y un **Asesor de Estilo Virtual potenciado con Inteligencia Artificial Generativa (Google Gemini 3.8 Flash Lite)** con recomendaciones basadas estrictamente en el inventario real y medidas antropométricas del cliente.

---

## Tabla de Contenidos

- [Acerca del Proyecto](#acerca-del-proyecto)
- [Arquitectura de Software](#arquitectura-de-software)
- [Funcionalidades por Rol](#funcionalidades-por-rol)
- [Módulos Especializados de Boutique](#módulos-especializados-de-boutique)
- [Modelo de Datos y Relaciones (19 Tablas)](#modelo-de-datos-y-relaciones-19-tablas)
- [Estructura del Proyecto Monorepo](#estructura-del-proyecto-monorepo)
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución en Contenedores (Docker)](#ejecución-en-contenedores-docker)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [Información Académica](#información-académica)

---

## Acerca del Proyecto

La solución satisface los requerimientos de digitalización y excelencia operativa de boutiques de alta gama, abordando:

1. **Gestión de Prendas con Atributos de Sastrería**: Catálogo extendido de 55 prendas y calzados exclusivos con tallas estándar de confección formal (36R, 38R, 40R, 42L, 44R; calzado 39 a 44), colores clásicos de etiqueta, tipos de paño/tejido (Lana Super 150s, Seda Italiana, Terciopelo, Cuero Curtido) y siluetas estilizadas (*Slim Fit*, *Tailored Fit*, *Classic Fit*, *Modern Fit*).
2. **Punto de Venta Ágil para Tienda Física (POS)**: Búsqueda instantánea por SKU, lectura óptica mediante cámara (código de barras y QR con `html5-qrcode`), selección rápida de cliente o consumidor final en mostrador, múltiples métodos de pago (Efectivo con cálculo de cambio, Tarjeta y QR) y emisión/impresión inmediata de recibos formales y tickets térmicos de 80mm.
3. **Módulo de Apertura, Arqueo y Cierre de Caja**: Control estricto de dinero base en gaveta, ventas acumuladas por medio de cobro, conciliación de arqueo físico al cierre y registro automático de diferencias (sobrante, faltante o cuadre exacto).
4. **Catálogo E-commerce con Paginación de Lujo**: Experiencia de compra en línea organizada en bloques de **8 prendas por página** con controles de navegación numéricos, offcanvas interactivo de bolsa de compras, visualización técnica de paño/corte y checkout guiado con portatrajes.
5. **Asesor de Estilo Virtual con Inteligencia Artificial (GenAI)**: Asistente conversacional de alta costura integrado en el catálogo online y en el mostrador del POS, respaldado por la API de Google Gemini (`gemini-3.8-flash-lite`), con grounding estricto sobre las 55 prendas de la base de datos y compatibilidad con las medidas anatómicas del cliente.
6. **Control de Despachos con Planchado al Vapor**: Módulo de seguimiento de entregas a domicilio donde las prendas pasan por control de calidad, planchado vertical al vapor y embalaje en portatrajes impermeables antes de su envío.
7. **Diseño Responsivo y Tematización Adaptativa**: Interfaz de ultra-lujo construida con Bootstrap 5 y paleta Obsidian & Gold, optimizada con sidebar retráctil con backdrop para dispositivos móviles y tablets, y tablas de datos con ancho fijo calibrado (`table-fixed`).

---

## Arquitectura de Software

El sistema implementa una arquitectura desacoplada y modular sobre una base de datos relacional robusta e integración con modelos de lenguaje generativos en la nube:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Cliente Frontend SPA                          │
│        (Vue 3, Vite, Pinia, TypeScript, Bootstrap 5, Chart.js)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Solicitudes REST / JWT Bearer
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            Servidor Backend                            │
│           (NestJS 11, TypeORM, Passport, Express, Multer)              │
└─────────────┬────────────────────────────────────────────┬─────────────┘
              │                                            │
              │ Transacciones ACID / SQL                   │ Google GenAI SDK
              ▼                                            ▼
┌───────────────────────────┐                ┌───────────────────────────┐
│ Base de Datos Relacional  │                │ Servicio de IA Generativa │
│ (PostgreSQL - 19 Tablas)  │                │ (Google Gemini 3.8 Flash) │
└───────────────────────────┘                └───────────────────────────┘
```

---

## Funcionalidades por Rol

El sistema implementa un Control de Acceso Basado en Roles (**RBAC**) con guards en el backend (`RolesGuard`) y guards de navegación en Vue Router:

### Administrador (ADMIN)
- **Dashboard Ejecutivo**: Métricas en tiempo real de ingresos del día, facturación acumulada del mes, transacciones totales, clientes registrados y alertas de existencias bajas.
- **Gráficos Analíticos Interactivos**: Curva de ingresos mensuales y distribución porcentual del catálogo mediante Chart.js con selector dinámico de gestión.
- **Gestión Integral de Catálogos**: Control CRUD de Prendas, Categorías de Vestir, Marcas/Firmas Internacionales y Proveedores Textiles.
- **Tabla Administrativa Balanceada (`table-fixed`)**: Despliegue de prendas con anchos proporcionales, imágenes optimizadas, badges apilables de corte/talla, precio en 3 filas independientes y stock con indicadores mínimos.
- **Gestión de Outfits & Looks Completos**: Creación de colecciones combinadas (ej. Traje + Camisa + Moño + Mancuernillas + Calzado) a precio de paquete con sincronización atómica de existencias.
- **Abastecimiento & Compras**: Registro transaccional de compras a proveedores con incremento automático de existencias en almacén.
- **Supervisión de Cajas**: Historial completo de turnos y arqueos de caja de todos los asesores comerciales.
- **Centro de Promociones**: Parametrización de descuentos estacionales con porcentaje y rango de vigencia.
- **Bitácora de Auditoría**: Monitoreo inalterable de mutaciones y accesos de usuarios en el sistema.

### Asesor de Estilo / Vendedor (VENDEDOR)
- **Terminal de Ventas POS de Alta Velocidad**: Buscador reactivo por SKU/nombre, escáner de códigos de barras/QR mediante cámara web o móvil, selección de prendas, carrito en vivo y cálculo de subtotales.
- **Asesor de Estilo IA en Mostrador**: Consulta directa al Asistente Gemini desde el POS para asesorar al cliente en etiqueta formal y añadir el look sugerido al ticket en un clic.
- **Módulo de Turno de Caja**: Apertura con fondo de gaveta, arqueo de dinero en efectivo y cierre de turno conciliado con cálculo automático de diferencias.
- **Registro Rápido de Clientes**: Alta inmediata de clientes en mostrador para registrar su cédula/NIT, datos de contacto y medidas anatómicas.
- **Control de Despachos**: Consulta y actualización de estados de envíos a domicilio (Pendiente &rarr; En Planchado &rarr; En Camino &rarr; Entregado).
- **Barra de Cobro Móvil**: Panel inferior fijo (*sticky footer*) optimizado para tablets y teléfonos celulares.

### Cliente Exclusivo (CLIENTE)
- **Catálogo E-commerce con Paginación**: Exploración de trajes, blazers, camisas y calzado con paginación de **8 artículos por bloque**, filtros reactivos por categoría y firma, y ordenamiento por precio.
- **Asesor de Estilo Virtual Personalizado**: Asistente conversacional flotante para consultar protocolos de etiqueta según ocasión, horario y clima, sugiriendo piezas exactas del inventario.
- **Ficha Técnica de Sastrería**: Visualización de composición textil, tipo de corte, sugerencias de uso y precios con desglose de descuentos.
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

### 4. Ficha Antropométrica de Sastrería & Medidas del Cliente (`medidas_cliente`)
Permite registrar y consultar con precisión las 9 medidas anatómicas fundamentales para la confección y ajuste formal:
- **Tren Superior**: Pecho (cm), Cuello (cm), Hombro a Hombro (cm), Largo de Manga (cm).
- **Tren Inferior**: Cintura (cm), Cadera (cm), Tiro de Pantalón (cm), Largo de Entrepierna / Inseam (cm), Bastas (cm).
- **Personalización de Corte**: Clasificación por silueta (*Slim Fit*, *Tailored Fit*, *Classic Fit*, *Modern Fit*), observaciones anatómicas y firma del maestro sastre asignado.

### 5. Emisión de Documentos en PDF & Exportación a Excel
- **Ticket Térmico (80mm)**: Generado dinámicamente con `pdfkit` y `qrcode`, listo para impresoras térmicas de mostrador con desglose de ítems, totales e imagen de código QR.
- **Factura / Recibo Formal A4**: Documento editorial de alta costura con estética institucional, tabla desglosada y validación digital.
- **Exportación a Excel (`exceljs`)**: Reportes de ventas e inventario/catálogo descargables en formato `.xlsx` con encabezados y totales automáticos.

### 6. Paginación Server-Side Estandarizada
Módulos principales (`clientes`, `productos`, `ventas`, `compras`, `proveedores`) implementan `PaginationDto` con soporte para paginación (`page`, `limit`), búsqueda global insensible a mayúsculas/minúsculas (`search`), ordenamiento dinámico (`sortBy`, `sortOrder`) y conmutador de eliminados (`conInactivos`).

### 7. Mapeo Relacional 1:1 entre Usuario y Cliente
Enlace formal `@OneToOne` entre las entidades `Usuario` y `Cliente` (`usuario.clienteId` y `cliente.usuarioId`). Al registrar un nuevo cliente desde la vista de registro o por el administrador, se conserva el vínculo biunívoco, permitiendo que todas las compras online se asocien directamente al historial del cliente autenticado.

### 8. Tienda Global de Carrito de Compras (`stores/cart.ts`)
Gestión centralizada del carrito con Pinia (`useCartStore`) persistida en `localStorage` (`sartorial_cart`). Permite visualizar el contador dinámico de prendas en la bolsa desde cualquier vista o barra de navegación (tanto en `AdminLayout` como en `VendedorLayout`), con apertura y cierre controlado del offcanvas lateral.

### 9. Analítica Comercial Dinamizada & Agrupación SQL (`ventas/estadisticas/mensuales`)
Endpoint en el backend NestJS (`GET /api/v1/ventas/estadisticas/mensuales?year=YYYY`) que agrupa mediante SQL nativo (`DATE_TRUNC('month', v.fecha)` y `EXTRACT(MONTH FROM v.fecha)`) las ventas reales por mes y año. Alimenta la curva de facturación mensual en `ReportesView.vue` con Chart.js y selector reactivo de gestión.

### 10. Escáner de Códigos de Barra / QR mediante Cámara Web o Móvil
Integración en `NuevaVentaView.vue` con la librería `html5-qrcode`. Permite la lectura óptica física tanto de códigos de barras (EAN-13, CODE-128) como de códigos QR impresos en las etiquetas de los trajes y prendas, agregándolas de forma inmediata al ticket de venta de mostrador con feedback sonoro/visual.

### 11. Biblioteca de Componentes UI Reutilizables (`components/common/`)
- **`PriceTag.vue`**: Formateador de moneda boliviana (`Bs.`) con soporte para despliegue horizontal estándar y vertical en **3 filas independientes** (`stacked`: fila superior de precio tachado, fila central de precio final en negrita dorada, fila inferior de badge rojo de descuento) para evitar superposiciones en tablas de datos.
- **`AsesorEstiloModal.vue`**: Modal de alta costura tamaño `modal-xl` para interacción con el Asistente de IA Gemini, con visualización de look recomendado, fichas técnicas de prendas reales y botón de añadido automático al carrito/ticket.
- **`DataTable.vue`**: Tabla de datos modular con buscador debounce integrado, selector de tamaño de página, conmutador de eliminados (soft delete), controles de paginación y slots parametrizables.
- **`StatusBadge.vue`**: Badge unificado para estados de delivery, ventas, caja o estado activo/inactivo, con iconos vectoriales de Bootstrap Icons.

### 12. Restricción y Validación en la Subida de Imágenes (`productos/upload-image`)
Seguridad perimetral y control de almacenamiento en la carga de archivos:
- **`fileFilter` estricto**: Validación bidireccional por MIME type (`image/jpeg`, `image/png`, `image/webp`) y extensión de archivo (`.jpg`, `.jpeg`, `.png`, `.webp`), bloqueando ejecutables o scripts maliciosos.
- **Control de Cuota (`limits: { fileSize: 2 * 1024 * 1024 }`)**: Límite estricto de 2 MB por archivo para proteger el disco del servidor.
- **Sanitización y nombrado seguro**: Generación de identificador único seguro (`prenda-<timestamp>-<random>.<ext>`) en `./uploads`.
- **Integración en frontend**: Botón interactivo en [ProductosView.vue](file:///C:/Users/cusip/Documents/Informatica/4_Semestre/SIS257/Proyectos%20finales/sis257_sartorial/frontend_sartorial/src/views/ProductosView.vue) para carga directa de fotos de prendas en mostrador con feedback inmediato.

### 13. Filtro Global de Excepciones e Interceptor de Métricas HTTP
- **`HttpExceptionFilter` ([http-exception.filter.ts](file:///C:/Users/cusip/Documents/Informatica/4_Semestre/SIS257/Proyectos%20finales/sis257_sartorial/backend_sartorial/src/common/filters/http-exception.filter.ts))**: Capturador unificado que normaliza todas las excepciones de la aplicación en un esquema JSON predecible (`{ success: false, statusCode, error, message, timestamp, path, method }`). Mapea errores de PostgreSQL (`QueryFailedError` para claves duplicadas `23505`, llaves foráneas `23503`), errores de Multer (`LIMIT_FILE_SIZE`), errores de `ValidationPipe` y excepciones no controladas.
- **`ResponseInterceptor` ([response.interceptor.ts](file:///C:/Users/cusip/Documents/Informatica/4_Semestre/SIS257/Proyectos%20finales/sis257_sartorial/backend_sartorial/src/common/interceptors/response.interceptor.ts))**: Interceptor global que registra en tiempo real el método HTTP, URL, código de respuesta y latencia (`elapsed time`), e inyecta encabezados de telemetría institucional (`X-Response-Time`, `X-Powered-By`).

### 14. Catálogo Extendido de Alta Sastrería (55 Prendas & Conjuntos de Lujo)
El seeder automatizado ([seeder.service.ts](file:///C:/Users/cusip/Documents/Informatica/4_Semestre/SIS257/Proyectos%20finales/sis257_sartorial/backend_sartorial/src/seeders/seeder.service.ts)) inicializa el catálogo con **55 prendas exclusivas** de confección formal con fotografías en alta definición (Unsplash), ficha técnica de sastrería completa (material, talla, corte, color, género) y desglose por categorías:
- **Trajes & Esmóquines (9 prendas)**: Trajes Super 150s, Chaqué diplomático de ceremonia, Traje safari en lino irlandés, Traje Príncipe de Gales cruzado, Esmóquines de etiqueta Tom Ford y Scabal.
- **Blazers & Sacos Sport (8 prendas)**: Blazers náuticos de corte italiano con botones metálicos dorados, blazers de terciopelo verde bosque, lana espigada Harris Tweed y mezclas de seda y lino Canali.
- **Pantalones de Vestir & Chinos (7 prendas)**: Pantalones con pretina alta estilo Gurkha y hebillas laterales, pinzas profundas invertidas, lana franela gris y chinos de algodón pima.
- **Camisas de Etiqueta & Gala (7 prendas)**: Camisas de cuello smoking pechera piqué, cuellos italianos cutaway y cuello pasador inglés en algodón Thomas Mason y Albiate 1830.
- **Calzado Formal de Cuero (8 modelos)**: Hormas Oxford Balmoral enterizo (*Wholecut*), Monkstrap de doble hebilla, Tassel Loafers en ante chocolate, botines Chelsea y Derbys de charol de gala.
- **Accesorios de Etiqueta (7 artículos)**: Gemelos de plata y ónix, corbatas 7-fold de seda Jacquard, tirantes de seda moiré para esmóquin, fajas cummerbund y pañuelos de bolsillo estampados.
- **Abrigos & Sobretodos (3 prendas)**: Crombie coat en paño de lana merino, gabardina Trench militar con forro tartán y capa/sobretodo de cachemira italiana con cuello alzado.
- **Chalecos de Etiqueta (2 prendas)**: Chalecos de seda Jacquard y modelos tradicionales en franela crema para bodas diurnas.
- **Outfits & Combos Completos (4 conjuntos)**: Looks de gala, ejecutivos y ceremonia que asocian múltiples prendas con precios de paquete y cálculo de stock sincronizado.

### 15. Asesor de Estilo Virtual con Inteligencia Artificial (Google Gemini 3.8 Flash Lite)
Asistente de alta costura conversacional integrado tanto en el catálogo en línea ([CatalogoView.vue](file:///C:/Users/cusip/Documents/Informatica/4_Semestre/SIS257/Proyectos%20finales/sis257_sartorial/frontend_sartorial/src/views/CatalogoView.vue)) como en el mostrador del Punto de Venta ([NuevaVentaView.vue](file:///C:/Users/cusip/Documents/Informatica/4_Semestre/SIS257/Proyectos%20finales/sis257_sartorial/frontend_sartorial/src/views/NuevaVentaView.vue)):
- **Tecnología**: Desarrollado con el SDK oficial `@google/genai` y el modelo `gemini-3.8-flash-lite` (con sistema de redundancia y fallback dinámico a `gemini-3.5-flash-lite` / `gemini-flash-lite-latest`).
- **Análisis de Protocolo y Etiqueta**: El cliente describe su ocasión (ej. *"Boda de gala en jardín a las 18:00, código cóctel formal"*), y el Asesor analiza el horario, lugar y código formal aplicable.
- **Cero Alucinaciones (Grounding en BD)**: Cruza la consulta exclusivamente contra el catálogo activo de 55 prendas registradas en PostgreSQL, devolviendo prendas reales con sus SKUs, fotos en alta resolución, tallas y precios en Bs.
- **Personalización Antropométrica**: Si el cliente está autenticado o seleccionado en mostrador, el Asesor consulta sus medidas anatómicas (`MedidaCliente`: pecho, cintura, manga, cuello, silueta) para recomendar el corte y talla más favorecedor.
- **Añadido con 1 Clic**: El modal ([AsesorEstiloModal.vue](file:///C:/Users/cusip/Documents/Informatica/4_Semestre/SIS257/Proyectos%20finales/sis257_sartorial/frontend_sartorial/src/components/common/AsesorEstiloModal.vue)) permite agregar tanto piezas individuales como el *Look Completo Armonizado* directamente a la bolsa de compras o al ticket de venta del cajero.

---

## Modelo de Datos y Relaciones (19 Tablas)

El esquema de la base de datos relacional PostgreSQL consta de **19 tablas principales** estructuradas y administradas a través de TypeORM:

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
                                                  
                                                  ┌───────────────┐
                                                  │medidas_cliente│
                                                  └───────────────┘
```

### Detalle de las 19 Tablas

| N° | Tabla | Descripción | Llave Primaria | Relaciones Clave |
|:---|:---|:---|:---|:---|
| 1 | `roles` | Roles del sistema (ADMIN, VENDEDOR, CLIENTE) | `id` (PK) | 1:N con `usuarios` |
| 2 | `usuarios` | Cuentas del personal y clientes con bcrypt | `id` (PK) | N:1 con `roles`, 1:1 con `clientes`, 1:N con `ventas`, `compras`, `cajas` |
| 3 | `clientes` | Padrón de clientes, CI/NIT y talla preferida | `id` (PK) | 1:1 con `usuarios`, 1:N con `ventas`, 1:N con `medidas_cliente` |
| 4 | `medidas_cliente` | Ficha antropométrica de sastrería (pecho, cintura, cadera, hombro, manga, cuello, tiro, entrepierna, bastas) | `id` (PK) | N:1 con `clientes` |
| 5 | `categorias` | Clasificación de trajes, blazers, camisas, calzado | `id` (PK) | 1:N con `productos` |
| 6 | `marcas` | Firmas de moda (Zegna, Hugo Boss, Armani, Canali) | `id` (PK) | 1:N con `productos` |
| 7 | `proveedores` | Casas textiles, pañerías e importadoras | `id` (PK) | 1:N con `productos`, 1:N con `compras` |
| 8 | `promociones` | Descuentos con vigencia estacional | `id` (PK) | 1:N con `productos` |
| 9 | `productos` | Prendas con talla, color, paño, corte, stock y precio | `id` (PK) | N:1 con `categorias`, `marcas`, `proveedores` |
| 10 | `combo_productos` | Componentes de outfits y looks combinados | `id` (PK) | N:1 con `productos` (combo y prendas) |
| 11 | `compras` | Reabastecimientos de lotes a proveedores | `id` (PK) | N:1 con `proveedores` y `usuarios`, 1:N con `detalles_compra` |
| 12 | `detalles_compra`| Desglose de prendas adquiridas en lote | `id` (PK) | N:1 con `compras` y `productos` |
| 13 | `ventas` | Transacciones de mostrador (POS) o e-commerce | `id` (PK) | N:1 con `clientes`, `usuarios`, `cajas`, 1:N con detalles y pagos |
| 14 | `detalles_venta` | Líneas de prendas vendidas con talla y color | `id` (PK) | N:1 con `ventas` y `productos` |
| 15 | `metodos_pago` | Efectivo, Tarjetas, QR Simple, Transferencia | `id` (PK) | 1:N con `pagos` |
| 16 | `pagos` | Montos liquidados asociados a la venta | `id` (PK) | N:1 con `ventas` y `metodos_pago` |
| 17 | `cajas` | Turnos de apertura, ventas por canal y arqueo | `id` (PK) | N:1 con `usuarios`, 1:N con `ventas` |
| 18 | `deliveries` | Envíos a domicilio con planchado y portatrajes | `id` (PK) | 1:1 con `ventas` |
| 19 | `auditorias` | Bitácora estricta de acciones sensibles | `id` (PK) | N:1 opcional con `usuarios` |

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
│   │   ├── asesor-estilo/          # Módulo GenAI Asesor de Estilo (Google Gemini)
│   │   ├── auditoria/              # Módulo de bitácora y logs
│   │   ├── auth/                   # Autenticación JWT, Guards de Rol y Decoradores
│   │   ├── cajas/                  # Apertura, arqueo y cierre de turnos
│   │   ├── categorias/             # Catálogo de categorías
│   │   ├── clientes/               # Directorio de clientes con tallas
│   │   ├── common/                 # Filtros de excepción (HttpExceptionFilter) e interceptores
│   │   ├── compras/                # Registro de lotes y stock
│   │   ├── detalles-compra/        # Detalle relacional de compras
│   │   ├── detalles-venta/         # Detalle relacional de ventas
│   │   ├── marcas/                 # Firmas de alta confección
│   │   ├── medidas-cliente/        # Ficha antropométrica de sastrería
│   │   ├── metodos-pago/           # Efectivo, Tarjeta, QR
│   │   ├── pagos/                  # Control de cobros liquidados
│   │   ├── productos/              # Prendas, tallas, paños, cortes y combos
│   │   ├── promociones/            # Motor de descuentos estacionales
│   │   ├── proveedores/            # Importadoras y talleres
│   │   ├── reportes-documentos/    # Generación de PDF (PDFKit) y Excel (ExcelJS)
│   │   ├── roles/                  # Roles RBAC
│   │   ├── seeders/                # Seeder automatizado en onModuleInit
│   │   ├── usuarios/               # Cuentas de acceso del personal
│   │   ├── ventas/                 # Punto de venta, deliveries y ventas web
│   │   ├── app.module.ts           # Módulo principal y conexión TypeORM
│   │   └── main.ts                 # Bootstrap de NestJS y Swagger Docs
│   ├── uploads/                    # Almacenamiento multimedia local
│   ├── Dockerfile                  # Contenedor Docker para Backend
│   ├── package.json                # Dependencias NestJS y Google GenAI
│   └── tsconfig.json               # Configuración TypeScript Backend
│
├── frontend_sartorial/             # Cliente Web SPA Vue 3
│   ├── src/
│   │   ├── assets/                 # Estilos CSS de Alta Costura Sartorial (Obsidian & Gold)
│   │   ├── components/             # Layouts por rol (AdminLayout, VendedorLayout)
│   │   │   └── common/             # Componentes reusables (PriceTag, AsesorEstiloModal, DataTable, StatusBadge)
│   │   ├── helpers/                # Formateadores de precio Bs, fechas y token JWT
│   │   ├── plugins/                # Configuración de Axios e interceptores
│   │   ├── router/                 # Vue Router 4 con Navigation Guards de Rol
│   │   ├── stores/                 # Pinia AuthStore y CartStore con persistencia
│   │   ├── views/                  # 25 Vistas SPA (CRUDs, POS, Reportes, Catálogo, Asesor)
│   │   ├── App.vue                 # Componente raíz
│   │   └── main.ts                 # Inicialización Vue 3
│   ├── Dockerfile                  # Contenedor Docker para Frontend
│   ├── package.json                # Dependencias Vue 3, Vite y Bootstrap 5
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
3. Configure su archivo `.env` en la raíz de `backend_sartorial`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=su_password
   DB_NAME=sis257_sartorial
   JWT_SECRET=sartorial_prestige_secret_key_sis257_2024
   GEMINI_API_KEY=su_api_key_de_google_gemini
   GEMINI_MODEL=gemini-3.8-flash-lite
   ```
4. Compile y ejecute el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```
> **Nota**: El servidor ejecutará automáticamente el seeder al iniciar (`SeederService`), creando todas las 19 tablas, los 3 roles, usuarios de prueba, 8 categorías, 12 marcas de prestigio, 6 proveedores, 55 prendas de lujo con especificaciones textiles completas, fotos en alta resolución, promociones y outfits completos.

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
