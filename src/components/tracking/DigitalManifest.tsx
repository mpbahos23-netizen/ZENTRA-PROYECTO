import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Package, ListChecks, ShieldCheck } from 'lucide-react';

interface ManifestItem {
  id: string;
  name: string;
  quantity: number;
}

interface DigitalManifestProps {
  items: ManifestItem[];
  onUpdate?: (items: ManifestItem[]) => void;
  readOnly?: boolean;
}

export default function DigitalManifest({ items, onUpdate, readOnly = false }: DigitalManifestProps) {
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('1');

  const addItem = () => {
    if (!itemName) return;
    const newItem: ManifestItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: itemName,
      quantity: parseInt(itemQty) || 1
    };
    if (onUpdate) onUpdate([...items, newItem]);
    setItemName('');
    setItemQty('1');
  };

  const removeItem = (id: string) => {
    if (onUpdate) onUpdate(items.filter(item => item.id !== id));
  };

  return (
    <Card className="bg-[#060E20] border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
      
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-blue-500" />
            </div>
            <div>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Manifiesto Digital</h3>
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-0.5">Control de Inventario ZENTRA</p>
            </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Verificado</span>
        </div>
      </div>

      {!readOnly && (
        <div className="grid grid-cols-6 gap-3 pt-2">
           <Input 
             placeholder="Ej: Sillas Gamer" 
             value={itemName} 
             onChange={(e) => setItemName(e.target.value)}
             className="col-span-3 bg-white/5 border-white/5 text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
           />
           <Input 
             type="number"
             value={itemQty} 
             onChange={(e) => setItemQty(e.target.value)}
             className="col-span-2 bg-white/5 border-white/5 text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
           />
           <Button onClick={addItem} className="bg-blue-600 h-12 w-12 rounded-xl p-0 shadow-lg shadow-blue-600/20">
              <Plus className="w-5 h-5 text-white" />
           </Button>
        </div>
      )}

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="py-10 text-center space-y-3">
             <Package className="w-10 h-10 text-zinc-800 mx-auto" />
             <p className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.2em]">No hay ítems registrados</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between group/item bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.04] transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-blue-500">
                     {item.quantity}
                  </div>
                  <p className="text-[10px] text-white font-black uppercase tracking-tight">{item.name}</p>
               </div>
               {!readOnly && (
                 <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                 </button>
               )}
            </div>
          ))
        )}
      </div>

      <div className="pt-6 border-t border-white/5">
         <div className="flex justify-between items-center px-2">
            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Total de Unidades</span>
            <span className="text-lg font-black text-white italic">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
         </div>
      </div>
    </Card>
  );
}
