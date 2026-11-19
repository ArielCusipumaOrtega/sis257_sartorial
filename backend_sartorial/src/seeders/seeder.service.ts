import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Rol } from '../roles/entities/rol.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Marca } from '../marcas/entities/marca.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MetodoPago } from '../metodos-pago/entities/metodo-pago.entity';
import { Promocion } from '../promociones/entities/promocion.entity';
import { ComboProducto } from '../productos/entities/combo-producto.entity';
import { MedidaCliente } from '../medidas-cliente/entities/medida-cliente.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Rol) private rolRepo: Repository<Rol>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Categoria) private categoriaRepo: Repository<Categoria>,
    @InjectRepository(Marca) private marcaRepo: Repository<Marca>,
    @InjectRepository(Proveedor) private proveedorRepo: Repository<Proveedor>,
    @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(MetodoPago) private metodoPagoRepo: Repository<MetodoPago>,
    @InjectRepository(Promocion) private promocionRepo: Repository<Promocion>,
    @InjectRepository(ComboProducto) private comboProductoRepo: Repository<ComboProducto>,
    @InjectRepository(MedidaCliente) private medidaRepo: Repository<MedidaCliente>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    console.log('--- Iniciando Seeder de Sartorial Prestige Boutique ---');

    // 1. ROLES
    let rolAdmin = await this.rolRepo.findOne({ where: { nombre: 'ADMIN' } });
    if (!rolAdmin) {
      rolAdmin = await this.rolRepo.save(
        this.rolRepo.create({ nombre: 'ADMIN', descripcion: 'Administrador general de la Boutique Sartorial Prestige' }),
      );
    }
    let rolVendedor = await this.rolRepo.findOne({ where: { nombre: 'VENDEDOR' } });
    if (!rolVendedor) {
      rolVendedor = await this.rolRepo.save(
        this.rolRepo.create({ nombre: 'VENDEDOR', descripcion: 'Asesor de estilo y encargado de caja (POS)' }),
      );
    }
    let rolCliente = await this.rolRepo.findOne({ where: { nombre: 'CLIENTE' } });
    if (!rolCliente) {
      rolCliente = await this.rolRepo.save(
        this.rolRepo.create({ nombre: 'CLIENTE', descripcion: 'Cliente exclusivo registrado en la plataforma' }),
      );
    }

    // 2. USUARIOS
    const hash = async (pwd: string) => bcrypt.hash(pwd, 10);

    const adminUser = await this.usuarioRepo.findOne({ where: { usuario: 'admin' } });
    if (!adminUser) {
      await this.usuarioRepo.save(
        this.usuarioRepo.create({
          nombre: 'Gerardo',
          apellido: 'De La Fuente',
          correo: 'admin@sartorialprestige.com',
          usuario: 'admin',
          password: await hash('admin123'),
          estado: true,
          rolId: rolAdmin.id,
        }),
      );
    }

    const vend1 = await this.usuarioRepo.findOne({ where: { usuario: 'vendedor1' } });
    if (!vend1) {
      await this.usuarioRepo.save(
        this.usuarioRepo.create({
          nombre: 'Mauricio',
          apellido: 'Castillo',
          correo: 'mauricio@sartorialprestige.com',
          usuario: 'vendedor1',
          password: await hash('vend123'),
          estado: true,
          rolId: rolVendedor.id,
        }),
      );
    }

    const vend2 = await this.usuarioRepo.findOne({ where: { usuario: 'vendedor2' } });
    if (!vend2) {
      await this.usuarioRepo.save(
        this.usuarioRepo.create({
          nombre: 'Valeria',
          apellido: 'Montes',
          correo: 'valeria@sartorialprestige.com',
          usuario: 'vendedor2',
          password: await hash('vend123'),
          estado: true,
          rolId: rolVendedor.id,
        }),
      );
    }

    const clientDemo = await this.usuarioRepo.findOne({ where: { usuario: 'cliente1' } });
    if (!clientDemo) {
      await this.usuarioRepo.save(
        this.usuarioRepo.create({
          nombre: 'Carlos',
          apellido: 'Roca',
          correo: 'carlos.roca@gmail.com',
          usuario: 'cliente1',
          password: await hash('client123'),
          estado: true,
          rolId: rolCliente.id,
        }),
      );
    }

    // 3. MÉTODOS DE PAGO
    const metodosData = [
      { nombre: 'Efectivo', descripcion: 'Cobro físico en efectivo en caja con cálculo de cambio', activo: true },
      { nombre: 'Tarjeta de Crédito / Débito', descripcion: 'Cobro POS bancario Visa, Mastercard y American Express', activo: true },
      { nombre: 'QR Simple / Transferencia', descripcion: 'Transferencia bancaria directa y pago rápido mediante QR', activo: true },
      { nombre: 'Pasarela Digital', descripcion: 'Pago digital directo para pedidos online', activo: true },
    ];
    for (const m of metodosData) {
      const existe = await this.metodoPagoRepo.findOne({ where: { nombre: m.nombre } });
      if (!existe) await this.metodoPagoRepo.save(this.metodoPagoRepo.create(m));
    }

    // 4. CLIENTES
    const clientesData = [
      { nombre: 'Cliente', apellido: 'Ocasional', ciNit: '0', telefono: '00000000', correo: 'mostrador@sartorialprestige.com', direccion: 'Venta en mostrador boutique', preferenciaTalla: 'General', usuarioId: null },
      { nombre: 'Carlos', apellido: 'Roca', ciNit: '4829104', telefono: '71234567', correo: 'carlos.roca@gmail.com', direccion: 'Calle Calvo #240', preferenciaTalla: '40R', usuarioId: clientDemo?.id || null },
      { nombre: 'Dr. Eduardo', apellido: 'Quiroga', ciNit: '3948192', telefono: '78291044', correo: 'equiroga@bufete.com', direccion: 'Av. Hernando Siles #510', preferenciaTalla: '42L', usuarioId: null },
      { nombre: 'Fernando', apellido: 'Beltrán', ciNit: '5192837', telefono: '70192834', correo: 'fbeltran@corporativo.bo', direccion: 'Barrio Petrolero, Calle 3 #12', preferenciaTalla: '38R', usuarioId: null },
      { nombre: 'Claudia', apellido: 'Saavedra', ciNit: '4192038', telefono: '73918274', correo: 'claudia.saavedra@outlook.com', direccion: 'Plaza 25 de Mayo #88', preferenciaTalla: '38 / M', usuarioId: null },
    ];
    for (const c of clientesData) {
      let existe = await this.clienteRepo.findOne({ where: { ciNit: c.ciNit, nombre: c.nombre } });
      if (!existe) {
        existe = await this.clienteRepo.save(this.clienteRepo.create(c));
      } else if (c.usuarioId && !existe.usuarioId) {
        existe.usuarioId = c.usuarioId;
        await this.clienteRepo.save(existe);
      }
    }

    // 4.1 FICHAS DE MEDIDAS DE SASTRERÍA (MedidaCliente)
    const carlosCliente = await this.clienteRepo.findOne({ where: { correo: 'carlos.roca@gmail.com' } });
    if (carlosCliente) {
      const tieneMedida = await this.medidaRepo.findOne({ where: { clienteId: carlosCliente.id } });
      if (!tieneMedida) {
        await this.medidaRepo.save(
          this.medidaRepo.create({
            clienteId: carlosCliente.id,
            pecho: 102.5,
            cintura: 86.0,
            cadera: 98.0,
            hombroAHombro: 46.5,
            largoManga: 64.0,
            cuello: 40.5,
            tiroPantalon: 27.0,
            largoEntrepierna: 81.5,
            bastas: 19.5,
            ajustePreferido: 'Tailored Fit',
            observaciones: 'Caída de hombro equilibrada. Silueta entallada europea. Puños con 1cm de visibilidad de camisa.',
            sastre: 'Maestro Sastre V. Hugo',
            fechaMedicion: new Date().toISOString().split('T')[0],
          }),
        );
      }
    }

    const eduardoCliente = await this.clienteRepo.findOne({ where: { ciNit: '3948192' } });
    if (eduardoCliente) {
      const tieneMedida = await this.medidaRepo.findOne({ where: { clienteId: eduardoCliente.id } });
      if (!tieneMedida) {
        await this.medidaRepo.save(
          this.medidaRepo.create({
            clienteId: eduardoCliente.id,
            pecho: 108.0,
            cintura: 94.0,
            cadera: 104.5,
            hombroAHombro: 48.5,
            largoManga: 67.0,
            cuello: 42.0,
            tiroPantalon: 29.0,
            largoEntrepierna: 85.5,
            bastas: 21.0,
            ajustePreferido: 'Classic Fit',
            observaciones: 'Corte tradicional de dos botones. Caída amplia y cómoda para estrado judicial.',
            sastre: 'Maestro Sastre V. Hugo',
            fechaMedicion: new Date().toISOString().split('T')[0],
          }),
        );
      }
    }

    // 5. PROVEEDORES
    const provsData = [
      { nombre: 'Sartoria Milano SpA', nit: '1029384756', telefono: '+39 02 7600 1234', correo: 'forniture@sartoriamilano.it', direccion: 'Via Monte Napoleone 8, Milán, Italia' },
      { nombre: 'Scabal Savile Row Clothiers', nit: '2049583721', telefono: '+44 20 7734 1234', correo: 'orders@scabal.co.uk', direccion: '12 Savile Row, Mayfair, Londres, Reino Unido' },
      { nombre: 'Iberian Footwear Guild', nit: '3049582910', telefono: '+34 967 34 56 78', correo: 'pedidos@iberianfootwear.es', direccion: 'Polígono Calzado Artesanal, Almansa, España' },
      { nombre: 'Silk & Elegance Accessories Co.', nit: '4092817263', telefono: '+39 031 928345', correo: 'info@silkelegance.it', direccion: 'Via Bellinzona 44, Como, Italia' },
      { nombre: 'Textiles Andinos & Confección Fina S.A.', nit: '5928103948', telefono: '2-2435678', correo: 'ventas@textilesandinos.bo', direccion: 'Zona San Pedro, Calle Almirante Grau #340, La Paz' },
      { nombre: 'Distribuidora Textil Del Prado', nit: '6829103948', telefono: '4-4258901', correo: 'pedidos@textildelprado.com', direccion: 'Av. Ballivián #680, Cochabamba' },
    ];
    const provMap: Record<string, Proveedor> = {};
    for (const p of provsData) {
      let prov = await this.proveedorRepo.findOne({ where: { nombre: p.nombre } });
      if (!prov) prov = await this.proveedorRepo.save(this.proveedorRepo.create(p));
      provMap[p.nombre] = prov;
    }

    // 6. MARCAS
    const marcasData = [
      { nombre: 'Ermenegildo Zegna', paisOrigen: 'Italia', descripcion: 'Sastrería de ultra-lujo y tejidos de lana fina' },
      { nombre: 'Hugo Boss', paisOrigen: 'Alemania', descripcion: 'Elegancia alemana, trajes ejecutivos modernos y vanguardistas' },
      { nombre: 'Canali', paisOrigen: 'Italia', descripcion: 'Corte sartorial clásico italiano hecho a mano' },
      { nombre: 'Brooks Brothers', paisOrigen: 'Estados Unidos', descripcion: 'La firma clásica de etiqueta y camisería desde 1818' },
      { nombre: 'Salvatore Ferragamo', paisOrigen: 'Italia', descripcion: 'Calzado formal de cuero vacuno y marroquinería artesanal' },
      { nombre: 'Ralph Lauren Purple Label', paisOrigen: 'Estados Unidos', descripcion: 'La máxima expresión del estilo formal aristocrático' },
      { nombre: 'Giorgio Armani', paisOrigen: 'Italia', descripcion: 'Siluetas fluidas, esmóquines refinados y blazers icónicos' },
      { nombre: 'Scabal', paisOrigen: 'Reino Unido', descripcion: 'Pañería de Savile Row con lanas Super 130s a Super 180s' },
      { nombre: 'Massimo Dutti', paisOrigen: 'España', descripcion: 'Sastrería contemporánea elegante y smart casual refinado' },
      { nombre: 'Hackett London', paisOrigen: 'Reino Unido', descripcion: 'Estilo británico tradicional y blazers de etiqueta' },
      { nombre: 'Loake 1880', paisOrigen: 'Reino Unido', descripcion: 'Calzado Oxford y Derby artesanal cosido Goodyear Welt' },
      { nombre: 'Tom Ford', paisOrigen: 'Estados Unidos', descripcion: 'Esmóquines teatrales, solapas anchas en satín y lujo audaz' },
    ];
    const marcaMap: Record<string, Marca> = {};
    for (const m of marcasData) {
      let marca = await this.marcaRepo.findOne({ where: { nombre: m.nombre } });
      if (!marca) marca = await this.marcaRepo.save(this.marcaRepo.create(m));
      marcaMap[m.nombre] = marca;
    }

    // 7. CATEGORÍAS
    const categoriasData = [
      {
        nombre: 'Trajes & Esmóquines',
        descripcion: 'Trajes de dos y tres piezas, esmóquines de etiqueta y smoking jackets confeccionados en pura lana virgen',
        imagen: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600',
      },
      {
        nombre: 'Blazers & Sacos Sport',
        descripcion: 'Blazers entallados, sacos sport en lino, lana fría y terciopelo para ocasiones semiformales y ejecutivas',
        imagen: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600',
      },
      {
        nombre: 'Pantalones de Vestir & Chinos',
        descripcion: 'Pantalones con pinzas, corte tailored slim en lana Super 120s y chinos formales de algodón peinado',
        imagen: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600',
      },
      {
        nombre: 'Camisas de Etiqueta & Gala',
        descripcion: 'Camisas en algodón egipcio 100%, cuellos francés, italiano y smoking con puños dobles para gemelos',
        imagen: 'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?q=80&w=600',
      },
      {
        nombre: 'Calzado Formal de Cuero',
        descripcion: 'Zapatos Oxford de puntera recta, Derby ingleses, Monkstrap de doble hebilla y Loafers en cuero genuino',
        imagen: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=600',
      },
      {
        nombre: 'Accesorios de Etiqueta',
        descripcion: 'Corbatas de seda natural italiana jacquard, corbatines de moño, tirantes, gemelos/mancuernillas y pañuelos',
        imagen: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?q=80&w=600',
      },
      {
        nombre: 'Abrigos & Sobretodos',
        descripcion: 'Sobretodos Chesterfield, abrigos de botonadura doble y gabardinas elegantes de cachemira y lana melton',
        imagen: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=600',
      },
      {
        nombre: 'Chalecos de Etiqueta',
        descripcion: 'Chalecos a juego y en contraste para trajes de 3 piezas, ceremonias de gala y enlaces nupciales',
        imagen: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?q=80&w=600',
      },
    ];
    const catMap: Record<string, Categoria> = {};
    for (const c of categoriasData) {
      let cat = await this.categoriaRepo.findOne({ where: { nombre: c.nombre } });
      if (!cat) cat = await this.categoriaRepo.save(this.categoriaRepo.create(c));
      else if (!cat.imagen) {
        cat.imagen = c.imagen;
        await this.categoriaRepo.save(cat);
      }
      catMap[c.nombre] = cat;
    }

    // 8. PROMOCIONES
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    let promoBodas = await this.promocionRepo.findOne({ where: { nombre: 'Temporada Gala & Ceremonias' } });
    if (!promoBodas) {
      promoBodas = await this.promocionRepo.save(
        this.promocionRepo.create({
          nombre: 'Temporada Gala & Ceremonias',
          descripcion: '15% de descuento exclusivo en trajes de gala, esmóquines y calzado de etiqueta seleccionado',
          descuento: 15.0,
          fechaInicio: now,
          fechaFin: endOfYear,
          estado: true,
        }),
      );
    }

    let promoBlazers = await this.promocionRepo.findOne({ where: { nombre: 'Festival del Blazer & Saco Sport' } });
    if (!promoBlazers) {
      promoBlazers = await this.promocionRepo.save(
        this.promocionRepo.create({
          nombre: 'Festival del Blazer & Saco Sport',
          descripcion: '20% de descuento en la colección completa de blazers de lino y sacos sport entallados',
          descuento: 20.0,
          fechaInicio: now,
          fechaFin: endOfYear,
          estado: true,
        }),
      );
    }

    // 9. PRENDAS / PRODUCTOS DE ALTA CONFECCIÓN
    const productosData = [
      // --- TRAJES & ESMÓQUINES ---
      {
        nombre: 'Traje Dos Piezas Lana Super 130s Slim Fit',
        descripcion: 'Confeccionado en selecta lana virgen Super 130s con forro en cupro transpirable. Solapa clásica de muesca, chaqueta de dos botones y pantalón a juego con pretina reforzada.',
        codigo: 'TRJ-ZEG-001',
        precioCompra: 1250.0,
        precioVenta: 2450.0,
        stock: 14,
        stockMinimo: 3,
        talla: '40R',
        color: 'Azul Marino Imperial',
        material: 'Lana Super 130s',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096390996-269969515.jpg',
        cat: 'Trajes & Esmóquines',
        marca: 'Ermenegildo Zegna',
        prov: 'Sartoria Milano SpA',
        promo: promoBodas.id,
      },
      {
        nombre: 'Esmóquin Black Tie de Solapa Chal Satín',
        descripcion: 'Traje de etiqueta rigurosa para galas y cenas de estado. Chaqueta con solapa chal forrada en satín brillante, botón forrado y pantalón con galón lateral de seda.',
        codigo: 'SMK-TF-002',
        precioCompra: 1800.0,
        precioVenta: 3600.0,
        stock: 8,
        stockMinimo: 2,
        talla: '42R',
        color: 'Negro Azabache',
        material: 'Lana Super 150s & Seda',
        corte: 'Tailored Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096381054-833845484.jpg',
        cat: 'Trajes & Esmóquines',
        marca: 'Tom Ford',
        prov: 'Sartoria Milano SpA',
        promo: promoBodas.id,
      },
      {
        nombre: 'Traje Tres Piezas Príncipe de Gales con Chaleco',
        descripcion: 'Conjunto completo compuesto por americana estructurada, chaleco cruzado de cinco botones y pantalón recto en sutil estampado Príncipe de Gales inglés.',
        codigo: 'TRJ-SCA-003',
        precioCompra: 1450.0,
        precioVenta: 2890.0,
        stock: 10,
        stockMinimo: 2,
        talla: '38R',
        color: 'Gris Marengo',
        material: 'Lana Inglesa Peinada',
        corte: 'Classic Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096371857-499884200.jpg',
        cat: 'Trajes & Esmóquines',
        marca: 'Scabal',
        prov: 'Scabal Savile Row Clothiers',
        promo: null,
      },
      {
        nombre: 'Traje Ejecutivo Modern Fit Raya Diplomática',
        descripcion: 'Traje corporativo por excelencia con raya diplomática tiza sobre fondo azul medianoche. Tejido repelente al agua y antiarrugas idóneo para viajes de negocios.',
        codigo: 'TRJ-HUG-004',
        precioCompra: 1100.0,
        precioVenta: 2150.0,
        stock: 15,
        stockMinimo: 4,
        talla: '40L',
        color: 'Azul Medianoche',
        material: 'Lana Fría Stretch',
        corte: 'Modern Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096362617-770463633.jpg',
        cat: 'Trajes & Esmóquines',
        marca: 'Hugo Boss',
        prov: 'Textiles Andinos & Confección Fina S.A.',
        promo: null,
      },
      {
        nombre: 'Traje Sastre Femenino Pantalón y Blazer Entallado',
        descripcion: 'Diseño femenino de alta sastrería con blazer cruzado de hombros definidos y pantalón palazzo fluido en lana fría italiana con caída impecable.',
        codigo: 'TRJ-ARM-005',
        precioCompra: 1300.0,
        precioVenta: 2580.0,
        stock: 9,
        stockMinimo: 2,
        talla: '38 / M',
        color: 'Blanco Ópalo',
        material: 'Lana Fría & Viscosa Noble',
        corte: 'Tailored Fit',
        genero: 'Damas',
        imagen: '/uploads/prenda-1795096351035-602868688.jpg',
        cat: 'Trajes & Esmóquines',
        marca: 'Giorgio Armani',
        prov: 'Sartoria Milano SpA',
        promo: promoBodas.id,
      },

      // --- BLAZERS & SACOS SPORT ---
      {
        nombre: 'Blazer de Terciopelo de Seda para Noche',
        descripcion: 'Exclusivo saco en suntuoso terciopelo de seda carmesí oscuro, solapa en pico con ribete satinado y forro de jacquard dorado bordado a mano.',
        codigo: 'BLZ-RL-006',
        precioCompra: 950.0,
        precioVenta: 1890.0,
        stock: 11,
        stockMinimo: 2,
        talla: '40R',
        color: 'Borgoña / Vino Tinto',
        material: 'Terciopelo de Seda',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096338039-167598438.jpg',
        cat: 'Blazers & Sacos Sport',
        marca: 'Ralph Lauren Purple Label',
        prov: 'Sartoria Milano SpA',
        promo: promoBlazers.id,
      },
      {
        nombre: 'Blazer Italiano Desestructurado en Lino Puro',
        descripcion: 'Chaqueta ligera sin forro interior con hombrera napolitana camisa. Perfecta para climas templados, bodas de día y eventos semiformales distinguidos.',
        codigo: 'BLZ-CAN-007',
        precioCompra: 780.0,
        precioVenta: 1540.0,
        stock: 16,
        stockMinimo: 3,
        talla: '38R',
        color: 'Arena / Beige Tostado',
        material: 'Lino Italiano 100%',
        corte: 'Tailored Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096327491-587974967.jpg',
        cat: 'Blazers & Sacos Sport',
        marca: 'Canali',
        prov: 'Sartoria Milano SpA',
        promo: promoBlazers.id,
      },
      {
        nombre: 'Saco Sport Cuadros Ventana British Wool',
        descripcion: 'Blazer de inspiración campera británica con estampado ventana ocre sobre fondo verde bosque. Botones de cuerno genuino y coderas en gamuza suave.',
        codigo: 'BLZ-HAC-008',
        precioCompra: 820.0,
        precioVenta: 1620.0,
        stock: 12,
        stockMinimo: 2,
        talla: '42R',
        color: 'Verde Botella / Bosque',
        material: 'Lana Tweed Británica',
        corte: 'Classic Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096296018-796695946.jpg',
        cat: 'Blazers & Sacos Sport',
        marca: 'Hackett London',
        prov: 'Scabal Savile Row Clothiers',
        promo: promoBlazers.id,
      },
      {
        nombre: 'Blazer Cruzado Seis Botones Acento Dorado',
        descripcion: 'Blazer náutico de botonadura doble cruzada con botones de latón dorado labrado. Corte sobrio y estilizado con aberturas traseras dobles.',
        codigo: 'BLZ-MD-009',
        precioCompra: 720.0,
        precioVenta: 1420.0,
        stock: 14,
        stockMinimo: 3,
        talla: '40R',
        color: 'Azul Marino Profundo',
        material: 'Lana Fría & Poliéster Fino',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096283969-297317698.jpg',
        cat: 'Blazers & Sacos Sport',
        marca: 'Massimo Dutti',
        prov: 'Distribuidora Textil Del Prado',
        promo: promoBlazers.id,
      },

      // --- PANTALONES DE VESTIR & CHINOS ---
      {
        nombre: 'Pantalón de Vestir Clásico con Pinzas y Ajustadores Laterales',
        descripcion: 'Confeccionado sin presillas para cinturón, cuenta con elegantes ceñidores laterales de hebilla metálica. Pliegue central marcado y dobladillo ciego.',
        codigo: 'PNT-ZEG-010',
        precioCompra: 340.0,
        precioVenta: 680.0,
        stock: 22,
        stockMinimo: 4,
        talla: '32',
        color: 'Gris Carbón',
        material: 'Lana Super 120s',
        corte: 'Classic Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096269099-610615684.jpg',
        cat: 'Pantalones de Vestir & Chinos',
        marca: 'Ermenegildo Zegna',
        prov: 'Sartoria Milano SpA',
        promo: null,
      },
      {
        nombre: 'Pantalón Formal Slim Fit Flat Front',
        descripcion: 'Corte frontal liso sin pinzas con pernera cónica moderna. Tejido flexible de lana con un 2% de elastano que garantiza confort durante todo el día laboral.',
        codigo: 'PNT-HUG-011',
        precioCompra: 310.0,
        precioVenta: 620.0,
        stock: 25,
        stockMinimo: 5,
        talla: '34',
        color: 'Azul Noche',
        material: 'Lana Stretch',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096256891-442047510.jpg',
        cat: 'Pantalones de Vestir & Chinos',
        marca: 'Hugo Boss',
        prov: 'Textiles Andinos & Confección Fina S.A.',
        promo: null,
      },
      {
        nombre: 'Pantalón Chino Formal de Algodón Peinado Satinado',
        descripcion: 'Chino de acabado pulcro con brillo satinado sutil. Bolsillos posteriores de vivo con botón y cierre reforzado. La opción idónea para atuendos business casual.',
        codigo: 'PNT-BRK-012',
        precioCompra: 260.0,
        precioVenta: 520.0,
        stock: 20,
        stockMinimo: 4,
        talla: '32',
        color: 'Caqui Claro',
        material: 'Algodón Pima 98% / Elastano 2%',
        corte: 'Tailored Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096244246-215353154.jpg',
        cat: 'Pantalones de Vestir & Chinos',
        marca: 'Brooks Brothers',
        prov: 'Distribuidora Textil Del Prado',
        promo: null,
      },

      // --- CAMISAS DE ETIQUETA & GALA ---
      {
        nombre: 'Camisa Gala Pechera Plisada Cuello Smoking',
        descripcion: 'Diseñada específicamente para vestir con esmóquin. Pechera frontal con alforzas finas, cuello pajarita almidonado y puños franceses dobles.',
        codigo: 'CAM-BRK-013',
        precioCompra: 280.0,
        precioVenta: 560.0,
        stock: 20,
        stockMinimo: 4,
        talla: 'M (40)',
        color: 'Blanco Nieve',
        material: 'Algodón Egipcio 120/2',
        corte: 'Tailored Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096232927-84347267.jpg',
        cat: 'Camisas de Etiqueta & Gala',
        marca: 'Brooks Brothers',
        prov: 'Scabal Savile Row Clothiers',
        promo: promoBodas.id,
      },
      {
        nombre: 'Camisa Ejecutiva Cuello Cutaway Francés',
        descripcion: 'Camisa formal con cuello abierto amplio ideal para nudos de corbata Windsor enteros. Tejido en sarga fina transpirable con botones de nácar natural.',
        codigo: 'CAM-ZEG-014',
        precioCompra: 260.0,
        precioVenta: 510.0,
        stock: 24,
        stockMinimo: 5,
        talla: 'L (42)',
        color: 'Azul Celeste Cielo',
        material: 'Algodón Sea Island',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096219128-559800295.jpg',
        cat: 'Camisas de Etiqueta & Gala',
        marca: 'Ermenegildo Zegna',
        prov: 'Sartoria Milano SpA',
        promo: null,
      },
      {
        nombre: 'Camisa Oxford Blanca Premium Cuello Italiano',
        descripcion: 'La camisa blanca esencial en todo guardarropa de etiqueta. Cuello italiano semi-rígido con ballenas extraíbles y costuras microscópicas de alta densidad.',
        codigo: 'CAM-HUG-015',
        precioCompra: 230.0,
        precioVenta: 460.0,
        stock: 30,
        stockMinimo: 6,
        talla: 'M (40)',
        color: 'Blanco Oxford',
        material: 'Algodón Popelina 100%',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096203006-266096829.jpg',
        cat: 'Camisas de Etiqueta & Gala',
        marca: 'Hugo Boss',
        prov: 'Textiles Andinos & Confección Fina S.A.',
        promo: null,
      },

      // --- CALZADO FORMAL DE CUERO ---
      {
        nombre: 'Zapatos Oxford Balmoral de Puntera Recta en Cuero Box Calf',
        descripcion: 'El calzado más formal por excelencia. Construcción cosida Goodyear Welt con suela de cuero curtido al roble. Puntera recta pespunteada y acabado pulido espejo.',
        codigo: 'CAL-LOA-016',
        precioCompra: 650.0,
        precioVenta: 1290.0,
        stock: 15,
        stockMinimo: 3,
        talla: '42',
        color: 'Negro Pulido',
        material: 'Cuero Box Calf Francés Genuino',
        corte: 'Horma Clásica Inglesa',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096191014-7550154.jpg',
        cat: 'Calzado Formal de Cuero',
        marca: 'Loake 1880',
        prov: 'Iberian Footwear Guild',
        promo: promoBodas.id,
      },
      {
        nombre: 'Zapatos Double Monkstrap con Hebillas de Plata',
        descripcion: 'Zapatos de vestir con doble cierre de hebilla metálica plateada. Cuero plena flor con pátina artesanal envejecida en tonos tabaco tostado.',
        codigo: 'CAL-FER-017',
        precioCompra: 720.0,
        precioVenta: 1450.0,
        stock: 12,
        stockMinimo: 2,
        talla: '41',
        color: 'Café Tabaco Antiguo',
        material: 'Cuero Plena Flor Curtido',
        corte: 'Horma Italiana Estilizada',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096176962-800403114.jpg',
        cat: 'Calzado Formal de Cuero',
        marca: 'Salvatore Ferragamo',
        prov: 'Iberian Footwear Guild',
        promo: null,
      },
      {
        nombre: 'Mocasines Penny Loafers en Cuero Burdeos',
        descripcion: 'Mocasín de antifaz clásico con plantilla anatómica acolchada. Versátiles para combinarse con traje sin corbata o pantalones chinos formales.',
        codigo: 'CAL-MD-018',
        precioCompra: 480.0,
        precioVenta: 960.0,
        stock: 18,
        stockMinimo: 3,
        talla: '43',
        color: 'Burdeos / Guinda Profundo',
        material: 'Cuero Flor Natural',
        corte: 'Mocasín Artesanal',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096161905-938826972.jpg',
        cat: 'Calzado Formal de Cuero',
        marca: 'Massimo Dutti',
        prov: 'Iberian Footwear Guild',
        promo: null,
      },
      {
        nombre: 'Zapatos Derby Brogue Semientero en Cuero Avellana',
        descripcion: 'Zapato con picado tipo brogue decorativo en cordonera y puntera. Suela doble resistente y construcción de máxima durabilidad.',
        codigo: 'CAL-LOA-019',
        precioCompra: 590.0,
        precioVenta: 1180.0,
        stock: 14,
        stockMinimo: 3,
        talla: '40',
        color: 'Marrón Avellana',
        material: 'Cuero Ternera Curtido',
        corte: 'Horma Británica',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096137563-168393424.jpg',
        cat: 'Calzado Formal de Cuero',
        marca: 'Loake 1880',
        prov: 'Iberian Footwear Guild',
        promo: null,
      },

      // --- ACCESORIOS DE ETIQUETA ---
      {
        nombre: 'Corbata Siete Pliegues en Seda Italiana Jacquard',
        descripcion: 'La cúspide de la corbatería: doblada a mano en siete pliegues de seda de Como sin entretela sintética, garantizando una caída y nudo perfectos.',
        codigo: 'ACC-ZEG-020',
        precioCompra: 120.0,
        precioVenta: 240.0,
        stock: 35,
        stockMinimo: 5,
        talla: 'Única (8.5 cm)',
        color: 'Azul Zafiro Paisley',
        material: 'Seda Pura 100%',
        corte: 'Ancho Clásico 8.5 cm',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096120262-696133238.jpg',
        cat: 'Accesorios de Etiqueta',
        marca: 'Ermenegildo Zegna',
        prov: 'Silk & Elegance Accessories Co.',
        promo: null,
      },
      {
        nombre: 'Juego de Gemelos de Plata de Ley y Ónix Negro',
        descripcion: 'Par de mancuernillas/gemelos en plata 925 maciza con incrustación circular de piedra ónix negro pulido. Cierre giratorio seguro de cola de ballena.',
        codigo: 'ACC-TF-021',
        precioCompra: 160.0,
        precioVenta: 320.0,
        stock: 25,
        stockMinimo: 4,
        talla: 'Única',
        color: 'Plata & Negro Ónix',
        material: 'Plata de Ley 925 & Ónix',
        corte: 'Accesorios de Gala',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096110129-855556690.jpg',
        cat: 'Accesorios de Etiqueta',
        marca: 'Tom Ford',
        prov: 'Silk & Elegance Accessories Co.',
        promo: promoBodas.id,
      },
      {
        nombre: 'Corbatín de Moño Pajarita de Seda para Atar',
        descripcion: 'Moño de seda pura negra para anudar a mano (self-tie), con sistema de regulación milimétrica en el cuello. El complemento indispensable del frac y smoking.',
        codigo: 'ACC-BRK-022',
        precioCompra: 90.0,
        precioVenta: 180.0,
        stock: 28,
        stockMinimo: 5,
        talla: 'Ajustable',
        color: 'Negro Satinado',
        material: 'Seda Italiana Pura',
        corte: 'Pajarita Mariposa',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096099220-134948596.jpg',
        cat: 'Accesorios de Etiqueta',
        marca: 'Brooks Brothers',
        prov: 'Silk & Elegance Accessories Co.',
        promo: null,
      },
      {
        nombre: 'Tirantes de Seda de Etiqueta con Pasadores de Cuero',
        descripcion: 'Tirantes de cinta elástica de seda con remates y terminales en cuero vacuno blanco para botones interiores de pantalón. Herrajes dorados inoxidables.',
        codigo: 'ACC-HAC-023',
        precioCompra: 110.0,
        precioVenta: 220.0,
        stock: 22,
        stockMinimo: 4,
        talla: 'Ajustable',
        color: 'Blanco Marfil / Negro',
        material: 'Seda Elástica & Cuero',
        corte: 'Espalda en Y',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096085444-102876860.jpg',
        cat: 'Accesorios de Etiqueta',
        marca: 'Hackett London',
        prov: 'Silk & Elegance Accessories Co.',
        promo: null,
      },

      // --- ABRIGOS & SOBRETODOS ---
      {
        nombre: 'Sobretodo Chesterfield de Lana Melton y Cuello de Terciopelo',
        descripcion: 'El abrigo formal inglés por excelencia. Confeccionado en paño grueso de lana melton resistente al viento y lluvia, con cuello superior forrado en terciopelo negro.',
        codigo: 'ABR-SCA-024',
        precioCompra: 1400.0,
        precioVenta: 2750.0,
        stock: 8,
        stockMinimo: 2,
        talla: '42R',
        color: 'Gris Marengo Oscuro',
        material: 'Lana Melton 90% / Cachemira 10%',
        corte: 'Tailored Overcoat',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096044510-90005905.jpg',
        cat: 'Abrigos & Sobretodos',
        marca: 'Scabal',
        prov: 'Scabal Savile Row Clothiers',
        promo: null,
      },
      {
        nombre: 'Gabardina Trench Coat Cruzada Impermeable',
        descripcion: 'Trench coat clásico de botonadura doble, cinturón con anillas D metálicas, solapas anchas antitormenta y forro desmontable térmico en tartán clásico.',
        codigo: 'ABR-BRK-025',
        precioCompra: 980.0,
        precioVenta: 1950.0,
        stock: 10,
        stockMinimo: 2,
        talla: '40R',
        color: 'Miel / Beige Inglés',
        material: 'Gabardina de Algodón Hidrófugo',
        corte: 'Classic Trench',
        genero: 'Unisex',
        imagen: '/uploads/prenda-1795096032162-402429580.jpg',
        cat: 'Abrigos & Sobretodos',
        marca: 'Brooks Brothers',
        prov: 'Textiles Andinos & Confección Fina S.A.',
        promo: null,
      },

      // --- CHALECOS DE ETIQUETA ---
      {
        nombre: 'Chaleco de Etiqueta Cruzado de Seis Botones en Jacquard',
        descripcion: 'Chaleco de ceremonia con solapa redondeada de muesca, espalda forrada en cupro con ceñidor de ajuste posterior. Ideal para novios y padrinos de boda.',
        codigo: 'CHL-CAN-026',
        precioCompra: 240.0,
        precioVenta: 480.0,
        stock: 18,
        stockMinimo: 3,
        talla: '40R',
        color: 'Gris Perla Plateado',
        material: 'Jacquard de Seda & Lana',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795096021094-52196608.jpg',
        cat: 'Chalecos de Etiqueta',
        marca: 'Canali',
        prov: 'Sartoria Milano SpA',
        promo: promoBodas.id,
      },

      // --- NUEVAS PRENDAS & ACCESORIOS SARTORIALES (EXPANSIÓN DEL CATÁLOGO A 50+ PRENDAS) ---
      {
        nombre: 'Traje Cruzado Sartorial Seis Botones en Franela Gris',
        descripcion: 'Paño de franela de lana virgen de Biella, solapa de lanza ancha (peak lapel), hombrera natural y caída invernal refinada con botones de cuerno quemado.',
        codigo: 'TRJ-CAN-027',
        precioCompra: 1400.0,
        precioVenta: 2780.0,
        stock: 12,
        stockMinimo: 2,
        talla: '42R',
        color: 'Gris Ceniza',
        material: 'Franela de Lana Super 120s',
        corte: 'Tailored Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795095943680-488450095.jpg',
        cat: 'Trajes & Esmóquines',
        marca: 'Canali',
        prov: 'Sartoria Milano SpA',
        promo: null,
      },
      {
        nombre: 'Smoking Jacket Terciopelo Azul Medianoche con Solapa Moaré',
        descripcion: 'Chaqueta de esmóquin para club o cena privada, botonadura sencilla con botón de nácar forrado y vivos de seda en bolsillos de vivo.',
        codigo: 'SMK-ARM-028',
        precioCompra: 1650.0,
        precioVenta: 3290.0,
        stock: 8,
        stockMinimo: 2,
        talla: '40R',
        color: 'Azul Noche Medianoche',
        material: 'Terciopelo de Algodón & Seda',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795095000626-119577702.jpg',
        cat: 'Trajes & Esmóquines',
        marca: 'Giorgio Armani',
        prov: 'Sartoria Milano SpA',
        promo: promoBodas.id,
      },
      {
        nombre: 'Frac de Gala White Tie Formal de Máxima Etiqueta',
        descripcion: 'El máximo exponente del protocolo ceremonial y de cortejo. Chaqueta corta por delante con faldones posteriores y botones forrados en grosgrain.',
        codigo: 'TRJ-RL-029',
        precioCompra: 2100.0,
        precioVenta: 4200.0,
        stock: 6,
        stockMinimo: 1,
        talla: '42L',
        color: 'Negro Riguroso',
        material: 'Lana Barathea Inglesa',
        corte: 'Classic Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094986830-598758937.jpg',
        cat: 'Trajes & Esmóquines',
        marca: 'Ralph Lauren Purple Label',
        prov: 'Scabal Savile Row Clothiers',
        promo: null,
      },
      {
        nombre: 'Traje Micro-Pata de Gallo en Lana Super 150s & Cachemira',
        descripcion: 'Estampado micro-houndstooth negro y marfil. Tejido de tacto extremadamente sedoso con acabado lustroso natural para cócteles y recepciones.',
        codigo: 'TRJ-SCA-030',
        precioCompra: 1550.0,
        precioVenta: 3100.0,
        stock: 9,
        stockMinimo: 2,
        talla: '40R',
        color: 'Pata de Gallo Negro/Marfil',
        material: 'Lana Super 150s & Cachemira',
        corte: 'Tailored Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094969503-947965718.jpg',
        cat: 'Trajes & Esmóquines',
        marca: 'Scabal',
        prov: 'Scabal Savile Row Clothiers',
        promo: null,
      },
      {
        nombre: 'Blazer Safari Hopsack en Lana Tejido Abierto',
        descripcion: 'Chaqueta de verano en textura panamá/hopsack ultra transpirable y resistente a las arrugas con botones de cuerno natural quemado.',
        codigo: 'BLZ-ZEG-031',
        precioCompra: 890.0,
        precioVenta: 1780.0,
        stock: 14,
        stockMinimo: 3,
        talla: '40R',
        color: 'Café Caramelo',
        material: 'Lana Hopsack High Performance',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094958700-188013782.jpg',
        cat: 'Blazers & Sacos Sport',
        marca: 'Ermenegildo Zegna',
        prov: 'Sartoria Milano SpA',
        promo: promoBlazers.id,
      },
      {
        nombre: 'Saco Smoking de Jacquard Floral Barroco',
        descripcion: 'Blazer de fiesta y alta costura con tejido jacquard tono sobre tono con destellos satinados. Solapa en satén negro satinado.',
        codigo: 'BLZ-ARM-032',
        precioCompra: 1100.0,
        precioVenta: 2190.0,
        stock: 8,
        stockMinimo: 2,
        talla: '38R',
        color: 'Negro / Grafito Barroco',
        material: 'Jacquard de Seda & Microfibra',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094886201-976966866.jpg',
        cat: 'Blazers & Sacos Sport',
        marca: 'Giorgio Armani',
        prov: 'Sartoria Milano SpA',
        promo: promoBlazers.id,
      },
      {
        nombre: 'Blazer Smart Casual Gris Plata Microestructura',
        descripcion: 'Chaqueta versátil de media estación con forro semi-desestructurado, hombreras suaves y bolsillos de parche italianos.',
        codigo: 'BLZ-HUG-033',
        precioCompra: 760.0,
        precioVenta: 1490.0,
        stock: 15,
        stockMinimo: 3,
        talla: '42R',
        color: 'Gris Plata',
        material: 'Mezcla de Lana & Seda',
        corte: 'Modern Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094866252-303971774.jpg',
        cat: 'Blazers & Sacos Sport',
        marca: 'Hugo Boss',
        prov: 'Distribuidora Textil Del Prado',
        promo: promoBlazers.id,
      },
      {
        nombre: 'Blazer Cruzado en Lana Cuadros Príncipe de Gales Azul',
        descripcion: 'Americana formal cruzada con solapas pronunciadas y botones de nácar pulido. Clásica silueta italiana entallada en cintura.',
        codigo: 'BLZ-CAN-034',
        precioCompra: 920.0,
        precioVenta: 1850.0,
        stock: 11,
        stockMinimo: 2,
        talla: '40R',
        color: 'Azul Cobalto a Cuadros',
        material: 'Pura Lana Italiana Super 130s',
        corte: 'Tailored Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094853042-639052164.jpg',
        cat: 'Blazers & Sacos Sport',
        marca: 'Canali',
        prov: 'Sartoria Milano SpA',
        promo: promoBlazers.id,
      },
      {
        nombre: 'Pantalón de Etiqueta Pretina Alta Gurkha en Lana Fría',
        descripcion: 'Inspirado en la sastrería militar clásica británica con doble hebilla de cincha cruzada en cintura alta, doble pinza profunda y caída regia.',
        codigo: 'PNT-CAN-035',
        precioCompra: 360.0,
        precioVenta: 720.0,
        stock: 20,
        stockMinimo: 4,
        talla: '32',
        color: 'Marfil / Arena',
        material: 'Lana Fría 100%',
        corte: 'Tailored Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094828131-316666082.jpg',
        cat: 'Pantalones de Vestir & Chinos',
        marca: 'Canali',
        prov: 'Sartoria Milano SpA',
        promo: null,
      },
      {
        nombre: 'Pantalón Tartán Black Watch Formal con Galón',
        descripcion: 'Pantalón de cortejo y etiqueta escocesa en paño de lana pura con diseño de cuadros azul noche y verde oscuro.',
        codigo: 'PNT-SCA-036',
        precioCompra: 390.0,
        precioVenta: 780.0,
        stock: 18,
        stockMinimo: 3,
        talla: '34',
        color: 'Verde & Azul Black Watch',
        material: 'Lana Tartán Escocesa',
        corte: 'Classic Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094801609-709326988.jpg',
        cat: 'Pantalones de Vestir & Chinos',
        marca: 'Scabal',
        prov: 'Scabal Savile Row Clothiers',
        promo: null,
      },
      {
        nombre: 'Pantalón de Vestir Regular Fit en Lana Marengo',
        descripcion: 'Pantalón básico de oficina y juntas de directorio. Sin pinzas frontales, tiro medio confortable y forro interior hasta la rodilla.',
        codigo: 'PNT-MD-037',
        precioCompra: 290.0,
        precioVenta: 580.0,
        stock: 24,
        stockMinimo: 5,
        talla: '32',
        color: 'Gris Plomo',
        material: 'Lana Super 110s & Elastano',
        corte: 'Classic Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094786494-308110312.jpg',
        cat: 'Pantalones de Vestir & Chinos',
        marca: 'Massimo Dutti',
        prov: 'Distribuidora Textil Del Prado',
        promo: null,
      },
      {
        nombre: 'Pantalón de Esmoquin Smoking con Vivos de Seda',
        descripcion: 'Pantalón de rigurosa etiqueta negra con franja lateral simple en satén de seda, sin trabillas y botones interiores para tirantes.',
        codigo: 'PNT-RL-038',
        precioCompra: 450.0,
        precioVenta: 890.0,
        stock: 16,
        stockMinimo: 3,
        talla: '34',
        color: 'Negro Profundo',
        material: 'Lana Virgen & Satén de Seda',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094774452-925643477.jpg',
        cat: 'Pantalones de Vestir & Chinos',
        marca: 'Ralph Lauren Purple Label',
        prov: 'Sartoria Milano SpA',
        promo: promoBodas.id,
      },
      {
        nombre: 'Camisa de Gala Cuello Barba Formal con Pasador Pin Collar',
        descripcion: 'Camisa exclusiva con ojales en las puntas del cuello para barra o pasador metálico plateado que levanta el nudo de la corbata con prestancia.',
        codigo: 'CAM-TF-039',
        precioCompra: 320.0,
        precioVenta: 640.0,
        stock: 18,
        stockMinimo: 4,
        talla: 'M (40)',
        color: 'Blanco Puro Almidonado',
        material: 'Algodón Suizo 140/2',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094759143-232978930.jpg',
        cat: 'Camisas de Etiqueta & Gala',
        marca: 'Tom Ford',
        prov: 'Sartoria Milano SpA',
        promo: promoBodas.id,
      },
      {
        nombre: 'Camisa de Vestir a Rayas Bengal Azul y Blanco',
        descripcion: 'Clásica camisa ejecutiva de raya fina vertical, cuello semitaliano y puño simple redondeado de dos botones ajustables.',
        codigo: 'CAM-CAN-040',
        precioCompra: 270.0,
        precioVenta: 530.0,
        stock: 22,
        stockMinimo: 4,
        talla: 'L (42)',
        color: 'Rayas Bengal Azul/Blanco',
        material: 'Algodón Egipcio Giza 87',
        corte: 'Tailored Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094745628-595555550.jpg',
        cat: 'Camisas de Etiqueta & Gala',
        marca: 'Canali',
        prov: 'Sartoria Milano SpA',
        promo: null,
      },
      {
        nombre: 'Camisa Formal Cuello Redondo Club Collar Vintage',
        descripcion: 'Cuello redondo clásico aristocrático inglés de los años 1920 con puños dobles franceses para mancuernillas.',
        codigo: 'CAM-RL-041',
        precioCompra: 290.0,
        precioVenta: 570.0,
        stock: 19,
        stockMinimo: 4,
        talla: 'M (40)',
        color: 'Celeste Oxford Claro',
        material: 'Algodón Fil-à-Fil',
        corte: 'Tailored Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094733337-320984297.jpg',
        cat: 'Camisas de Etiqueta & Gala',
        marca: 'Ralph Lauren Purple Label',
        prov: 'Scabal Savile Row Clothiers',
        promo: null,
      },
      {
        nombre: 'Camisa Formal Negra de Etiqueta Cuello Francés',
        descripcion: 'Camisa de satén de algodón negro azabache de textura lisa y caída nocturna para eventos contemporáneos sin corbata.',
        codigo: 'CAM-MD-042',
        precioCompra: 220.0,
        precioVenta: 440.0,
        stock: 25,
        stockMinimo: 5,
        talla: 'S (38)',
        color: 'Negro Azabache',
        material: 'Algodón Satinado',
        corte: 'Slim Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094718599-300826375.jpg',
        cat: 'Camisas de Etiqueta & Gala',
        marca: 'Massimo Dutti',
        prov: 'Distribuidora Textil Del Prado',
        promo: null,
      },
      {
        nombre: 'Zapatos Oxford Wholecut Enterizos de Una Sola Pieza',
        descripcion: 'La máxima artesanía en calzado formal: confeccionado a partir de una única pieza de cuero vacuno sin costuras laterales visibles.',
        codigo: 'CAL-FER-043',
        precioCompra: 790.0,
        precioVenta: 1590.0,
        stock: 14,
        stockMinimo: 3,
        talla: '42',
        color: 'Coñac / Tabaco Envejecido',
        material: 'Cuero Calfskin Curtido al Tanino',
        corte: 'Horma Wholecut Italiana',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094701029-421836035.jpg',
        cat: 'Calzado Formal de Cuero',
        marca: 'Salvatore Ferragamo',
        prov: 'Iberian Footwear Guild',
        promo: promoBodas.id,
      },
      {
        nombre: 'Zapatos Tassel Loafers con Borlas en Gamuza Ante Café',
        descripcion: 'Mocasín refinado con borlillas frontales cosidas a mano y cordonera perimetral trenzada. Excelente para blazers y trajes de lino.',
        codigo: 'CAL-LOA-044',
        precioCompra: 610.0,
        precioVenta: 1220.0,
        stock: 16,
        stockMinimo: 3,
        talla: '41',
        color: 'Café Chocolate Moka',
        material: 'Piel de Gamuza / Ante Tratado',
        corte: 'Horma Clásica Inglesa',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094686900-398370977.jpg',
        cat: 'Calzado Formal de Cuero',
        marca: 'Loake 1880',
        prov: 'Iberian Footwear Guild',
        promo: null,
      },
      {
        nombre: 'Botines Chelsea Boots en Cuero Pulido para Traje',
        descripcion: 'Bota formal de caña media con elásticos laterales y tira trasera. Suela de cuero de perfil fino que estiliza la línea del pantalón.',
        codigo: 'CAL-MD-045',
        precioCompra: 550.0,
        precioVenta: 1090.0,
        stock: 15,
        stockMinimo: 3,
        talla: '43',
        color: 'Negro Espejo',
        material: 'Cuero Vacuno Plena Flor',
        corte: 'Botín Formal',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094671487-650078846.jpg',
        cat: 'Calzado Formal de Cuero',
        marca: 'Massimo Dutti',
        prov: 'Iberian Footwear Guild',
        promo: null,
      },
      {
        nombre: 'Zapatos Derby de Pala Lisa en Charol de Gala',
        descripcion: 'Zapato de etiqueta con acabado en charol brillante reflectante de alta resistencia, diseñado específicamente para acompañar al esmóquin y al frac.',
        codigo: 'CAL-FER-046',
        precioCompra: 710.0,
        precioVenta: 1420.0,
        stock: 12,
        stockMinimo: 2,
        talla: '42',
        color: 'Negro Charol Brillante',
        material: 'Cuero con Acabado Charol Espejo',
        corte: 'Horma de Gala',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094655566-223571965.jpg',
        cat: 'Calzado Formal de Cuero',
        marca: 'Salvatore Ferragamo',
        prov: 'Iberian Footwear Guild',
        promo: promoBodas.id,
      },
      {
        nombre: 'Pañuelo de Bolsillo en Seda Italiana con Orillos Enrollados a Mano',
        descripcion: 'Pañuelo de 33x33 cm con ribete cosido a mano con diseño paisley persa en tonalidades oro viejo y azul cobalto.',
        codigo: 'ACC-ZEG-047',
        precioCompra: 80.0,
        precioVenta: 160.0,
        stock: 40,
        stockMinimo: 6,
        talla: 'Única (33x33 cm)',
        color: 'Oro Viejo & Azul Real',
        material: '100% Seda Twill',
        corte: 'Pañuelo de Bolsillo',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094639184-902838768.jpg',
        cat: 'Accesorios de Etiqueta',
        marca: 'Ermenegildo Zegna',
        prov: 'Silk & Elegance Accessories Co.',
        promo: null,
      },
      {
        nombre: 'Pasador / Pisacorbatas de Plata Esterlina y Rodio',
        descripcion: 'Clip para corbata con acabado moleteado diamantado y resorte de tensión suizo de sujeción firme sin perforar la seda.',
        codigo: 'ACC-TF-048',
        precioCompra: 130.0,
        precioVenta: 260.0,
        stock: 28,
        stockMinimo: 4,
        talla: '5.5 cm',
        color: 'Plata Rodiada',
        material: 'Plata de Ley 925',
        corte: 'Pisacorbata de Precisión',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094625403-256838516.jpg',
        cat: 'Accesorios de Etiqueta',
        marca: 'Tom Ford',
        prov: 'Silk & Elegance Accessories Co.',
        promo: null,
      },
      {
        nombre: 'Fajín de Satín Plisado de Gala para Smoking (Cummerbund)',
        descripcion: 'Fajín tradicional de esmóquin con cuatro pliegues ascendentes y ajuste elástico posterior de microfibra y satén de seda.',
        codigo: 'ACC-HAC-049',
        precioCompra: 140.0,
        precioVenta: 280.0,
        stock: 25,
        stockMinimo: 4,
        talla: 'Ajustable',
        color: 'Negro Satén',
        material: 'Satén de Seda & Faya',
        corte: 'Fajín Tradicional',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094616578-844108107.jpg',
        cat: 'Accesorios de Etiqueta',
        marca: 'Hackett London',
        prov: 'Silk & Elegance Accessories Co.',
        promo: promoBodas.id,
      },
      {
        nombre: 'Abrigo Capa de Paño de Cachemira Pura y Cuello Mao',
        descripcion: 'Pieza de alta costura de caída dramática y envolvente. Cuello alzado militar y cierre oculto con broches de asta.',
        codigo: 'ABR-ARM-050',
        precioCompra: 1950.0,
        precioVenta: 3890.0,
        stock: 7,
        stockMinimo: 1,
        talla: '42R',
        color: 'Negro Noche',
        material: '100% Cachemira Italiana',
        corte: 'Tailored Overcoat',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094607714-205581534.jpg',
        cat: 'Abrigos & Sobretodos',
        marca: 'Giorgio Armani',
        prov: 'Sartoria Milano SpA',
        promo: null,
      },
      {
        nombre: 'Chaleco Tradicional Inglés Solapa Redonda en Franela Crema',
        descripcion: 'Chaleco monocolor de boda diurna para lucir bajo chaqué o traje azul marina. Botones de cuerno crema y espalda de sarga transpirable.',
        codigo: 'CHL-SCA-051',
        precioCompra: 260.0,
        precioVenta: 520.0,
        stock: 18,
        stockMinimo: 3,
        talla: '40R',
        color: 'Blanco Crema / Marfil',
        material: 'Franela de Lana Melton Ligera',
        corte: 'Classic Fit',
        genero: 'Caballeros',
        imagen: '/uploads/prenda-1795094597134-397356412.jpg',
        cat: 'Chalecos de Etiqueta',
        marca: 'Scabal',
        prov: 'Scabal Savile Row Clothiers',
        promo: promoBodas.id,
      },
    ];

    const prodMap: Record<string, Producto> = {};
    for (const p of productosData) {
      let prod = await this.productoRepo.findOne({ where: { codigo: p.codigo } });
      const cat = catMap[p.cat];
      const marca = marcaMap[p.marca];
      const prov = provMap[p.prov];

      if (!prod) {
        prod = await this.productoRepo.save(
          this.productoRepo.create({
            nombre: p.nombre,
            descripcion: p.descripcion,
            codigo: p.codigo,
            precioCompra: p.precioCompra,
            precioVenta: p.precioVenta,
            stock: p.stock,
            stockMinimo: p.stockMinimo,
            talla: p.talla,
            color: p.color,
            material: p.material,
            corte: p.corte,
            genero: p.genero,
            imagen: p.imagen,
            estado: true,
            categoriaId: cat?.id,
            marcaId: marca?.id,
            proveedorId: prov?.id,
            promocionId: p.promo || null,
          }),
        );
      } else {
        // Preservar la imagen personalizada subida por el usuario y no sobreescribirla
        let modificado = false;
        if (!prod.imagen || prod.imagen.trim() === '') {
          prod.imagen = p.imagen;
          modificado = true;
        }
        if (!prod.talla) { prod.talla = p.talla; modificado = true; }
        if (!prod.color) { prod.color = p.color; modificado = true; }
        if (!prod.material) { prod.material = p.material; modificado = true; }
        if (!prod.corte) { prod.corte = p.corte; modificado = true; }
        if (!prod.genero) { prod.genero = p.genero; modificado = true; }
        if (modificado) {
          await this.productoRepo.save(prod);
        }
      }
      prodMap[p.codigo] = prod;
    }

    // 10. OUTFITS / COMBOS COMPLETOS CON PRENDAS ASOCIADAS
    const combosData = [
      {
        nombre: 'Outfit Gala Black Tie Completo',
        descripcion: 'Esmóquin de etiqueta Tom Ford + Camisa Smoking Pechera Plisada + Moño de Seda + Mancuernillas de Plata & Ónix + Calzado Oxford Balmoral.',
        codigo: 'OUTFIT-GALA-01',
        precioVenta: 5190.0, // Ahorro sobre compras individuales
        precioCompra: 2800.0,
        stock: 5,
        imagen: '/uploads/prenda-1795095980859-228778261.jpg',
        items: [
          { sku: 'SMK-TF-002', cantidad: 1 },
          { sku: 'CAM-BRK-013', cantidad: 1 },
          { sku: 'ACC-BRK-022', cantidad: 1 },
          { sku: 'ACC-TF-021', cantidad: 1 },
          { sku: 'CAL-LOA-016', cantidad: 1 },
        ],
      },
      {
        nombre: 'Look Ejecutivo Power Suit Sartorial',
        descripcion: 'Traje Lana Super 130s Zegna + Camisa Oxford Cuello Francés + Corbata Seda Siete Pliegues + Zapatos Double Monkstrap.',
        codigo: 'OUTFIT-EXEC-02',
        precioVenta: 4150.0,
        precioCompra: 2200.0,
        stock: 6,
        imagen: '/uploads/prenda-1795095969995-266519240.jpg',
        items: [
          { sku: 'TRJ-ZEG-001', cantidad: 1 },
          { sku: 'CAM-ZEG-014', cantidad: 1 },
          { sku: 'ACC-ZEG-020', cantidad: 1 },
          { sku: 'CAL-FER-017', cantidad: 1 },
        ],
      },
      {
        nombre: 'Colección Ceremonia & Novio Tres Piezas',
        descripcion: 'Traje Príncipe de Gales + Chaleco Jacquard de Seda + Camisa Blanca Almidonada + Corbatín + Zapatos Oxford.',
        codigo: 'OUTFIT-WED-03',
        precioVenta: 4680.0,
        precioCompra: 2450.0,
        stock: 5,
        imagen: '/uploads/prenda-1795095959219-325349682.jpg',
        items: [
          { sku: 'TRJ-SCA-003', cantidad: 1 },
          { sku: 'CHL-CAN-026', cantidad: 1 },
          { sku: 'CAM-HUG-015', cantidad: 1 },
          { sku: 'CAL-LOA-016', cantidad: 1 },
        ],
      },
      {
        nombre: 'Look Verano Riviera Italiana Lino & Loafers',
        descripcion: 'Blazer de lino puro Canali + Camisa cutaway italiana Zegna + Pantalón Gurkha arena + Mocasines borlas ante + Pañuelo de seda twill.',
        codigo: 'OUTFIT-SUMMER-04',
        precioVenta: 4250.0,
        precioCompra: 2200.0,
        stock: 5,
        imagen: '/uploads/prenda-1795094562716-605110109.jpg',
        items: [
          { sku: 'BLZ-CAN-007', cantidad: 1 },
          { sku: 'CAM-ZEG-014', cantidad: 1 },
          { sku: 'PNT-CAN-035', cantidad: 1 },
          { sku: 'CAL-LOA-044', cantidad: 1 },
          { sku: 'ACC-ZEG-047', cantidad: 1 },
        ],
      },
    ];

    for (const c of combosData) {
      let combo = await this.productoRepo.findOne({ where: { codigo: c.codigo } });
      if (!combo) {
        combo = await this.productoRepo.save(
          this.productoRepo.create({
            nombre: c.nombre,
            descripcion: c.descripcion,
            codigo: c.codigo,
            precioVenta: c.precioVenta,
            precioCompra: c.precioCompra,
            stock: c.stock,
            stockMinimo: 1,
            imagen: c.imagen,
            esCombo: true,
            talla: 'Combo / Varias',
            color: 'Conjunto Integral',
            material: 'Lana & Seda Pura',
            corte: 'Outfit Completo',
            genero: 'Caballeros',
            estado: true,
          }),
        );

        for (const item of c.items) {
          const subProd = prodMap[item.sku];
          if (subProd) {
            await this.comboProductoRepo.save(
              this.comboProductoRepo.create({
                comboId: combo.id,
                productoId: subProd.id,
                cantidad: item.cantidad,
              }),
            );
          }
        }
      }
    }

    console.log('--- Seeder de Sartorial Prestige finalizado con éxito! ---');
  }
}
