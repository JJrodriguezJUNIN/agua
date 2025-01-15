import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error checking session:", error);
        return;
      }
      setIsAdmin(session?.user?.email === "juan@admin.com");
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAdmin(session?.user?.email === "juan@admin.com");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      if (username === "Juan" && password === "361045") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: "juan@admin.com",
          password: "361045",
        });
        
        if (error) {
          console.error("Authentication error:", error);
          toast.error("Error de autenticación: " + error.message);
          throw error;
        }
        
        if (data.user?.email === "juan@admin.com") {
          setIsAdmin(true);
          toast.success("Inicio de sesión exitoso");
        }
      } else {
        toast.error("Credenciales inválidas");
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsAdmin(false);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Error al cerrar sesión: " + error.message);
        throw error;
      }
      
      toast.success("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};