import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import { Producto } from '../productos/entities/producto.entity';
import { MedidaCliente } from '../medidas-cliente/entities/medida-cliente.entity';
import { ConsultarEstiloDto } from './dto/consultar-estilo.dto';

export interface PrendaRecomendada {
  id: number;
  codigo: string;
  nombre: string;
  motivo: string;
  precio: number;
  talla: string;
  color?: string;
  corte?: string;
  imagen: string;
  esCombo?: boolean;
  categoria?: string;
  marca?: string;
}

export interface RespuestaAsesorEstilo {
  saludo: string;
  analisisProtocolo: string;
  prendasRecomendadas: PrendaRecomendada[];
  consejoAccesorios: string;
  totalOutfit: number;
  modeloUtilizado: string;
}

@Injectable()
export class AsesorEstiloService {
  private readonly logger = new Logger(AsesorEstiloService.name);
  private ai: GoogleGenAI | null = null;
  private readonly apiKey = process.env.GEMINI_API_KEY || '';
  private readonly preferredModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash-lite';
  private readonly fallbackModels = [
    'gemini-3.8-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
  ];

  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(MedidaCliente)
    private readonly medidaRepo: Repository<MedidaCliente>,
  ) {
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  async consultar(dto: ConsultarEstiloDto): Promise<RespuestaAsesorEstilo> {
    // 1. Obtener catálogo activo de productos
    const productos = await this.productoRepo.find({
      where: { estado: true },
      relations: ['categoria', 'marca', 'promocion'],
      order: { id: 'ASC' },
    });

    // 2. Consultar medidas antropométricas si se envía clienteId
    let infoMedidas = '';
    if (dto.clienteId) {
      const medida = await this.medidaRepo.findOne({
        where: { clienteId: dto.clienteId },
        relations: ['cliente'],
        order: { id: 'DESC' },
      });

      if (medida) {
        const nombreCliente = medida.cliente ? `${medida.cliente.nombre} ${medida.cliente.apellido}`.trim() : 'Cliente';
        infoMedidas = `
DATOS ANATÓMICOS DEL CLIENTE REGISTRADO (${nombreCliente}):
- Pecho: ${medida.pecho} cm
- Cintura: ${medida.cintura} cm
- Cadera: ${medida.cadera} cm
- Hombro a Hombro: ${medida.hombroAHombro} cm
- Largo Manga: ${medida.largoManga} cm
- Cuello: ${medida.cuello} cm
- Silueta / Ajuste Preferido: ${medida.ajustePreferido || 'Tailored Fit'}
(Ten en cuenta estas proporciones anatómicas para priorizar las tallas y cortes que mejor armonicen con su silueta).`;
      }
    }

    // 3. Preparar mini catálogo para el contexto de la IA
    const catalogoContexto = productos.map((p) => ({
      id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      categoria: p.categoria?.nombre || 'General',
      marca: p.marca?.nombre || 'Sartorial',
      precio: Number(p.precioVenta),
      talla: p.talla,
      color: p.color,
      material: p.material,
      corte: p.corte,
      esCombo: p.esCombo,
    }));

    const systemInstruction = `Eres "Asesor de Estilo", el sastre consultor de alta costura e imagen masculina de la boutique "Sartorial Prestige".
Tu misión es aconsejar con la máxima distinción, elegancia y estricto respeto a las normas del protocolo y etiqueta masculina clásica (White Tie, Black Tie, Morning Dress / Chaqué, Cóctel de Jardín, Business Formal, Smart Casual de Lujo, etc.).

REGLAS DE ORO OBLIGATORIAS:
1. SOLO puedes recomendar prendas que existan en el siguiente CATÁLOGO REAL DE SARTORIAL PRESTIGE:
${JSON.stringify(catalogoContexto)}

2. No inventes prendas, marcas ni códigos SKU inexistentes.
3. Elige entre 2 y 4 prendas complementarias que armonicen cromática y formalmente (o 1 outfit completo si es combo).
4. Si se especifican datos anatómicos del cliente, haz referencia a cómo la silueta o el corte favorece sus proporciones.
5. Devuelve SIEMPRE la respuesta estrictamente en formato JSON válido con la siguiente estructura:
{
  "saludo": "Saludo formal y distinguido al caballero",
  "analisisProtocolo": "Explicación del protocolo requerido según la hora, lugar, clima y ocasión del evento",
  "prendasRecomendadas": [
    {
      "id": 1,
      "codigo": "TRJ-CAN-001",
      "motivo": "Por qué esta prenda es idónea para la ocasión"
    }
  ],
  "consejoAccesorios": "Consejo maestro sobre detalles de estilo (postura, nudo de corbata, pañuelo, reloj o zapatos)",
  "totalOutfit": 4200.0
}`;

    // 4. Invocar a Gemini con fallback ordenado
    let textoRespuesta = '';
    let modeloExitoso = this.preferredModel;

    // Probar el modelo preferido primero y luego los fallbacks
    const modelosAProbar = [
      this.preferredModel,
      ...this.fallbackModels.filter((m) => m !== this.preferredModel),
    ];

    let errorUltimo: any = null;
    for (const modelo of modelosAProbar) {
      try {
        if (!this.ai) {
          throw new Error('Cliente GoogleGenAI no inicializado. Verifique GEMINI_API_KEY.');
        }

        this.logger.log(`Consultando a Asesor de Estilo con modelo: ${modelo}`);
        const response = await this.ai.models.generateContent({
          model: modelo,
          contents: `Petición del cliente: "${dto.mensaje}".${infoMedidas}`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        });

        if (response && response.text) {
          textoRespuesta = response.text;
          modeloExitoso = modelo;
          break;
        }
      } catch (err: any) {
        errorUltimo = err;
        this.logger.warn(`Modelo ${modelo} falló: ${err?.message || err}. Probando siguiente modelo...`);
      }
    }

    if (!textoRespuesta) {
      this.logger.error('Todos los modelos de Gemini fallaron:', errorUltimo);
      return this.generarRespuestaRespaldo(productos, dto.mensaje);
    }

    // 5. Parsear y enriquecer respuesta con las entidades reales de la base de datos
    try {
      const parsed = JSON.parse(textoRespuesta);
      const prendasEnriquecidas: PrendaRecomendada[] = [];
      let totalCalculado = 0;

      const prodMap = new Map<number, Producto>();
      productos.forEach((p) => prodMap.set(p.id, p));

      if (Array.isArray(parsed.prendasRecomendadas)) {
        for (const item of parsed.prendasRecomendadas) {
          const prodReal = prodMap.get(Number(item.id)) || productos.find((p) => p.codigo === item.codigo);
          if (prodReal) {
            const precioVenta = Number(prodReal.precioVenta);
            totalCalculado += precioVenta;
            prendasEnriquecidas.push({
              id: prodReal.id,
              codigo: prodReal.codigo,
              nombre: prodReal.nombre,
              motivo: item.motivo || 'Pieza esencial para una combinación armónica.',
              precio: precioVenta,
              talla: prodReal.talla,
              color: prodReal.color,
              corte: prodReal.corte,
              imagen: prodReal.imagen,
              esCombo: prodReal.esCombo,
              categoria: prodReal.categoria?.nombre,
              marca: prodReal.marca?.nombre,
            });
          }
        }
      }

      return {
        saludo: parsed.saludo || 'Estimado Caballero, es un placer asesorarle en Sartorial Prestige.',
        analisisProtocolo: parsed.analisisProtocolo || 'Para esta ocasión se requiere una indumentaria formal y cuidada.',
        prendasRecomendadas: prendasEnriquecidas.length > 0 ? prendasEnriquecidas : this.obtenerPrendasPorDefecto(productos),
        consejoAccesorios: parsed.consejoAccesorios || 'Asegúrese de que el calzado esté lustrado y el cinturón combine en tono y brillo.',
        totalOutfit: totalCalculado > 0 ? totalCalculado : Number(parsed.totalOutfit || 0),
        modeloUtilizado: modeloExitoso,
      };
    } catch (e) {
      this.logger.error('Error al parsear JSON devuelto por Gemini:', e);
      return this.generarRespuestaRespaldo(productos, dto.mensaje);
    }
  }

  /**
   * Respaldo heurístico de alta costura si la API externa experimenta caídas
   */
  private generarRespuestaRespaldo(productos: Producto[], mensaje: string): RespuestaAsesorEstilo {
    const s = mensaje.toLowerCase();
    let seleccion: Producto[] = [];

    if (s.includes('boda') || s.includes('gala') || s.includes('black tie') || s.includes('smoking')) {
      seleccion = productos.filter((p) => p.esCombo || p.codigo.startsWith('SMK') || p.codigo.startsWith('TRJ')).slice(0, 3);
    } else if (s.includes('verano') || s.includes('jardin') || s.includes('playa') || s.includes('lino')) {
      seleccion = productos.filter((p) => p.material?.toLowerCase().includes('lino') || p.codigo.startsWith('BLZ') || p.codigo.startsWith('PNT')).slice(0, 3);
    } else {
      seleccion = productos.slice(0, 3);
    }

    const items: PrendaRecomendada[] = seleccion.map((p) => ({
      id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      motivo: 'Selección de etiqueta recomendada por nuestra sastrería de alta gama.',
      precio: Number(p.precioVenta),
      talla: p.talla,
      color: p.color,
      corte: p.corte,
      imagen: p.imagen,
      esCombo: p.esCombo,
      categoria: p.categoria?.nombre,
      marca: p.marca?.nombre,
    }));

    const total = items.reduce((acc, curr) => acc + curr.precio, 0);

    return {
      saludo: 'Bienvenido a Sartorial Prestige. He preparado una selección exclusiva para su ocasión.',
      analisisProtocolo: 'El evento exige sobriedad y distinción en la caída del tejido, armonizando tonos neutros con accesorios de brillo discreto.',
      prendasRecomendadas: items,
      consejoAccesorios: 'Recuerde mantener una postura erguida; el último botón del saco permanece siempre desabrochado según la tradición sartorial.',
      totalOutfit: total,
      modeloUtilizado: 'Modo Respaldo Sastrería',
    };
  }

  private obtenerPrendasPorDefecto(productos: Producto[]): PrendaRecomendada[] {
    return productos.slice(0, 3).map((p) => ({
      id: p.id,
      codigo: p.codigo,
      nombre: p.nombre,
      motivo: 'Pieza representativa de nuestra colección.',
      precio: Number(p.precioVenta),
      talla: p.talla,
      color: p.color,
      corte: p.corte,
      imagen: p.imagen,
      esCombo: p.esCombo,
      categoria: p.categoria?.nombre,
      marca: p.marca?.nombre,
    }));
  }
}
