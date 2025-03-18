import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error);
          await supabase.auth.signOut();
          setIsAdmin(false);
          return;
        }
        setIsAdmin(session?.user?.email === "juan@admin.com");
      } catch (error) {
        console.error("Session check failed:", error);
        await supabase.auth.signOut();
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      } else {
        setIsAdmin(session?.user?.email === "juan@admin.com");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      setIsAdmin(false);
      
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Error al cerrar sesión: " + error.message);
        throw error;
      }
      
      toast.success("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isLoading, signIn, signOut }}>
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
