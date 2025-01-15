import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLoginProps {
  showLoginDialog: boolean;
  setShowLoginDialog: (show: boolean) => void;
  onLoginSuccess: () => void;
}

export const AdminLogin = ({
  showLoginDialog,
  setShowLoginDialog,
  onLoginSuccess,
}: AdminLoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: "Error de acceso",
        description: "Por favor ingrese usuario y contraseña.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signIn(username, password);
      onLoginSuccess();
      setShowLoginDialog(false);
      toast({
        title: "Acceso concedido",
        description: "Has ingresado como administrador.",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error de acceso",
        description: "Error al iniciar sesión. Verifique sus credenciales.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUsername("");
      setPassword("");
    }
  };

  return (
    <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acceso Administrador</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};