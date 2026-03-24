import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight,
  Receipt,
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ============================================
// ZENTRA OBSIDIAN: Invoices & Payments
// Ultra-Minimalist Financial Terminal
// ============================================

const InvoicesData = [
    { id: "FAC-9842", date: "22 Oct, 2023", amount: "1.240.000", status: "Pagado", type: "Carga Pesada" },
    { id: "FAC-9845", date: "25 Oct, 2023", amount: "3.450.000", status: "Pendiente", type: "Mudanza" },
    { id: "FAC-9901", date: "01 Nov, 2023", amount: "890.000", status: "Pagado", type: "Express" },
];

export default function Invoices() {
    const [filter, setFilter] = useState("all");

    const handleDownload = (id?: string) => {
        toast.info(id ? `Generando PDF: ${id}...` : "Compilando historial financiero...");
        setTimeout(() => {
            toast.success(id ? `Factura ${id} guardada` : "Historial descargado correctamente");
        }, 1500);
    };

    return (
        <DashboardLayout role="client">
            <div className="max-w-md mx-auto space-y-10 pb-32 animate-in fade-in duration-700 font-inter">
                
                {/* HEADER */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Facturación</h1>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Historial de Transacciones</p>
                    </div>

                    <div className="bg-[#060E20] border border-white/5 rounded-[32px] p-2 pr-6 flex items-center gap-6 relative z-10 focus-within:border-blue-500/50 transition-all">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
                           <Search className="w-5 h-5" />
                        </div>
                        <input 
                            className="bg-transparent border-none p-0 text-white font-black placeholder:text-zinc-800 focus:ring-0 w-full uppercase tracking-tight text-xs"
                            placeholder="Buscar factura o ID..."
                        />
                    </div>
                </div>

                {/* SUMMARY CARD (Balance/Total) */}
                <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-none p-10 rounded-[48px] shadow-2xl relative overflow-hidden text-center group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex flex-col items-center gap-2">
                             <Receipt className="w-8 h-8 text-white/50" />
                             <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Total Gastado Acumulado</span>
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter italic font-inter">$5.580.000</h2>
                        <div className="flex justify-center">
                            <Button 
                                onClick={() => handleDownload()}
                                className="bg-white/20 hover:bg-white/30 text-white font-black uppercase text-[9px] tracking-widest rounded-full px-6 h-10 border border-white/10"
                            >
                                <Download className="w-3 h-3 mr-2" /> Reporte Anual
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* INVOICES LIST */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Documentos Recientes</p>
                        <button className="text-[10px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                           <Filter className="w-3 h-3" /> Filtrar
                        </button>
                    </div>

                    <div className="space-y-4">
                        {InvoicesData.map((inv) => (
                            <button 
                                key={inv.id}
                                onClick={() => handleDownload(inv.id)}
                                className="w-full bg-[#060E20] border border-white/5 rounded-[40px] p-8 hover:border-white/20 transition-all duration-300 relative overflow-hidden group text-left shadow-xl hover:scale-[1.02]"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors",
                                                inv.status === "Pagado" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                                            )}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-base uppercase tracking-tight leading-none">{inv.id}</p>
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{inv.date} • {inv.type}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-end justify-between pr-2">
                                            <h3 className="text-2xl font-black text-white italic tracking-tighter">${inv.amount}</h3>
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
                                                inv.status === "Pagado" ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" : "bg-orange-500/5 text-orange-400 border-orange-500/10"
                                            )}>
                                                {inv.status}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* FOOTER ACTION */}
                <div className="text-center pt-4">
                   <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] mb-4">¿Necesitas ayuda con tus pagos?</p>
                   <Button variant="ghost" className="text-blue-500 font-black uppercase tracking-widest text-[10px] hover:bg-blue-500/5">
                      Contactar a Soporte ZENTRA
                   </Button>
                </div>

            </div>
        </DashboardLayout>
    );
}
