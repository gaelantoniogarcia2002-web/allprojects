# Especificación del Proyecto: Base de Datos Visual de Proyectos

## 1. Visión General y Objetivos
* **Nombre del Proyecto:** [Pendiente por definir]
* **Usuario Principal:** Personal (Uso exclusivo del desarrollador).
* **Problema a Resolver:** Falta de organización y visibilidad sobre el estado, recursos, finanzas y tiempos invertidos en proyectos personales, de trabajo y de clientes.
* **Objetivo:** Crear una interfaz visual interactiva para administrar, filtrar y comparar proyectos de forma eficiente.

---

## 2. Modelo de Datos

###  Entidad Principal: Proyecto
* **Título:** `String` (Obligatorio)
* **Estado:** `Enum` (`Idea` , `En Desarrollo` , `Pausado` ⏸, `Finalizado` )
* **Categoría / Objetivo:** `String` / `Tag` (Ej. *Robótica Hobbie*, *Automatización Agencia*, *Automatización Trabajo*)
* **Tiempos:**
  * **Tiempo Estimado:** `Number` (Horas)
  * **Tiempo Invertido:** `Number` (Horas)
  * **Frecuencia de Avance:** `String` / `Enum` (Ej. *Diario*, *Semanal*, *Ocasional*)
* **Finanzas:**
  * **Monto / Pago:** `Number` ($ USD / Moneda local)
* **Recursos Asociados:**
  * **Carpeta de Drive:** `URL`
  * **Repositorio GitHub:** `URL`
  * **Contactos Asociados:** `List<URL / String>`

###  Sub-entidad: Inspiración / Lluvia de Ideas
* **URL de Origen:** `URL`
* **Tipo de Referencia:** `Enum` (`Diseño UI` , `Stack Tecnológico` , `Funcionalidad` ⚙️, `Otro` )
* **Notas:** `String`

---

## 3.  Diseño de Interfaz y Experiencia (UI/UX)

###  Vista Galería (Principal)
* **Geometría de Tarjetas:**
  * Cada proyecto se representa con un rectángulo cuyo **tamaño es proporcional al Tiempo Estimado**.
  * Disposición fluida sin huecos (*Masonry / Grid denso*).
* **Indicador Visual de Avance (Barra de Progreso):**
  * Fondo de la tarjeta: Color de la categoría con **transparencia**.
  * Relleno de progreso: Mismo color pero **sin transparencia** (sólido), cubriendo el porcentaje equivalente a `(Tiempo Invertido / Tiempo Estimado) * 100`.

### Filtros y Búsqueda
* Filtro rápido por **Categoría / Objetivo**.
* Filtro por **Contacto Asociado**.

###  Módulo Comparador
* **Menú Desplegable (Overlay):** Permite activar el "Modo Comparación".
* **Selección Múltiple:** Permite seleccionar 2 o más proyectos en la galería.
* **Vista Comparativa:** Genera una tabla o vista lado a lado comparando:
  * Tiempos (Estimado vs. Invertido).
  * Costos / Pagos.
  * Frecuencia de avance.

---

## 4.  Requerimientos Técnicos y Reglas de Negocio
* **Alertas Visuales:** Indicar claramente si el `Tiempo Invertido` supera al `Tiempo Estimado`.
* **Persistencia de Datos:** [Por definir: Local SQLite / JSON / Supabase].
* **Arquitectura:** Estructura modular adaptable para subagentes en **Gentleman AI Stack**.