import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Truck, ArrowLeft, Loader2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
      toast.error(error.message || "Error al enviar el correo de recuperación");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center gap-2 justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-teal" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Revisa tu correo</h1>
            <p className="text-sm text-muted-foreground">
              Hemos enviado instrucciones para restablecer tu contraseña a <strong>{email}</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button asChild className="w-full bg-teal-gradient">
              <Link to="/login">Volver al inicio de sesión</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              ¿No recibiste el correo? Revisa tu carpeta de spam o intenta de nuevo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center pb-2">
          <Link to="/login" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-gradient flex items-center justify-center">
              <Truck className="w-6 h-6 text-accent-foreground" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">¿Olvidaste tu contraseña?</h1>
          <p className="text-sm text-muted-foreground">Ingresa tu correo para recibir un enlace de recuperación</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="tu@empresa.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-teal-gradient hover:opacity-90" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar enlace"}
            </Button>
            <Link to="/login" className="flex items-center justify-center text-sm font-medium text-teal hover:underline gap-1">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
