# Arquitectura del Sitio Web - Generador de Presupuestos SINTRA

## Visión General
Transformar el generador de presupuestos HTML existente en una aplicación web completa con autenticación y funcionalidad de calendario.

## Componentes Principales

### 1. Sistema de Autenticación
- **Usuario fijo**: kadoshnissi
- **Contraseña fija**: SANDRAKAUE
- Sesión persistente con localStorage
- Página de login protegida

### 2. Dashboard Principal
- Navegación entre secciones
- Resumen de actividad reciente
- Acceso rápido a funcionalidades

### 3. Generador de Presupuestos
- Integración del código HTML existente
- Funcionalidad completa de cálculo
- Guardado automático de presupuestos generados

### 4. Sistema de Calendario
- Vista mensual interactiva
- Registro de presupuestos por fecha
- Resúmenes y mini información
- Filtros por tipo de actividad

### 5. Base de Datos Local
- Almacenamiento en localStorage
- Estructura de datos para presupuestos
- Historial de actividades

## Estructura de Datos

### Presupuesto
```javascript
{
  id: string,
  fecha: Date,
  color: string,
  cantidad: number,
  dimensiones: {ancho: number, alto: number},
  margen: number,
  opcionLamina: string,
  resultados: {
    inversionPrendas: number,
    inversionDTF: number,
    inversionTotal: number,
    ingresos: number,
    ganancia: number,
    rentabilidad: number
  },
  resumen: string
}
```

### Evento de Calendario
```javascript
{
  id: string,
  fecha: Date,
  tipo: 'presupuesto' | 'nota',
  titulo: string,
  descripcion: string,
  presupuestoId?: string
}
```

## Tecnologías
- **Frontend**: React con TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Iconos**: Lucide React
- **Gráficos**: Recharts (para métricas)
- **Almacenamiento**: localStorage
- **Calendario**: Componente personalizado

## Flujo de Usuario
1. Login con credenciales
2. Dashboard principal
3. Crear nuevo presupuesto o ver calendario
4. Los presupuestos se guardan automáticamente
5. Visualización en calendario con resúmenes
6. Navegación fluida entre secciones
