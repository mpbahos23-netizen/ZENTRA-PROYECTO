import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package, Search, Plus, Filter,
  AlertTriangle, Loader2, Edit2, Trash2,
  TrendingUp, BarChart3, Box, Zap, X, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer, BarChart, Bar, XAxis,
  CartesianGrid, Tooltip, Cell
} from 'recharts';

// ============================================
// ZENTRA INVENTORY: Supply Chain Terminal
// Full CRUD with Supabase
// ============================================

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  min_stock: number;
  unit_price: number;
  location: string;
  last_updated: string;
}

const EMPTY_FORM: Omit<InventoryItem, 'id' | 'last_updated'> = {
  name: '',
  sku: '',
  category: 'Carrier Parts',
  quantity: 0,
  min_stock: 5,
  unit_price: 0,
  location: 'Wh-Alpha',
};

const CATEGORIES = ['Carrier Parts', 'Maintenance', 'Electronics', 'Tools', 'Misc'];
const LOCATIONS = ['Wh-Alpha', 'Wh-Beta', 'Wh-Main', 'Wh-Norte', 'Wh-Sur'];

// Simple modal dialog (no radix dependency issues)
function Modal({ open, title, onClose, children }: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[32px] w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 duration-300 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ItemForm({ form, onChange, onSubmit, saving, submitLabel }: {
  form: Omit<InventoryItem, 'id' | 'last_updated'>;
  onChange: (field: keyof typeof form, value: string | number) => void;
  onSubmit: () => void;
  saving: boolean;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Nombre del Producto *</label>
          <Input
            value={form.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="Ej: Aceite 5W-30"
            className="bg-black border-white/10 text-white h-11 rounded-xl placeholder:text-zinc-700"
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">SKU *</label>
          <Input
            value={form.sku}
            onChange={e => onChange('sku', e.target.value.toUpperCase())}
            placeholder="OIL-030"
            className="bg-black border-white/10 text-white h-11 rounded-xl placeholder:text-zinc-700"
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Categoría</label>
          <select
            value={form.category}
            onChange={e => onChange('category', e.target.value)}
            className="w-full h-11 bg-black border border-white/10 rounded-xl text-white text-sm px-3 focus:outline-none focus:border-[#00e5ff]/50"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Stock Actual</label>
          <Input
            type="number"
            min="0"
            value={form.quantity}
            onChange={e => onChange('quantity', Number(e.target.value))}
            className="bg-black border-white/10 text-white h-11 rounded-xl"
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Stock Mínimo</label>
          <Input
            type="number"
            min="0"
            value={form.min_stock}
            onChange={e => onChange('min_stock', Number(e.target.value))}
            className="bg-black border-white/10 text-white h-11 rounded-xl"
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Precio Unitario ($)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.unit_price}
            onChange={e => onChange('unit_price', Number(e.target.value))}
            className="bg-black border-white/10 text-white h-11 rounded-xl"
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Almacén</label>
          <select
            value={form.location}
            onChange={e => onChange('location', e.target.value)}
            className="w-full h-11 bg-black border border-white/10 rounded-xl text-white text-sm px-3 focus:outline-none focus:border-[#00e5ff]/50"
          >
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <Button
        onClick={onSubmit}
        disabled={saving || !form.name.trim() || !form.sku.trim()}
        className="w-full h-12 rounded-xl bg-[#00e5ff] text-black font-black uppercase text-[10px] tracking-widest mt-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" />{submitLabel}</>}
      </Button>
    </div>
  );
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);

  const stats = {
    totalValue: items.reduce((s, i) => s + i.quantity * i.unit_price, 0),
    itemCount: items.length,
    lowStockCount: items.filter(i => i.quantity <= i.min_stock).length,
  };

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        // Table doesn't exist yet — show demo data
        const demo: InventoryItem[] = [
          { id: '1', name: 'Llantas de Alto Rendimiento', sku: 'WHE-001', category: 'Carrier Parts', quantity: 12, min_stock: 15, unit_price: 120, location: 'Wh-Alpha', last_updated: new Date().toISOString() },
          { id: '2', name: 'Aceite Sintético 5W-30', sku: 'OIL-030', category: 'Maintenance', quantity: 45, min_stock: 20, unit_price: 35, location: 'Wh-Beta', last_updated: new Date().toISOString() },
          { id: '3', name: 'Sensores Proximidad Z-1', sku: 'SNS-Z1', category: 'Electronics', quantity: 8, min_stock: 10, unit_price: 250, location: 'Wh-Alpha', last_updated: new Date().toISOString() },
          { id: '4', name: 'Pallets de Madera Std', sku: 'PLT-00', category: 'Tools', quantity: 120, min_stock: 50, unit_price: 15, location: 'Wh-Main', last_updated: new Date().toISOString() },
        ];
        setItems(demo);
        toast.info('Modo demo: crea la tabla "inventory" en Supabase para activar el CRUD.', { duration: 5000 });
      } else {
        toast.error('Error al sincronizar inventario');
      }
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // CREATE
  const handleCreate = async () => {
    if (!addForm.name.trim() || !addForm.sku.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('inventory').insert({
      ...addForm,
      last_updated: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast.error('Error al crear item: ' + error.message);
      return;
    }
    toast.success(`✅ ${addForm.name} añadido al inventario`);
    setShowAdd(false);
    setAddForm({ ...EMPTY_FORM });
    fetchData();
  };

  // OPEN EDIT
  const openEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name, sku: item.sku, category: item.category,
      quantity: item.quantity, min_stock: item.min_stock,
      unit_price: item.unit_price, location: item.location,
    });
    setShowEdit(true);
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase
      .from('inventory')
      .update({ ...editForm, last_updated: new Date().toISOString() })
      .eq('id', editingId);
    setSaving(false);
    if (error) {
      toast.error('Error al actualizar: ' + error.message);
      return;
    }
    toast.success('✅ Item actualizado');
    setShowEdit(false);
    fetchData();
  };

  // DELETE
  const handleDelete = async () => {
    if (!showDeleteId) return;
    setSaving(true);
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', showDeleteId);
    setSaving(false);
    if (error) {
      toast.error('Error al eliminar: ' + error.message);
      return;
    }
    toast.success('Item eliminado del inventario');
    setShowDeleteId(null);
    fetchData();
  };

  const filtered = items.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchSearch = item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    const matchCat = filterCategory === 'all' || item.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 pb-4 animate-in fade-in duration-700">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              SUPPLY <span className="text-[#00e5ff]">TERMINAL</span>
            </h1>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2 mt-1">
              <Zap className="w-3 h-3 text-[#00e5ff] animate-pulse" />
              Control Maestro de Almacén
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={fetchData}
              disabled={loading}
              variant="outline"
              className="flex-1 sm:flex-none h-11 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sincronizar"}
            </Button>
            <Button
              onClick={() => { setAddForm({ ...EMPTY_FORM }); setShowAdd(true); }}
              className="flex-1 sm:flex-none h-11 rounded-xl bg-[#00e5ff] text-black font-black uppercase text-[10px] tracking-widest shadow-[0_8px_24px_rgba(0,229,255,0.2)]"
            >
              <Plus className="w-4 h-4 mr-2" /> Añadir SKU
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Valor Total', value: `$${stats.totalValue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Stock Bajo', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Items SKU', value: stats.itemCount, icon: Box, color: 'text-[#00e5ff]', bg: 'bg-[#00e5ff]/10' },
            { label: 'Categorías', value: CATEGORIES.length, icon: BarChart3, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          ].map((stat, i) => (
            <Card key={i} className="bg-[#0a0a0a] border-white/5 rounded-[24px] p-6">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="bg-[#0a0a0a] border-white/5 rounded-[32px] p-6 md:p-8">
          <h3 className="text-base font-black text-white uppercase italic tracking-tight mb-6">Análisis de Stock por Categoría</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CATEGORIES.map(cat => ({
              name: cat.split(' ')[0],
              v: items.filter(i => i.category === cat).reduce((s, i) => s + i.quantity, 0)
            }))}>
              <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00e5ff', borderRadius: 16 }} />
              <Bar dataKey="v" radius={[8, 8, 0, 0]}>
                {CATEGORIES.map((_, index) => (
                  <Cell key={index} fill={index % 2 === 0 ? '#00e5ff' : '#00e5ff33'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Table */}
        <Card className="bg-[#0a0a0a] border-white/5 rounded-[32px] overflow-hidden">
          {/* Table filters */}
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <Input
                placeholder="Buscar por nombre o SKU..."
                className="h-11 bg-black border-white/5 rounded-xl pl-10 text-xs font-black uppercase placeholder:text-zinc-800"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="h-11 bg-black border border-white/5 rounded-xl text-zinc-400 text-xs font-black uppercase px-4 focus:outline-none min-w-[140px]"
            >
              <option value="all">Todas</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Badge className="bg-white/5 text-zinc-500 border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest self-center whitespace-nowrap">
              {filtered.length} items
            </Badge>
          </div>

          {loading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#00e5ff]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-600 font-black uppercase text-[9px] h-12 pl-6">Producto</TableHead>
                    <TableHead className="text-zinc-600 font-black uppercase text-[9px] hidden md:table-cell">Almacén</TableHead>
                    <TableHead className="text-zinc-600 font-black uppercase text-[9px]">Stock</TableHead>
                    <TableHead className="text-zinc-600 font-black uppercase text-[9px] hidden sm:table-cell">Precio</TableHead>
                    <TableHead className="text-zinc-600 font-black uppercase text-[9px] text-right pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id} className="border-white/5 hover:bg-white/[0.02] group">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center border border-white/5 shrink-0",
                            item.quantity <= item.min_stock ? "bg-red-500/10" : "bg-white/5"
                          )}>
                            <Package className={cn("w-4 h-4", item.quantity <= item.min_stock ? "text-red-500" : "text-zinc-500")} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[140px] sm:max-w-none">{item.name}</p>
                            <span className="text-[9px] font-black text-[#00e5ff] tracking-widest">{item.sku}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.location}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 w-20">
                          <div className="flex items-end gap-1">
                            <span className={cn("text-lg font-black", item.quantity <= item.min_stock ? "text-red-500" : "text-white")}>
                              {item.quantity}
                            </span>
                            <span className="text-[8px] text-zinc-700 font-black mb-0.5">/{item.min_stock}</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", item.quantity <= item.min_stock ? "bg-red-500" : "bg-emerald-500")}
                              style={{ width: `${Math.min((item.quantity / Math.max(item.min_stock * 2, 1)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <p className="text-sm font-black text-zinc-300">${item.unit_price.toFixed(2)}</p>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(item)}
                            className="w-9 h-9 rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDeleteId(item.id)}
                            className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filtered.length === 0 && (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-zinc-800" />
                  </div>
                  <h4 className="text-white font-black uppercase tracking-tight mb-2 text-sm">Sin Resultados</h4>
                  <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Ajusta los filtros de búsqueda.</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ADD DIALOG */}
      <Modal open={showAdd} title="Añadir Nuevo SKU" onClose={() => setShowAdd(false)}>
        <ItemForm
          form={addForm}
          onChange={(field, value) => setAddForm(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleCreate}
          saving={saving}
          submitLabel="Crear Item"
        />
      </Modal>

      {/* EDIT DIALOG */}
      <Modal open={showEdit} title="Editar Item" onClose={() => setShowEdit(false)}>
        <ItemForm
          form={editForm}
          onChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleUpdate}
          saving={saving}
          submitLabel="Guardar Cambios"
        />
      </Modal>

      {/* DELETE CONFIRMATION */}
      <Modal open={!!showDeleteId} title="Confirmar Eliminación" onClose={() => setShowDeleteId(null)}>
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-white font-bold">¿Eliminar este item del inventario?</p>
            <p className="text-xs text-zinc-500 mt-1">Esta acción no se puede deshacer.</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteId(null)}
              className="flex-1 border-white/10 text-zinc-400 hover:text-white bg-transparent h-11 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[10px] tracking-widest h-11 rounded-xl"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
