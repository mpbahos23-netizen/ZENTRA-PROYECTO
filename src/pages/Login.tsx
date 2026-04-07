import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Truck, ArrowRight, Loader2, Key, Sparkles, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ============================================
// ZENTRA OBSIDIAN: Access Terminal
// Ultra-Minimalist Entry Protocol
// ============================================

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Traducir mensajes de Supabase al español
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email o contraseña incorrectos. Verifica tus datos.");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Tu email no ha sido confirmado. Revisa tu correo.");
        }
        throw error;
      }

      if (data.user) {
        let userRole: string | null = null;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          // Perfil no existe — crearlo ahora
          const meta = data.user.user_metadata as { full_name?: string; role?: string };
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .upsert([{
              id: data.user.id,
              full_name: meta?.full_name ?? email,
              role: meta?.role ?? "client",
            }], { onConflict: "id" })
            .select("role")
            .single();

          if (createError) throw createError;
          userRole = newProfile?.role ?? "client";
        } else if (profileError) {
          throw profileError;
        } else {
          userRole = profile?.role ?? null;
        }

        toast.success("¡Acceso concedido! Bienvenido de nuevo.");

        switch (userRole) {
          case "admin": navigate("/admin"); break;
          case "carrier": navigate("/carrier"); break;
          case "client": navigate("/client"); break;
          default: navigate("/");
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al iniciar sesión";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060E20] flex items-center justify-center p-6 font-inter relative overflow-hidden">
       {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -ml-32 -mb-32" />

      <Card className="w-full max-w-md bg-white/[0.02] border-white/5 backdrop-blur-3xl rounded-[48px] p-12 shadow-2xl relative z-10">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4">
             <Key className="w-3.5 h-3.5 text-blue-500" />
             <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">ZENTRA SECURE LOGIN</span>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
             Bienvenido de <span className="text-blue-500">Nuevo</span>
          </h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Acceso al Sistema Logístico</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-1.5 px-2">
            <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Identificación</Label>
            <Input 
              className="bg-white/5 border-white/5 h-16 rounded-[24px] focus:ring-blue-500 text-white font-bold placeholder:text-zinc-800 transition-all focus:bg-white/[0.05]" 
              type="email" placeholder="tu@empresa.com" 
              value={email} onChange={e => setEmail(e.target.value)} required 
            />
          </div>
          <div className="space-y-1.5 px-2">
            <div className="flex items-center justify-between mb-1">
               <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Contraseña</Label>
               <Link to="/forgot-password" className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline">
                  Recuperar
               </Link>
            </div>
            <Input 
              className="bg-white/5 border-white/5 h-16 rounded-[24px] focus:ring-blue-500 text-white font-bold placeholder:text-zinc-800 transition-all focus:bg-white/[0.05]" 
              type="password" placeholder="••••••••" 
              value={password} onChange={e => setPassword(e.target.value)} required 
            />
          </div>

          <div className="pt-6 space-y-4">
            <Button type="submit" className="w-full h-18 bg-white text-black font-black uppercase tracking-[0.3em] rounded-[32px] shadow-[0_20px_40px_rgba(255,255,255,0.05)] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 text-sm relative group overflow-hidden" disabled={loading}>
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  Entrar al Sistema
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              ¿Sin credenciales?{" "}
              <Link to="/signup" className="text-blue-500 hover:text-white transition-colors">Crear Cuenta</Link>
            </p>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-2 opacity-30">
           <Shield className="w-3 h-3 text-zinc-500" />
           <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic tracking-widest">Zentra OS Terminal v3.0.1</span>
        </div>
      </Card>
    </div>
  );
};

export default Login;
