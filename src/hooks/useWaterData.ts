import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Person, WaterConfig, SupabasePerson, SupabaseWaterConfig } from '../types/water';
import { supabase } from '../integrations/supabase/client';
import { Json } from '../integrations/supabase/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const mapSupabasePersonToPerson = (person: SupabasePerson): Person => ({
  id: person.id,
  name: person.name,
  avatar: person.avatar,
  hasPaid: person.has_paid,
  receipt: person.receipt,
  paymentHistory: (person.payment_history || []) as any[],
  lastPaymentMonth: person.last_payment_month,
  pendingAmount: person.pending_amount,
});

const mapSupabaseConfigToConfig = (config: SupabaseWaterConfig): WaterConfig => ({
  id: config.id,
  bottlePrice: config.bottle_price,
  bottleCount: config.bottle_count,
});

export const useWaterData = () => {
  const queryClient = useQueryClient();

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['waterConfig'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_config')
        .select('*')
        .single();

      if (error) throw error;
      return mapSupabaseConfigToConfig(data);
    }
  });

  const { data: people, isLoading: peopleLoading } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*');

      if (error) throw error;
      return data.map(mapSupabasePersonToPerson);
    }
  });

  const updateConfig = async (updates: Partial<WaterConfig>) => {
    const { error } = await supabase
      .from('water_config')
      .update({
        bottle_price: updates.bottlePrice,
        bottle_count: updates.bottleCount,
      })
      .eq('id', 1);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['waterConfig'] });
    toast.success('Configuración actualizada');
  };

  const addPerson = async (person: Omit<Person, 'id'>) => {
    const { error } = await supabase
      .from('people')
      .insert({
        name: person.name,
        avatar: person.avatar,
        has_paid: person.hasPaid,
        payment_history: person.paymentHistory as Json[],
        receipt: person.receipt,
        last_payment_month: person.lastPaymentMonth,
        pending_amount: person.pendingAmount,
      });

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['people'] });
    toast.success('Usuario agregado exitosamente');
  };

  const updatePerson = async ({ id, updates }: { id: string; updates: Partial<Person> }) => {
    const { error } = await supabase
      .from('people')
      .update({
        name: updates.name,
        avatar: updates.avatar,
        has_paid: updates.hasPaid,
        payment_history: updates.paymentHistory as Json[],
        receipt: updates.receipt,
        last_payment_month: updates.lastPaymentMonth,
        pending_amount: updates.pendingAmount,
      })
      .eq('id', id);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['people'] });
    toast.success('Usuario actualizado exitosamente');
  };

  const deletePerson = async (id: string) => {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['people'] });
    toast.success('Usuario eliminado exitosamente');
  };

  const uploadFile = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading:', uploadError);
        toast.error('Error al subir el comprobante');
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir el comprobante');
      return null;
    }
  };

  const getCurrentMonth = () => {
    return format(new Date(), "MMMM yyyy", { locale: es });
  };

  const processPayment = async (personId: string) => {
    const person = people?.find(p => p.id === personId);
    if (!person || !config) return;

    const amount = (config.bottlePrice * config.bottleCount) / (people?.length || 1);
    const currentMonth = getCurrentMonth();

    const payment = {
      date: new Date().toISOString(),
      amount,
      receipt: person.receipt,
      month: currentMonth,
    };

    await updatePerson({
      id: personId,
      updates: {
        hasPaid: true,
        lastPaymentMonth: currentMonth,
        pendingAmount: undefined,
        paymentHistory: [...(person.paymentHistory || []), payment],
        receipt: undefined, // Limpiar el recibo después del pago
      },
    });

    toast.success('Pago procesado exitosamente');
  };

  return {
    config,
    people,
    isLoading: configLoading || peopleLoading,
    updateConfig,
    addPerson,
    updatePerson,
    deletePerson,
    uploadFile,
    processPayment
  };
};
