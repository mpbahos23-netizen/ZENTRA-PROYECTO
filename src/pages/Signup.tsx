import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Loader2, Sparkles, Shield } from "lucide-react";
import { supabase, SITE_URL } from "@/lib/supabase";
import { toast } from "sonner";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);

    try {
      // 1. Crear cuenta
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${SITE_URL}/login`,
          data: { full_name: name, role },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          throw new Error("Este email ya está registrado. Intenta iniciar sesión.");
        }
        throw signUpError;
      }

      // 2. Intentar login directo (funciona si confirm email está desactivado)
      if (signUpData.session) {
        // Sesión creada directamente — crear perfil y redirigir
        await supabase.from("profiles").upsert([{
          id: signUpData.user!.id,
          full_name: name,
          role,
        }], { onConflict: "id" });

        toast.success(`¡Bienvenido a ZENTRA, ${name}!`);
        navigateByRole(role);
        return;
      }

      // 3. No hay sesión → Supabase requiere confirmación de email
      //    Intentar signInWithPassword por si el email ya estaba confirmado
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginData?.session) {
        await supabase.from("profiles").upsert([{
          id: loginData.user!.id,
          full_name: name,
          role,
        }], { onConflict: "id" });

        toast.success(`¡Bienvenido a ZENTRA, ${name}!`);
        navigateByRole(role);
        return;
      }

      // 4. Login falló → el usuario necesita confirmar su email
      toast.success("Revisa tu correo electrónico para confirmar tu cuenta.", {
        duration: 8000,
        description: "Te enviamos un enlace de activación.",
      });
      navigate("/login");

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al crear la cuenta";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const navigateByRole = (r: string) => {
    switch (r) {
      case "admin": navigate("/admin"); break;
      case "carrier": navigate("/carrier"); break;
      default: navigate("/client");
    }
  };

  return (
    <div className="min-h-screen bg-[#060E20] flex items-center justify-center p-6 font-inter relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -ml-32 -mb-32" />

      <Card className="w-full max-w-md bg-white/[0.02] border-white/5 backdrop-blur-3xl rounded-[48px] p-10 shadow-2xl relative z-10">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ZENTRA Logistics OS</span>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
            Crea tu <span className="text-blue-500">Cuenta</span>
          </h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Únete a la nueva era logística</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-1.5 px-2">
            <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Nombre Completo</Label>
            <Input
              className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-blue-500 text-white font-bold placeholder:text-zinc-700"
              placeholder="Ej. Juan Pérez"
              value={name} onChange={e => setName(e.target.value)} required
            />
          </div>
          <div className="space-y-1.5 px-2">
            <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Email</Label>
            <Input
              className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-blue-500 text-white font-bold placeholder:text-zinc-700"
              type="email" placeholder="tu@empresa.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="space-y-1.5 px-2">
            <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Contraseña</Label>
            <Input
              className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-blue-500 text-white font-bold placeholder:text-zinc-700"
              type="password" placeholder="Mínimo 6 caracteres"
              value={password} onChange={e => setPassword(e.target.value)} required
              minLength={6}
            />
          </div>
          <div className="space-y-1.5 px-2">
            <Label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Rol del Sistema</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-white/5 border-white/5 h-14 rounded-2xl text-white font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0b1325] border-white/10">
                <SelectItem value="carrier" className="text-white hover:bg-blue-500 rounded-xl m-1">Transportista</SelectItem>
                <SelectItem value="client" className="text-white hover:bg-blue-500 rounded-xl m-1">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-[32px] shadow-[0_15px_40px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-3" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>Crear Cuenta<ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-white hover:underline">Acceder</Link>
            </p>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-2 opacity-40">
          <Shield className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">Zentra Security Protocol V3.0</span>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
