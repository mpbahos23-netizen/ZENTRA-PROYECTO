import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ListChecks, Plus, Trash2, ShieldCheck, 
  AlertCircle, ChevronRight, Hash, Info,
  Scale, Box, History, CheckCircle2, Clock,
  Save, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================
// ZENTRA INVENTARIO (Z-Inventario)
// Dynamic Manifest & Logic Controls
// ============================================

interface ManifestItem {
  id: string;
  name: string;
  quantity: number;
  weightPerUnit: number; // KG
  status: 'pending' | 'verified' | 'flagged';
  lastAudit: string;
}

interface DigitalManifestProps {
  items: ManifestItem[];
  onUpdate?: (items: ManifestItem[]) => void;
  readOnly?: boolean;
}

export default function DigitalManifest({ 
  items: initialItems, 
  onUpdate, 
  readOnly = false 
}: DigitalManifestProps) {
  const [items, setItems] = useState<ManifestItem[]>(initialItems || []);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  // Local state for editing to allow "Guardar" button functionality
  const [editFields, setEditFields] = useState<{
    quantity: number;
    weightPerUnit: number;
  }>({ quantity: 1, weightPerUnit: 1 });

  const addItem = () => {
    const newItem: ManifestItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nuevo Item ' + (items.length + 1),
      quantity: 1,
      weightPerUnit: 5,
      status: 'pending',
      lastAudit: new Date().toISOString()
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    onUpdate?.(newItems);
    toast.info('Item añadido al manifiesto');
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    onUpdate?.(newItems);
  };

  const toggleStatus = (id: string) => {
    if (readOnly) return;
    const newItems = items.map(i => {
      if (i.id === id) {
        const nextStatus: Record<string, ManifestItem['status']> = {
          pending: 'verified',
          verified: 'flagged',
          flagged: 'pending'
        };
        return { ...i, status: nextStatus[i.status], lastAudit: new Date().toISOString() };
      }
      return i;
    });
    setItems(newItems);
    onUpdate?.(newItems);
  };

  const updateItemName = (id: string, name: string) => {
    const newItems = items.map(i => i.id === id ? { ...i, name } : i);
    setItems(newItems);
    onUpdate?.(newItems);
  };

  const handleApplyChanges = (id: string) => {
    const newItems = items.map(i => 
      i.id === id ? { 
        ...i, 
        quantity: editFields.quantity, 
        weightPerUnit: editFields.weightPerUnit,
        lastAudit: new Date().toISOString()
      } : i
    );
    setItems(newItems);
    onUpdate?.(newItems);
    toast.success("Cambios guardados");
    // Optionally close the accordion or stay open
  };

  const handleExpand = (item: ManifestItem) => {
    if (activeItem === item.id) {
      setActiveItem(null);
    } else {
      setActiveItem(item.id);
      setEditFields({
        quantity: item.quantity,
        weightPerUnit: item.weightPerUnit
      });
    }
  };

  const totalWeight = items.reduce((acc, curr) => acc + (curr.quantity * curr.weightPerUnit), 0);
  const verifiedCount = items.filter(i => i.status === 'verified').length;

  return (
    <Card className="bg-[#050505] border-white/5 rounded-[32px] overflow-hidden shadow-2xl font-inter">
      {/* AUDIT HEADER: Zentra Inventario */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-transparent flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
               <ShieldCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
               <h3 className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Zentra Inventario</h3>
               <p className="text-zinc-500 text-[8px] font-medium tracking-widest uppercase">VERIFICACIÓN DE CARGA EN TIEMPO REAL</p>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Tasa de Auditoría</p>
               <p className="text-emerald-400 font-mono text-[10px]">{verifiedCount}/{items.length} VALIDADOS</p>
            </div>
            {!readOnly && (
              <Button 
                onClick={addItem}
                size="sm"
                className="h-9 px-4 bg-white text-black hover:bg-zinc-200 rounded-xl text-[9px] font-black uppercase tracking-widest"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
              </Button>
            )}
         </div>
      </div>

      {/* ITEM TRACKING GRID */}
      <div className="p-4 space-y-3">
        {items.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-700 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
             <Box className="w-8 h-8 mb-2 opacity-20" />
             <p className="text-[9px] font-black uppercase tracking-widest">El manifiesto está vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id}
              className={cn(
                "group relative bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/[0.02] cursor-pointer",
                activeItem === item.id && "bg-white/[0.04] border-blue-500/30"
              )}
            >
               <div className="flex items-center justify-between" onClick={() => handleExpand(item)}>
                  <div className="flex items-center gap-4">
                     {/* Item Indicator with Status */}
                     <div 
                       onClick={(e) => { e.stopPropagation(); toggleStatus(item.id); }}
                       className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        item.status === 'verified' ? "bg-emerald-500/10 text-emerald-500" :
                        item.status === 'flagged' ? "bg-red-500/10 text-red-500" :
                        "bg-white/5 text-zinc-600 group-hover:bg-white/10"
                       )}
                     >
                        {item.status === 'verified' ? <CheckCircle2 className="w-5 h-5" /> : 
                         item.status === 'flagged' ? <AlertCircle className="w-5 h-5" /> : 
                         <Box className="w-5 h-5" />}
                     </div>

                     <div className="space-y-1">
                        {readOnly ? (
                          <p className="text-white font-bold text-xs uppercase tracking-tight">{item.name}</p>
                        ) : (
                          <input 
                            value={item.name}
                            onChange={(e) => updateItemName(item.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent border-none text-white font-black text-xs uppercase tracking-tight focus:ring-0 p-0 w-32 md:w-48 appearance-none"
                          />
                        )}
                        <div className="flex items-center gap-3">
                           <span className="flex items-center gap-1 text-[8px] text-zinc-600 font-black uppercase tracking-widest">
                              <Hash className="w-3 h-3" /> Cant: {item.quantity}
                           </span>
                           <span className="flex items-center gap-1 text-[8px] text-zinc-600 font-black uppercase tracking-widest">
                              <Scale className="w-3 h-3" /> {item.quantity * item.weightPerUnit}KG
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     {!readOnly ? (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                              className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-[0_4px_10px_rgba(239,68,68,0.2)]"
                            >
                               <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                     ) : (
                        item.status === 'verified' && (
                           <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                              <ShieldCheck className="w-3 h-3 text-emerald-500" />
                              <span className="text-[7px] text-emerald-500 font-black uppercase">Seguro</span>
                           </div>
                        )
                     )}
                     <ChevronRight className={cn("w-4 h-4 text-zinc-800 transition-transform", activeItem === item.id && "rotate-90")} />
                  </div>
               </div>

               {/* Expanded Controls: Now with manual SAVE button */}
               {activeItem === item.id && !readOnly && (
                  <div className="mt-4 pt-6 border-t border-white/5 space-y-6 animate-in fade-in slide-in-from-top-2">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] px-1 italic">Cantidad</label>
                            <Input 
                              type="number"
                              value={editFields.quantity}
                              onChange={(e) => setEditFields({...editFields, quantity: parseInt(e.target.value) || 0})}
                              className="bg-zinc-900/50 border-white/10 h-12 text-white font-black text-sm rounded-2xl focus:border-blue-500/50 transition-all placeholder:text-zinc-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] px-1 italic">Peso X Unidad</label>
                            <Input 
                              type="number"
                              value={editFields.weightPerUnit}
                              onChange={(e) => setEditFields({...editFields, weightPerUnit: parseInt(e.target.value) || 0})}
                              className="bg-zinc-900/50 border-white/10 h-12 text-white font-black text-sm rounded-2xl focus:border-blue-500/50 transition-all placeholder:text-zinc-800"
                            />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="p-4 bg-white/[0.02] rounded-2xl flex items-center justify-between border border-white/5">
                           <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-zinc-600" />
                              <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest italic">{new Date(item.lastAudit).toLocaleTimeString()}</span>
                           </div>
                           <Button variant="ghost" className="h-6 text-[7px] font-bold uppercase text-zinc-600 hover:text-white">Audit Log</Button>
                        </div>
                        
                        {/* GUARDAR BUTTON: Only update parent when clicked */}
                        <Button 
                          onClick={() => handleApplyChanges(item.id)}
                          className="h-14 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.2)] group/btn flex items-center justify-center gap-2 text-[10px]"
                        >
                           <Save className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                           GUARDAR CAMBIOS
                        </Button>
                     </div>
                  </div>
               )}
            </div>
          ))
        )}
      </div>

      {/* AUDIT SUMMARY: Footer Stats */}
      <div className="p-6 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-10">
            <div className="space-y-1">
               <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest italic">Total Masa</p>
               <p className="text-white font-black text-lg italic tracking-tight uppercase leading-none">{totalWeight.toLocaleString()} KG</p>
            </div>
            <div className="space-y-1">
               <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest italic">Capacidad IA</p>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  <p className="text-white font-black text-lg italic tracking-tight uppercase leading-none">99.2%</p>
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-2 text-zinc-800">
            <Check className="w-4 h-4" />
            <span className="text-[8px] font-mono tracking-tighter uppercase font-black">ZENTRA_SYS_AUTH_OK</span>
         </div>
      </div>
    </Card>
  );
}
