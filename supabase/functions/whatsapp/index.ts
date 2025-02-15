
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppResponse {
  ID?: string;
  op: string;
  qr?: string;
  session?: string;
  status: string;
  token?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { messages, operation } = await req.json();

    // WebSocket URL para el servicio de WhatsApp
    const wsUrl = Deno.env.get('WHATSAPP_WS_URL') || 'wss://tu-servicio-ws.com';
    const socket = new WebSocket(wsUrl);

    const response: WhatsAppResponse = await new Promise((resolve, reject) => {
      socket.onopen = () => {
        console.log("WebSocket conectado");
        
        if (operation === "start_session") {
          socket.send(JSON.stringify({
            op: "obtener_qr",
            token: Deno.env.get('WHATSAPP_TOKEN')
          }));
        } else if (operation === "send_messages" && messages) {
          // Dividir mensajes en grupos de 100
          const messageChunks = [];
          for (let i = 0; i < messages.length; i += 100) {
            messageChunks.push(messages.slice(i, i + 100));
          }

          // Enviar cada grupo de mensajes
          messageChunks.forEach((chunk) => {
            socket.send(JSON.stringify({
              op: "registermessage",
              token: Deno.env.get('WHATSAPP_TOKEN'),
              mensajes: chunk
            }));
          });
        }
      };

      socket.onmessage = async (event) => {
        const data: WhatsAppResponse = JSON.parse(event.data);
        console.log("Mensaje recibido:", data);

        if (data.op === "qr" && data.qr && data.session) {
          // Guardar la sesión en la base de datos
          const { error } = await supabase
            .from('whatsapp_sessions')
            .upsert({
              session_id: data.session,
              qr_code: data.qr,
              status: data.status,
              token: data.token
            });

          if (error) {
            console.error("Error guardando sesión:", error);
          }
        }

        resolve(data);
        socket.close();
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      // Timeout después de 30 segundos
      setTimeout(() => {
        socket.close();
        reject(new Error("Timeout esperando respuesta de WebSocket"));
      }, 30000);
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
