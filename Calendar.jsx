import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const Calendar = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const { eventos, getEventosByDate } = useData();

  const obtenerPrimerDiaMes = (fecha) => {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  };

  const obtenerUltimoDiaMes = (fecha) => {
    return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  };

  const obtenerDiasDelMes = () => {
    const primerDia = obtenerPrimerDiaMes(fechaActual);
    const ultimoDia = obtenerUltimoDiaMes(fechaActual);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias = [];

    // Días del mes anterior para completar la primera semana
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const fecha = new Date(primerDia);
      fecha.setDate(fecha.getDate() - (i + 1));
      dias.push({ fecha, esDelMesActual: false });
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
      dias.push({ fecha, esDelMesActual: true });
    }

    // Días del mes siguiente para completar la última semana
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 días
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, dia);
      dias.push({ fecha, esDelMesActual: false });
    }

    return dias;
  };

  const navegarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  const esHoy = (fecha) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const esFechaSeleccionada = (fecha) => {
    return fechaSeleccionada && fecha.toDateString() === fechaSeleccionada.toDateString();
  };

  const obtenerEventosDelDia = (fecha) => {
    return getEventosByDate(fecha);
  };

  const dias = obtenerDiasDelMes();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendario de Actividades
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[150px] text-center">
                {MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {DIAS_SEMANA.map((dia) => (
              <div
                key={dia}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {dia}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {dias.map((diaInfo, index) => {
              const eventosDelDia = obtenerEventosDelDia(diaInfo.fecha);
              const tieneEventos = eventosDelDia.length > 0;
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors
                    ${diaInfo.esDelMesActual 
                      ? 'bg-background hover:bg-muted/50' 
                      : 'bg-muted/20 text-muted-foreground'
                    }
                    ${esHoy(diaInfo.fecha) ? 'ring-2 ring-primary' : ''}
                    ${esFechaSeleccionada(diaInfo.fecha) ? 'bg-primary/10' : ''}
                  `}
                  onClick={() => setFechaSeleccionada(diaInfo.fecha)}
                >
                  <div className="flex flex-col h-full">
                    <div className={`
                      text-sm font-medium mb-1
                      ${esHoy(diaInfo.fecha) ? 'text-primary font-bold' : ''}
                    `}>
                      {diaInfo.fecha.getDate()}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      {eventosDelDia.slice(0, 2).map((evento) => (
                        <div
                          key={evento.id}
                          className={`
                            text-xs p-1 rounded truncate
                            ${evento.tipo === 'presupuesto' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                            }
                          `}
                          title={evento.titulo}
                        >
                          {evento.titulo}
                        </div>
                      ))}
                      
                      {eventosDelDia.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{eventosDelDia.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {fechaSeleccionada && (
        <Card>
          <CardHeader>
            <CardTitle>
              Eventos del {fechaSeleccionada.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {obtenerEventosDelDia(fechaSeleccionada).length === 0 ? (
              <p className="text-muted-foreground">No hay eventos para este día.</p>
            ) : (
              <div className="space-y-3">
                {obtenerEventosDelDia(fechaSeleccionada).map((evento) => (
                  <div
                    key={evento.id}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{evento.titulo}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {evento.descripcion}
                        </p>
                      </div>
                      <Badge variant={evento.tipo === 'presupuesto' ? 'default' : 'secondary'}>
                        {evento.tipo}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
