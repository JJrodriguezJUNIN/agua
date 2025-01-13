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
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    // Check for specific admin credentials
    if (username === "Juan" && password === "361045") {
      try {
        // Use the admin email for Supabase authentication
        await signIn("juan@admin.com", "361045");
        onLoginSuccess();
        setShowLoginDialog(false);
        toast({
          title: "Acceso concedido",
          description: "Has ingresado como administrador.",
        });
      } catch (error) {
        toast({
          title: "Error de acceso",
          description: "Error al iniciar sesión.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error de acceso",
        description: "Credenciales incorrectas.",
        variant: "destructive",
      });
    }
    setUsername("");
    setPassword("");
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
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleLogin}>Ingresar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};