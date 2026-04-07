import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, KeyRound, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase inyecta el access_token en la URL cuando el usuario hace clic
    // en el enlace de recovery. El cliente con detectSessionInUrl: true
    // lo captura automáticamente y crea una sesión temporal.
    // Solo necesitamos esperar a que eso suceda.

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
        setError(null);
      } else if (event === 'SIGNED_IN' && session) {
        // También funciona si el evento es SIGNED_IN directo (ej. en algunos navegadores)
        setSessionReady(true);
        setError(null);
      }
    });

    // Verificar si ya hay sesión activa (el usuario ya fue redirigido y el token fue procesado)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        // Dar 3 segundos para que detectSessionInUrl procese el hash
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            setSessionReady(true);
          } else {
            setError("El enlace de recuperación ha expirado o ya fue utilizado. Solicita uno nuevo.");
          }
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        if (error.message.includes("same password")) {
          throw new Error("La nueva contraseña debe ser diferente a la anterior.");
        }
        throw error;
      }

      toast.success("¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.");
      // Cerrar sesión temporal de recovery para forzar login limpio
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al actualizar la contraseña";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060E20] flex items-center justify-center p-6 font-inter relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -ml-32 -mb-32" />

      <Card className="w-full max-w-md bg-white/[0.02] border-white/5 backdrop-blur-3xl rounded-[48px] p-12 shadow-2xl relative z-10">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4">
            <KeyRound className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Nueva Contraseña</span>
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
            Restablecer <span className="text-blue-500">Acceso</span>
          </h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Establece tu nueva contraseña</p>
        </div>

        {error ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">{error}</p>
            <Button
              onClick={() => navigate("/forgot-password")}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-[28px]"
            >
              Solicitar nuevo enlace
            </Button>
          </div>
        ) : !sessionReady ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Verificando enlace de recuperación...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-1.5 px-2">
              <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Nueva Contraseña</Label>
              <Input
                className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-blue-500 text-white font-bold placeholder:text-zinc-700"
                type="password" placeholder="Mínimo 6 caracteres"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              />
            </div>
            <div className="space-y-1.5 px-2">
              <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Confirmar Contraseña</Label>
              <Input
                className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-blue-500 text-white font-bold placeholder:text-zinc-700"
                type="password" placeholder="Repite tu contraseña"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6}
              />
            </div>
            <Button type="submit" className="w-full h-16 bg-white text-black font-black uppercase tracking-[0.2em] rounded-[32px] shadow-[0_20px_40px_rgba(255,255,255,0.05)] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Actualizar Contraseña
                </>
              )}
            </Button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-2 opacity-30">
          <Shield className="w-3 h-3 text-zinc-500" />
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">Zentra Recovery Protocol</span>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
