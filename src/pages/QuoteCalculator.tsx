import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calculator, ArrowRight, Truck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";

const cargoTypes = [
  { value: "standard", label: "Standard", multiplier: 1 },
  { value: "fragile", label: "Fragile", multiplier: 1.3 },
  { value: "perishable", label: "Perishable", multiplier: 1.5 },
  { value: "hazardous", label: "Hazardous", multiplier: 1.8 },
];

const QuoteCalculator = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [weight, setWeight] = useState("");
  const [cargoType, setCargoType] = useState("standard");
  const [isExpress, setIsExpress] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  const distNum = parseFloat(distance) || 0;
  const weightNum = parseFloat(weight) || 0;
  const cargoMult = cargoTypes.find(c => c.value === cargoType)?.multiplier || 1;

  const baseFee = 50;
  const distanceFee = distNum * 1.2;
  const weightFee = weightNum * 0.08;
  const cargoFee = (distanceFee + weightFee) * (cargoMult - 1);
  const expressFee = isExpress ? (baseFee + distanceFee + weightFee) * 0.5 : 0;
  const insuranceFee = hasInsurance ? weightNum * 0.02 + 25 : 0;
  const subtotal = baseFee + distanceFee + weightFee + cargoFee + expressFee + insuranceFee;
  const platformFee = subtotal * 0.08;
  const total = subtotal + platformFee;

  const canCalculate = origin && destination && distNum > 0 && weightNum > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal/20 bg-teal/5 mb-4">
              <Calculator className="w-4 h-4 text-teal" />
              <span className="text-sm font-medium text-teal">Smart Quotation Engine</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Get an Instant Quote</h1>
            <p className="text-muted-foreground">Transparent pricing with full cost breakdown.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Input form */}
            <Card className="lg:col-span-3 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Shipment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Origin</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="e.g. Houston, TX" className="pl-10" value={origin} onChange={e => setOrigin(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="e.g. Dallas, TX" className="pl-10" value={destination} onChange={e => setDestination(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input type="number" placeholder="e.g. 400" value={distance} onChange={e => setDistance(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" placeholder="e.g. 2000" value={weight} onChange={e => setWeight(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cargo Type</Label>
                  <Select value={cargoType} onValueChange={setCargoType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {cargoTypes.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="express" checked={isExpress} onCheckedChange={(v) => setIsExpress(v === true)} />
                    <Label htmlFor="express" className="text-sm font-normal cursor-pointer">2-Hour Express (+50%)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="insurance" checked={hasInsurance} onCheckedChange={(v) => setHasInsurance(v === true)} />
                    <Label htmlFor="insurance" className="text-sm font-normal cursor-pointer">Cargo Insurance</Label>
                  </div>
                </div>

                <Button
                  className="w-full bg-teal-gradient hover:opacity-90"
                  disabled={!canCalculate}
                  onClick={() => setShowQuote(true)}
                >
                  Calculate Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Quote result */}
            <Card className={`lg:col-span-2 border-border/50 transition-opacity duration-300 ${showQuote && canCalculate ? 'opacity-100' : 'opacity-40'}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-teal" />
                  Quote Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Base Fee", value: baseFee },
                  { label: "Distance Fee", value: distanceFee },
                  { label: "Weight Fee", value: weightFee },
                  ...(cargoFee > 0 ? [{ label: `${cargoType.charAt(0).toUpperCase() + cargoType.slice(1)} Surcharge`, value: cargoFee }] : []),
                  ...(expressFee > 0 ? [{ label: "Express Premium", value: expressFee }] : []),
                  ...(insuranceFee > 0 ? [{ label: "Insurance", value: insuranceFee }] : []),
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">${item.value.toFixed(2)}</span>
                  </div>
                ))}

                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (8%)</span>
                  <span className="font-medium text-foreground">${platformFee.toFixed(2)}</span>
                </div>
                <Separator />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-gradient-teal">${total.toFixed(2)}</span>
                </div>

                <Button asChild className="w-full mt-4 bg-teal-gradient hover:opacity-90" disabled={!showQuote}>
                  <Link to="/client/book">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteCalculator;
