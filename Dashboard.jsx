import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from './Calendar';
import { PresupuestosGenerator } from './PresupuestosGenerator';
import { 
  LogOut, 
  Calculator, 
  CalendarDays, 
  BarChart3, 
  FileText,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

export const Dashboard = () => {
  const [vistaActiva, setVistaActiva] = useState('resumen');
  const { logout } = useAuth();
  const { presupuestos, eventos } = useData();

  const calcularEstadisticas = () => {
    const totalPresupuestos = presupuestos.length;
    const inversionTotal = presupuestos.reduce((sum, p) => 
      sum + (p.resultados?.inversionTotal || 0), 0
    );
    const gananciaTotal = presupuestos.reduce((sum, p) => 
      sum + (p.resultados?.ganancia || 0), 0
    );
    const rentabilidadPromedio = presupuestos.length > 0 
      ? presupuestos.reduce((sum, p) => sum + (p.resultados?.rentabilidad || 0), 0) / presupuestos.length
      : 0;

    return {
      totalPresupuestos,
      inversionTotal,
      gananciaTotal,
      rentabilidadPromedio
    };
  };

  const stats = calcularEstadisticas();

  const menuItems = [
    { id: 'resumen', label: 'Resumen', icon: BarChart3 },
    { id: 'presupuestos', label: 'Generar Presupuesto', icon: Calculator },
    { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  ];

  const renderContent = () => {
    switch (vistaActiva) {
      case 'presupuestos':
        return <PresupuestosGenerator />;
      case 'calendario':
        return <Calendar />;
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Presupuestos
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPresupuestos}</div>
                  <p className="text-xs text-muted-foreground">
                    Presupuestos generados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Inversión Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    €{stats.inversionTotal.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    En todos los proyectos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ganancia Total
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    €{stats.gananciaTotal.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ganancia estimada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Rentabilidad Promedio
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.rentabilidadPromedio.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rentabilidad media
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Presupuestos Recientes</CardTitle>
                  <CardDescription>
                    Últimos presupuestos generados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {presupuestos.length === 0 ? (
                    <p className="text-muted-foreground">
                      No hay presupuestos generados aún.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {presupuestos.slice(-5).reverse().map((presupuesto) => (
                        <div
                          key={presupuesto.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {presupuesto.color} - {presupuesto.cantidad} unidades
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(presupuesto.fecha).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              €{presupuesto.resultados?.inversionTotal?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-sm text-green-600">
                              +€{presupuesto.resultados?.ganancia?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actividad del Calendario</CardTitle>
                  <CardDescription>
                    Eventos y actividades recientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {eventos.length === 0 ? (
                    <p className="text-muted-foreground">
                      No hay eventos registrados aún.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {eventos.slice(-5).reverse().map((evento) => (
                        <div
                          key={evento.id}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <div className={`
                            w-2 h-2 rounded-full mt-2
                            ${evento.tipo === 'presupuesto' ? 'bg-blue-500' : 'bg-green-500'}
                          `} />
                          <div className="flex-1">
                            <p className="font-medium">{evento.titulo}</p>
                            <p className="text-sm text-muted-foreground">
                              {evento.descripcion}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(evento.fecha).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Generador SINTRA
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={vistaActiva === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setVistaActiva(item.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};
