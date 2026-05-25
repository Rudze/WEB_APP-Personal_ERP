import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LoginModal({ open, onOpenChange }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onOpenChange(false);
      navigate("/dashboards", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div className="glass-card rounded-2xl p-8 relative">
          {/* Glow accent */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(hsl(var(--primary) / 0.3), transparent 70%)", filter: "blur(20px)" }}
          />

          {/* Header */}
          <div className="text-center mb-7 relative">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary-sm">
              <Lock size={18} className="text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight">Connexion</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Accédez à votre espace personnel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="modal-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
              <Input
                id="modal-email"
                type="email"
                placeholder="admin@erp.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-muted/50 border-border/50 focus:border-primary/50 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modal-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mot de passe</Label>
              <Input
                id="modal-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted/50 border-border/50 focus:border-primary/50 h-10"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10 mt-2 font-medium glow-primary-sm"
              disabled={loading}
            >
              {loading ? <Loader2 size={15} className="animate-spin mr-2" /> : null}
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
