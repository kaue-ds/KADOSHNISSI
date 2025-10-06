import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    // Cargar datos del localStorage
    const savedPresupuestos = localStorage.getItem('sintra_presupuestos');
    const savedEventos = localStorage.getItem('sintra_eventos');
    
    if (savedPresupuestos) {
      setPresupuestos(JSON.parse(savedPresupuestos));
    }
    
    if (savedEventos) {
      setEventos(JSON.parse(savedEventos));
    }
  }, []);

  const savePresupuesto = (presupuesto) => {
    const nuevoPresupuesto = {
      ...presupuesto,
      id: Date.now().toString(),
      fecha: new Date().toISOString()
    };
    
    const nuevosPresupuestos = [...presupuestos, nuevoPresupuesto];
    setPresupuestos(nuevosPresupuestos);
    localStorage.setItem('sintra_presupuestos', JSON.stringify(nuevosPresupuestos));
    
    // Crear evento en el calendario
    const evento = {
      id: Date.now().toString() + '_evento',
      fecha: nuevoPresupuesto.fecha,
      tipo: 'presupuesto',
      titulo: `Presupuesto ${nuevoPresupuesto.color} - ${nuevoPresupuesto.cantidad} unidades`,
      descripcion: `Inversión total: €${nuevoPresupuesto.resultados?.inversionTotal?.toFixed(2) || '0.00'}`,
      presupuestoId: nuevoPresupuesto.id
    };
    
    const nuevosEventos = [...eventos, evento];
    setEventos(nuevosEventos);
    localStorage.setItem('sintra_eventos', JSON.stringify(nuevosEventos));
    
    return nuevoPresupuesto;
  };

  const addEvento = (evento) => {
    const nuevoEvento = {
      ...evento,
      id: Date.now().toString(),
      fecha: evento.fecha || new Date().toISOString()
    };
    
    const nuevosEventos = [...eventos, nuevoEvento];
    setEventos(nuevosEventos);
    localStorage.setItem('sintra_eventos', JSON.stringify(nuevosEventos));
    
    return nuevoEvento;
  };

  const getEventosByDate = (fecha) => {
    const fechaStr = new Date(fecha).toDateString();
    return eventos.filter(evento => 
      new Date(evento.fecha).toDateString() === fechaStr
    );
  };

  const getPresupuestoById = (id) => {
    return presupuestos.find(p => p.id === id);
  };

  const value = {
    presupuestos,
    eventos,
    savePresupuesto,
    addEvento,
    getEventosByDate,
    getPresupuestoById
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
