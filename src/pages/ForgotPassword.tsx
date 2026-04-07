import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, Shield, Key } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// ============================================
// ZENTRA OBSIDIAN: Password Recovery
// ============================================

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Enlace de recuperación enviado a tu correo");
    } catch (error: any) {
      if (error.message?.includes("rate limit")) {
        toast.error("Demasiados intentos. Espera unos minutos e intenta de nuevo.");
      } else {
        toast.error(error.message || "Error al enviar el correo de recuperación");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#060E20] flex items-center justify-center p-6 font-inter relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
        <Card className="w-full max-w-md bg-white/[0.02] border-white/5 backdrop-blur-3xl rounded-[48px] p-12 shadow-2xl relative z-10 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.15)]">
              <Mail className="w-10 h-10 text-blue-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Revisa tu <span className="text-blue-500">Correo</span></h1>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-relaxed">
                Hemos enviado instrucciones para restablecer tu contraseña a <span className="text-white">{email}</span>
              </p>
            </div>
            <div className="w-full space-y-3 pt-4">
              <Button asChild className="w-full h-14 rounded-[28px] bg-white text-black font-black uppercase tracking-[0.2em]">
                <Link to="/login">Volver al Login</Link>
              </Button>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                ¿No recibiste el correo? Revisa la carpeta de spam.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060E20] flex items-center justify-center p-6 font-inter relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -ml-32 -mb-32" />

      <Card className="w-full max-w-md bg-white/[0.02] border-white/5 backdrop-blur-3xl rounded-[48px] p-12 shadow-2xl relative z-10">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4">
             <Key className="w-3.5 h-3.5 text-blue-500" />
             <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Recuperar Acceso</span>
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
            ¿Olvidaste tu <span className="text-blue-500">Contraseña</span>?
          </h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Ingresa tu correo para recibir un enlace</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-8">
          <div className="space-y-1.5 px-2">
            <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Email Registrado</Label>
            <Input 
              className="bg-white/5 border-white/5 h-16 rounded-[24px] focus:ring-blue-500 text-white font-bold placeholder:text-zinc-800 transition-all focus:bg-white/[0.05]" 
              type="email" 
              placeholder="tu@empresa.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-[32px] shadow-[0_15px_40px_rgba(37,99,235,0.3)] transition-all" 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar enlace de recuperación"}
          </Button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors pt-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Login
          </Link>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-2 opacity-30">
           <Shield className="w-3 h-3 text-zinc-500" />
           <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">Zentra Recovery Protocol</span>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
