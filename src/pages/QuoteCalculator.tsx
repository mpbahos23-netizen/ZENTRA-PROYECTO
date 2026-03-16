import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calculator, ArrowRight, Truck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const cargoTypes = [
  { value: "standard", label: "Estándar", multiplier: 1 },
  { value: "fragile", label: "Frágil", multiplier: 1.3 },
  { value: "perishable", label: "Perecedero", multiplier: 1.5 },
  { value: "hazardous", label: "Peligroso", multiplier: 1.8 },
];

const QuoteCalculator = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("0");
  const [weight, setWeight] = useState("1000"); // Default 1 ton
  const [cargoType, setCargoType] = useState("standard");
  const [showQuote, setShowQuote] = useState(false);

  // Mock function to calculate distance deterministically based on strings
  const calculateMockDistance = (o: string, d: string) => {
    if (o.length < 3 || d.length < 3) return 0;
    const hash = o.toLowerCase().split('').reduce((a, b) => a + b.charCodeAt(0), 0) +
      d.toLowerCase().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return (hash % 800) + 150; // Random distance between 150 km and 950 km
  };

  useEffect(() => {
    // Auto-calculate distance immediately if both have values
    if (origin.length >= 3 && destination.length >= 3) {
      const dist = calculateMockDistance(origin, destination);
      setDistance(dist.toString());
      if (dist > 0) {
        setShowQuote(true);
      }
    } else {
      setDistance("0");
      setShowQuote(false);
    }
  }, [origin, destination]);

  // Ensure weight stays within 2 tons constraint requested by user
  useEffect(() => {
    const w = parseFloat(weight);
    if (w > 2000) {
      setWeight("2000"); // 2 Toneladas Maximo
    }
  }, [weight]);

  const distNum = parseFloat(distance) || 0;
  const weightNum = parseFloat(weight) || 0;
  const cargoMult = cargoTypes.find(c => c.value === cargoType)?.multiplier || 1;

  const baseFee = 50;
  const distanceFee = distNum * 1.2;
  const weightFee = weightNum * 0.08;
  const cargoFee = (distanceFee + weightFee) * (cargoMult - 1);
  const subtotal = baseFee + distanceFee + weightFee + cargoFee;
  const platformFee = subtotal * 0.08;
  const total = subtotal + platformFee;

  const canCalculate = origin && destination && distNum > 0 && weightNum > 0;

  return (
    <DashboardLayout role="client">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-10 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00e5ff]/20 bg-[#00e5ff]/10 mb-4">
            <Calculator className="w-4 h-4 text-[#00e5ff]" />
            <span className="text-sm font-bold text-[#00e5ff]">Motor de Cotización Inteligente</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Obtén una Cotización Instantánea</h1>
          <p className="text-zinc-400">Cotización generada automáticamente en base a tu destino y un límite máximo de 2 Toneladas.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input form */}
          <Card className="lg:col-span-3 bg-[#111] border-white/5 p-6 rounded-2xl">
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Origen</label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="Ej. Monterrey"
                      className="pl-10 bg-black border-white/10 text-white rounded-lg h-12 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                      value={origin}
                      onChange={e => setOrigin(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Destino</label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="Ej. Ciudad de México"
                      className="pl-10 bg-black border-white/10 text-white rounded-lg h-12 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Distancia Calculada (km)</label>
                  <Input
                    type="number"
                    readOnly
                    className="mt-2 bg-black border-white/10 text-[#00e5ff] font-bold rounded-lg h-12 opacity-80"
                    value={distance}
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Se genera al poner origen y destino.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase">Peso (kg) *Max 2 Ton</label>
                  <Input
                    type="number"
                    max="2000"
                    placeholder="Ej. 1500"
                    className="mt-2 bg-black border-white/10 text-white rounded-lg h-12 focus:ring-[#00e5ff] focus:border-[#00e5ff]"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase">Tipo de Carga</label>
                <select
                  className="w-full mt-2 bg-black border border-white/10 text-white rounded-lg h-12 px-4 focus:ring-[#00e5ff] outline-none"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                >
                  {cargoTypes.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

            </div>
          </Card>

          {/* Quote result */}
          <Card className={`lg:col-span-2 bg-gradient-to-b from-[#111] to-[#0a0a0a] border-white/5 p-6 rounded-2xl transition-all duration-500 ${showQuote && canCalculate ? 'opacity-100 scale-100' : 'opacity-40 scale-95 blur-[2px]'}`}>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <Truck className="w-5 h-5 text-[#00e5ff]" />
              <h2 className="text-lg font-bold text-white">Desglose de Cotización</h2>
            </div>

            <div className="space-y-4">
              {[
                { label: "Tarifa Base", value: baseFee },
                { label: "Servicio de Ruta", value: distanceFee },
                { label: "Tarifa por Peso", value: weightFee },
                ...(cargoFee > 0 ? [{ label: `Recargo (${cargoTypes.find(c => c.value === cargoType)?.label})`, value: cargoFee }] : []),
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400 font-medium">{item.label}</span>
                  <span className="font-bold text-white">${item.value.toFixed(2)}</span>
                </div>
              ))}

              <Separator className="bg-white/10 my-4" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 font-medium">Comisión Plataforma (8%)</span>
                <span className="font-bold text-white">${platformFee.toFixed(2)}</span>
              </div>
              <Separator className="bg-white/10 my-4" />

              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-white">Presupuesto Total</span>
                <span className="text-3xl font-black text-[#00e5ff] tracking-tight">${total.toFixed(2)}</span>
              </div>

              <Button asChild className="w-full mt-6 bg-[#00e5ff] hover:bg-[#00cce6] text-black font-bold h-12 rounded-xl" disabled={!showQuote}>
                <Link to="/client/book">Continuar y Reservar</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuoteCalculator;
