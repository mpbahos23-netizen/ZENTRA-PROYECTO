import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

const InvoicesData = [
    { id: "FAC-001", date: "Oct 22, 2023", amount: "$1,200", status: "Pagado", color: "text-[#00e5ff]", icon: <CheckCircle2 className="w-4 h-4 text-[#00e5ff]" /> },
    { id: "FAC-002", date: "Oct 25, 2023", amount: "$3,450", status: "Pendiente", color: "text-amber-500", icon: <Clock className="w-4 h-4 text-amber-500" /> },
    { id: "FAC-003", date: "Nov 01, 2023", amount: "$890", status: "Pagado", color: "text-[#00e5ff]", icon: <CheckCircle2 className="w-4 h-4 text-[#00e5ff]" /> },
];

export default function Invoices() {
    const handleDownload = (id?: string) => {
        toast.info(id ? `Generando PDF para factura ${id}...` : "Generando PDF con todas las facturas...");
        setTimeout(() => {
            toast.success(id ? `Factura ${id} descargada correctamente` : "Todas las facturas han sido descargadas");
        }, 1500);
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Facturación y Pagos</h1>
                        <p className="text-zinc-400 font-medium">Vea y administre todo el historial de su cuenta.</p>
                    </div>
                    <Button 
                        onClick={() => handleDownload()}
                        className="bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest px-8 h-12 rounded-2xl flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Descargar todo en PDF
                    </Button>
                </div>

                <Card className="bg-[#0a0a0a] border-white/10 rounded-3xl overflow-hidden mb-8 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/5">
                                <tr>
                                    <th className="px-8 py-5">ID Factura</th>
                                    <th className="px-8 py-5">Fecha Emisión</th>
                                    <th className="px-8 py-5">Monto</th>
                                    <th className="px-8 py-5">Estado</th>
                                    <th className="px-8 py-5 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {InvoicesData.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-zinc-400 group-hover:text-[#00e5ff] transition-colors" />
                                                </div>
                                                <span className="font-bold text-white tracking-tight">{inv.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-zinc-400 font-medium">{inv.date}</td>
                                        <td className="px-8 py-6 text-white font-black">{inv.amount}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {inv.icon}
                                                <span className={`${inv.color} font-black uppercase text-[10px] tracking-widest`}>{inv.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="text-[#00e5ff] hover:bg-[#00e5ff]/10 font-bold uppercase text-[10px] tracking-widest"
                                                >
                                                    Detalles
                                                </Button>
                                                <Button 
                                                    onClick={() => handleDownload(inv.id)}
                                                    size="icon" 
                                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    )
}
