import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Save, TestTube } from 'lucide-react';

export const PresupuestosGenerator = () => {
  const { savePresupuesto } = useData();
  
  const [formData, setFormData] = useState({
    color: 'Blanco',
    cantidad: 100,
    ancho: 30,
    alto: 30,
    margen: 1,
    prenda: 'camiseta',
    opcionLamina: 'auto',
    costeImpresion: 0.5,
    precioVenta: 15.00
  });

  const [resultados, setResultados] = useState(null);
  const [mensaje, setMensaje] = useState('');

  // Datos fijos del HTML original
  const preciosProveedor = {
    blanco: [
      {max: 15, price: 2.30},
      {max: 25, price: 2.24},
      {max: 50, price: 2.17},
      {max: Infinity, price: 2.04}
    ],
    color: [
      {max: 15, price: 2.55},
      {max: 25, price: 2.49},
      {max: 50, price: 2.42},
      {max: Infinity, price: 2.30}
    ]
  };

  const laminaData = {
    grande: {width: 58, height: 100, price: 12},
    mediana: {width: 30, height: 100, price: 7},
    rollo: {width: 30, heightPerMeter: 100}
  };

  const coloresDisponibles = [
    'Blanco', 'Negro', 'Rojo', 'Amarillo', 'Marino', 'Gris Vigoré',
    'Verde Botella', 'Azul Royal Melange', 'Rosa Claro', 'Rosetto',
    'Celeste', 'Verde Menta', 'Alta Granada'
  ];

  const getPrecioProveedor = (color, qty) => {
    const key = (String(color).toLowerCase() === 'blanco') ? 'blanco' : 'color';
    for (const tier of preciosProveedor[key]) {
      if (qty <= tier.max) return tier.price;
    }
    return preciosProveedor[key][preciosProveedor[key].length - 1].price;
  };

  const designsPerSheet = (sheetW, sheetH, designW, designH, margin) => {
    const cols1 = Math.floor((sheetW + margin) / (designW + margin));
    const rows1 = Math.floor((sheetH + margin) / (designH + margin));
    const count1 = Math.max(0, cols1 * rows1);

    const cols2 = Math.floor((sheetW + margin) / (designH + margin));
    const rows2 = Math.floor((sheetH + margin) / (designW + margin));
    const count2 = Math.max(0, cols2 * rows2);

    return Math.max(count1, count2);
  };

  const calcular = () => {
    const { color, cantidad, ancho, alto, margen, costeImpresion, precioVenta } = formData;
    
    const precioUnitProveedor = getPrecioProveedor(color, cantidad);
    const inversionPrendas = precioUnitProveedor * cantidad;
    const areaPorDiseno = ancho * alto;
    const areaTotal = areaPorDiseno * cantidad;

    const opciones = [];

    // LÁMINA GRANDE
    const dpsG = designsPerSheet(laminaData.grande.width, laminaData.grande.height, ancho, alto, margen);
    const lamG = dpsG > 0 ? Math.ceil(cantidad / dpsG) : Infinity;
    const costG = lamG * laminaData.grande.price + lamG * costeImpresion;

    opciones.push({
      id: "grande",
      name: "Lámina Grande 58×100",
      rend: dpsG,
      unidades: lamG,
      costeDTF: costG
    });

    // LÁMINA MEDIANA
    const dpsM = designsPerSheet(laminaData.mediana.width, laminaData.mediana.height, ancho, alto, margen);
    const lamM = dpsM > 0 ? Math.ceil(cantidad / dpsM) : Infinity;
    const costM = lamM * laminaData.mediana.price + lamM * costeImpresion;

    opciones.push({
      id: "mediana",
      name: "Lámina Mediana 30×100",
      rend: dpsM,
      unidades: lamM,
      costeDTF: costM
    });

    // ROLLO
    const dpsR = designsPerSheet(laminaData.rollo.width, laminaData.rollo.heightPerMeter, ancho, alto, margen);
    const metros = dpsR > 0 ? Math.ceil(cantidad / dpsR) : Infinity;
    const precioPorMetro = metros >= 3 ? 6 : 7;
    const costR = metros * (precioPorMetro + costeImpresion);

    opciones.push({
      id: "rollo",
      name: "Rollo (€/metro)",
      rend: dpsR,
      unidades: metros,
      costeDTF: costR,
      precioPorMetro
    });

    const opcionesValidas = opciones.filter(o => isFinite(o.costeDTF));
    const mejor = opcionesValidas.length ? opcionesValidas.reduce((a, b) => a.costeDTF < b.costeDTF ? a : b) : null;

    const invDTF = mejor ? mejor.costeDTF : Infinity;
    const invTotal = inversionPrendas + invDTF;
    const ingresos = precioVenta * cantidad;
    const ganancia = ingresos - invTotal;
    const rentabilidad = invTotal > 0 ? (ganancia / invTotal * 100) : 0;

    const resultadosCalculados = {
      color,
      cantidad,
      dimensiones: { ancho, alto },
      margen,
      areaPorDiseno,
      areaTotal,
      precioUnitProveedor,
      inversionPrendas,
      inversionDTF: invDTF,
      inversionTotal: invTotal,
      ingresos,
      ganancia,
      rentabilidad,
      opciones,
      mejor,
      opcionLamina: formData.opcionLamina
    };

    setResultados(resultadosCalculados);
  };

  const guardarPresupuesto = () => {
    if (!resultados) {
      setMensaje('Primero debes calcular el presupuesto');
      return;
    }

    const presupuestoGuardado = savePresupuesto({
      ...formData,
      resultados: {
        inversionPrendas: resultados.inversionPrendas,
        inversionDTF: resultados.inversionDTF,
        inversionTotal: resultados.inversionTotal,
        ingresos: resultados.ingresos,
        ganancia: resultados.ganancia,
        rentabilidad: resultados.rentabilidad
      }
    });

    setMensaje('Presupuesto guardado exitosamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  const aplicarPrueba = (prueba) => {
    const pruebas = {
      1: { color: 'Blanco', cantidad: 10, ancho: 30, alto: 30 },
      2: { color: 'Negro', cantidad: 40, ancho: 30, alto: 30 },
      3: { color: 'Rojo', cantidad: 120, ancho: 30, alto: 30 }
    };

    setFormData({ ...formData, ...pruebas[prueba] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Generador de Presupuestos SINTRA
          </CardTitle>
          <CardDescription>
            Modelo fijo: <strong>SINTRA</strong> (100% algodón, 155 g/m²). 
            Selecciona color, cantidad y tamaño del diseño para calcular el presupuesto completo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="color">Color de la camiseta</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({...formData, color: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coloresDisponibles.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cantidad">Cantidad total de camisetas</Label>
                <Input
                  id="cantidad"
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({...formData, cantidad: Number(e.target.value)})}
                  min="1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ancho">Ancho del diseño (cm)</Label>
                  <Input
                    id="ancho"
                    type="number"
                    value={formData.ancho}
                    onChange={(e) => setFormData({...formData, ancho: Number(e.target.value)})}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="alto">Alto del diseño (cm)</Label>
                  <Input
                    id="alto"
                    type="number"
                    value={formData.alto}
                    onChange={(e) => setFormData({...formData, alto: Number(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="margen">Margen entre diseños (cm)</Label>
                <Input
                  id="margen"
                  type="number"
                  value={formData.margen}
                  onChange={(e) => setFormData({...formData, margen: Number(e.target.value)})}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="costeImpresion">Coste de impresión por lámina (€)</Label>
                <Input
                  id="costeImpresion"
                  type="number"
                  step="0.01"
                  value={formData.costeImpresion}
                  onChange={(e) => setFormData({...formData, costeImpresion: Number(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="precioVenta">Precio de venta estimado por camiseta (€)</Label>
                <Input
                  id="precioVenta"
                  type="number"
                  step="0.01"
                  value={formData.precioVenta}
                  onChange={(e) => setFormData({...formData, precioVenta: Number(e.target.value)})}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={calcular} className="flex-1">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular Presupuesto
                </Button>
                {resultados && (
                  <Button onClick={guardarPresupuesto} variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                )}
              </div>

              <div>
                <Label>Pruebas rápidas</Label>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => aplicarPrueba(1)}>
                    <TestTube className="h-3 w-3 mr-1" />
                    10 Blanco
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => aplicarPrueba(2)}>
                    <TestTube className="h-3 w-3 mr-1" />
                    40 Negro
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => aplicarPrueba(3)}>
                    <TestTube className="h-3 w-3 mr-1" />
                    120 Color
                  </Button>
                </div>
              </div>

              {mensaje && (
                <Alert>
                  <AlertDescription>{mensaje}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Resultados */}
            <div>
              {resultados ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resumen del Presupuesto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Color:</span>
                          <span className="font-medium">{resultados.color}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cantidad:</span>
                          <span className="font-medium">{resultados.cantidad}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tamaño diseño:</span>
                          <span className="font-medium">{resultados.dimensiones.ancho}×{resultados.dimensiones.alto} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Área total:</span>
                          <span className="font-medium">{resultados.areaTotal} cm²</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precio proveedor:</span>
                          <span className="font-medium">€{resultados.precioUnitProveedor.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Comparativa de Opciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {resultados.opciones.map((opcion) => (
                          <div
                            key={opcion.id}
                            className={`p-3 border rounded-lg ${
                              resultados.mejor && opcion.id === resultados.mejor.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {opcion.name}
                                  {resultados.mejor && opcion.id === resultados.mejor.id && ' ✅'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  ≈ {opcion.rend} diseños/{opcion.id === 'rollo' ? 'm' : 'lámina'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">€{opcion.costeDTF.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {isFinite(opcion.unidades) ? opcion.unidades : '—'} unidades
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resultados Financieros</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Inversión prendas:</span>
                          <span className="font-medium">€{resultados.inversionPrendas.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inversión DTF:</span>
                          <span className="font-medium">€{resultados.inversionDTF.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Inversión total:</span>
                          <span className="font-bold">€{resultados.inversionTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ingresos esperados:</span>
                          <span className="font-medium">€{resultados.ingresos.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Ganancia neta:</span>
                          <span className={`font-bold ${resultados.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            €{resultados.ganancia.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rentabilidad:</span>
                          <span className={`font-medium ${resultados.rentabilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {resultados.rentabilidad.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">
                      Completa los datos y haz clic en "Calcular Presupuesto" para ver los resultados.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
