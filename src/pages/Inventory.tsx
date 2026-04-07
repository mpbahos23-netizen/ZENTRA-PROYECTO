import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Box, 
  Search, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpDown, 
  MapPin, 
  BarChart3, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Loader2, 
  Package,
  Weight,
  Coins,
  Warehouse,
  History,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronDown,
  Navigation
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ============================================
// ZENTRA OBSIDIAN: Inventory Terminal
// Total Control Over Logistics Assets
// ============================================

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  min_stock: number;
  unit_price: number;
  weight_kg: number;
  location: string;
  last_updated: string;
}

const CATEGORIES = ["Repuestos", "Mantenimiento", "Electrónica", "Herramientas", "Seguridad"];
const LOCATIONS = ["Almacén Lima Norte", "Bodega Principal", "Centro Logístico Sur", "Oficina Admin"];

const Inventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Repuestos",
    quantity: 0,
    min_stock: 5,
    unit_price: 0,
    weight_kg: 1,
    location: "Almacén Lima Norte"
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error("Error al conectar con la base de datos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // ACTUALIZAR
        const { error } = await supabase
          .from('inventory_items')
          .update({
            ...form,
            last_updated: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Item actualizado con éxito");
      } else {
        // CREAR
        const { error } = await supabase
          .from('inventory_items')
          .insert([{ ...form }]);

        if (error) throw error;
        toast.success("Nuevo item registrado");
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setEditingId(null);
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
     if (!confirm("¿Seguro que quieres eliminar este item del inventario?")) return;
     setIsDeleting(id);
     try {
       const { error } = await supabase.from('inventory_items').delete().eq('id', id);
       if (error) throw error;
       toast.success("Item eliminado");
       fetchItems();
     } catch (error: any) {
       toast.error("Error al eliminar");
     } finally {
       setIsDeleting(null);
     }
  };

  const openEdit = (item: InventoryItem) => {
    setForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      min_stock: item.min_stock,
      unit_price: item.unit_price,
      weight_kg: item.weight_kg,
      location: item.location
    });
    setEditingId(item.id);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setForm({
      name: "",
      sku: "",
      category: "Repuestos",
      quantity: 0,
      min_stock: 5,
      unit_price: 0,
      weight_kg: 1,
      location: "Almacén Lima Norte"
    });
  };

  const stats = {
    totalValue: items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0),
    lowStock: items.filter(i => i.quantity <= i.min_stock).length,
    activeSKUs: items.length,
    totalWeight: items.reduce((acc, item) => acc + (item.weight_kg * item.quantity), 0)
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* HEADER & TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                Z-Terminal <span className="text-blue-500">Inventario</span>
             </h1>
             <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] italic">Logística de Precisión Zentra OS</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  placeholder="BUSCAR POR SKU O NOMBRE..." 
                  className="bg-[#0b1325]/50 border-white/5 pl-11 h-12 rounded-2xl text-[10px] font-black tracking-widest uppercase focus:border-blue-500/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Dialog open={isAddModalOpen} onOpenChange={(val) => { if(!val) resetForm(); setIsAddModalOpen(val); }}>
                <DialogTrigger asChild>
                   <Button className="h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] shrink-0">
                      <Plus className="w-6 h-6" />
                   </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0b1325] border-white/10 rounded-[32px] max-w-lg p-0 overflow-hidden">
                   <DialogHeader className="p-8 pb-0">
                      <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter">Nuevo <span className="text-blue-500">Item</span></DialogTitle>
                   </DialogHeader>
                   <form onSubmit={handleSave} className="p-8 space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex flex-col">
                           <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Código SKU</label>
                           <Input 
                            className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold" 
                            placeholder="Z-SKU-001" 
                            value={form.sku} 
                            onChange={e => setForm({...form, sku: e.target.value.toUpperCase()})}
                            required 
                           />
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                           <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Categoría</label>
                           <Select value={form.category} onValueChange={val => setForm({...form, category: val})}>
                              <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0b1325] border-white/10">
                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Nombre del Producto</label>
                         <Input 
                          className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold" 
                          placeholder="Descripción del item..." 
                          value={form.name}
                          onChange={e => setForm({...form, name: e.target.value})}
                          required 
                         />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Stock Actual</label>
                            <Input 
                              type="number" 
                              className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold" 
                              value={form.quantity}
                              onChange={e => setForm({...form, quantity: parseInt(e.target.value)})}
                            />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Min. Sugerido</label>
                            <Input 
                              type="number" 
                              className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold" 
                              value={form.min_stock}
                              onChange={e => setForm({...form, min_stock: parseInt(e.target.value)})}
                            />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Precio S/.</label>
                            <Input 
                              type="number" 
                              step="0.01"
                              className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold" 
                              value={form.unit_price}
                              onChange={e => setForm({...form, unit_price: parseFloat(e.target.value)})}
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2 flex items-center gap-1">
                              Peso (KG) <Weight className="w-2.5 h-2.5" />
                            </label>
                            <Input 
                              type="number" 
                              step="0.1"
                              className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold" 
                              value={form.weight_kg}
                              onChange={e => setForm({...form, weight_kg: parseFloat(e.target.value)})}
                            />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2 flex items-center gap-1">
                              Ubicación <MapPin className="w-2.5 h-2.5" />
                            </label>
                            <Select value={form.location} onValueChange={val => setForm({...form, location: val})}>
                               <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold">
                                 <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-[#0b1325] border-white/10">
                                 {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                               </SelectContent>
                            </Select>
                         </div>
                      </div>

                      <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-4">
                         REGISTRAR EN TERMINAL
                      </Button>
                   </form>
                </DialogContent>
             </Dialog>
          </div>
        </div>

        {/* ANALYTICS STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: 'Valor Total', value: `S/${stats.totalValue.toLocaleString()}`, icon: Coins, color: 'text-blue-400' },
             { label: 'Stock Crítico', value: stats.lowStock, icon: AlertTriangle, color: 'text-red-400' },
             { label: 'Total SKUs', value: stats.activeSKUs, icon: Package, color: 'text-zinc-400' },
             { label: 'Carga Total', value: `${stats.totalWeight.toLocaleString()} KG`, icon: Weight, color: 'text-emerald-400' },
           ].map((stat, i) => (
             <Card key={i} className="bg-[#0b1325]/50 border-white/5 p-6 rounded-[32px] flex items-center justify-between">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                   <h3 className={cn("text-2xl font-black italic tracking-tighter", stat.color)}>{stat.value}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                   <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
             </Card>
           ))}
        </div>

        {/* MAIN DATA TERMINAL */}
        <Card className="bg-[#0b1325]/80 border-white/5 rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-xl">
           <div className="overflow-x-auto">
              <Table>
                 <TableHeader className="bg-white/5 border-b border-white/5">
                    <TableRow className="border-none hover:bg-transparent">
                       <TableHead className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest py-6 pl-8">Producto / SKU</TableHead>
                       <TableHead className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest py-6">Categoría</TableHead>
                       <TableHead className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest py-6">Status / Stock</TableHead>
                       <TableHead className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest py-6">Peso (KG)</TableHead>
                       <TableHead className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest py-6">Precio Soles</TableHead>
                       <TableHead className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest py-6">Ubicación</TableHead>
                       <TableHead className="text-right py-6 pr-8"></TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {loading ? (
                      <TableRow>
                         <TableCell colSpan={7} className="h-64 text-center">
                            <div className="flex flex-col items-center gap-4">
                               <Loader2 className="w-10 h-10 animate-spin text-blue-500 opacity-20" />
                               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sincronizando con Supabase...</span>
                            </div>
                         </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-40 text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest opacity-40">
                           No se encontraron items en el inventario.
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.map((item) => (
                      <TableRow key={item.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                         <TableCell className="pl-8 py-5">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                  <Box className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-white italic tracking-tight">{item.name}</p>
                                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{item.sku}</p>
                               </div>
                            </div>
                         </TableCell>
                         <TableCell>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{item.category}</span>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-3">
                               <div className={cn(
                                 "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                 item.quantity <= item.min_stock 
                                 ? "bg-red-500/10 text-red-500 border-red-500/20" 
                                 : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                               )}>
                                 {item.quantity} Uni.
                               </div>
                               {item.quantity <= item.min_stock && (
                                 <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                               )}
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-2">
                               <Weight className="w-3 h-3 text-zinc-600" />
                               <span className="text-sm font-black text-zinc-400 italic">{item.weight_kg}</span>
                            </div>
                         </TableCell>
                         <TableCell>
                            <span className="text-sm font-black text-white italic">S/{item.unit_price.toFixed(2)}</span>
                         </TableCell>
                         <TableCell>
                            <div className="inline-flex items-center gap-1.5 bg-zinc-900/50 border border-white/5 px-2 py-1 rounded-lg">
                               <Warehouse className="w-3 h-3 text-zinc-600" />
                               <span className="text-[9px] text-zinc-500 font-bold uppercase">{item.location}</span>
                            </div>
                         </TableCell>
                         <TableCell className="text-right pr-8">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button size="icon" variant="ghost" onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg hover:bg-blue-500/20 hover:text-blue-400">
                                  <Edit3 className="w-4 h-4" />
                               </Button>
                               <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg hover:bg-red-500/20 hover:text-red-400">
                                  {isDeleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                               </Button>
                            </div>
                         </TableCell>
                      </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </div>
        </Card>

        {/* EDIT MODAL */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
           <DialogContent className="bg-[#0b1325] border-white/10 rounded-[32px] max-w-lg p-0">
              <DialogHeader className="p-8 pb-0">
                 <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter">Editar <span className="text-blue-500">Terminal</span></DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="p-8 space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Código SKU</label>
                     <Input 
                        disabled
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold opacity-50" 
                        value={form.sku} 
                     />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                     <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Categoría</label>
                     <Select value={form.category} onValueChange={val => setForm({...form, category: val})}>
                        <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0b1325] border-white/10">
                          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Nombre del Producto</label>
                    <Input 
                      className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold" 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      required 
                    />
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Stock Actual</label>
                       <Input 
                        type="number" 
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold focus:border-emerald-500/50" 
                        value={form.quantity}
                        onChange={e => setForm({...form, quantity: parseInt(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Min. Sugerido</label>
                       <Input 
                        type="number" 
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold" 
                        value={form.min_stock}
                        onChange={e => setForm({...form, min_stock: parseInt(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Precio S/.</label>
                       <Input 
                        type="number" 
                        step="0.01"
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold focus:border-blue-500/50" 
                        value={form.unit_price}
                        onChange={e => setForm({...form, unit_price: parseFloat(e.target.value)})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                       <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Peso Estimado (KG)</label>
                       <Input 
                        type="number" 
                        step="0.1"
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold focus:border-emerald-500/50" 
                        value={form.weight_kg}
                        onChange={e => setForm({...form, weight_kg: parseFloat(e.target.value)})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-2">Terminal de Almacén</label>
                       <Select value={form.location} onValueChange={val => setForm({...form, location: val})}>
                          <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-xl text-white font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0b1325] border-white/10">
                            {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <DialogFooter className="pt-4 flex flex-col gap-2">
                    <Button type="submit" disabled={loading} className="w-full h-14 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200">
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CARGAR ACTUALIZACIÓN"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white">
                       Cancelar Operación
                    </Button>
                 </DialogFooter>
              </form>
           </DialogContent>
        </Dialog>

         {/* MAP PICKER PLACEHOLDER / FLOW */}
         <div className="fixed bottom-10 right-10 z-50">
            <Dialog>
               <DialogTrigger asChild>
                  <Button className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_15px_40px_rgba(37,99,235,0.4)] flex flex-col items-center justify-center gap-1 group">
                     <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />
                     <span className="text-[7px] font-black uppercase tracking-tighter">MAPA</span>
                  </Button>
               </DialogTrigger>
               <DialogContent className="bg-[#060E20] border-white/10 rounded-[48px] max-w-4xl h-[80vh] p-0 overflow-hidden backdrop-blur-3xl">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop')] bg-cover opacity-20" />
                  <div className="relative z-10 w-full h-full flex flex-col">
                     <div className="p-8 pb-4 flex justify-between items-start">
                        <div className="space-y-1">
                           <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Z-Maps <span className="text-blue-500">Logistics</span></h2>
                           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Ubica tus activos en tiempo real</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-4">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Sincronizado</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 flex items-center justify-center p-10">
                        <div className="text-center space-y-6 max-w-sm">
                           <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                              <MapPin className="w-10 h-10 text-blue-500" />
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-xl font-black text-white uppercase tracking-tight italic italic">Integración Google Maps API</h3>
                              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                                 Conectando con terminales GPS externas. Esta vista te permite ver la ubicación real de tu inventario basado en la geolocalización de las unidades.
                              </p>
                           </div>
                           <Button className="bg-white/5 border border-white/10 text-white font-black uppercase text-[9px] tracking-widest h-12 px-8 rounded-xl hover:bg-white/10">
                              Configurar API Key
                           </Button>
                        </div>
                     </div>

                     <div className="p-8 pt-4">
                        <div className="bg-black/40 border border-white/5 rounded-[24px] p-4 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                 <Navigation className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                 <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Dirección sugerida</p>
                                 <p className="text-[11px] font-bold text-zinc-300">Av. Javier Prado Este, San Borja, Lima</p>
                              </div>
                           </div>
                           <Button className="h-10 rounded-xl bg-blue-600 text-white font-black px-6 text-[9px] uppercase tracking-widest">
                              Confirmar Punto
                           </Button>
                        </div>
                     </div>
                  </div>
               </DialogContent>
            </Dialog>
         </div>

      </div>
    </DashboardLayout>
  );
};

export default Inventory;
