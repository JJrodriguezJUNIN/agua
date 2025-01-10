import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Person, WaterConfig, SupabasePerson, SupabaseWaterConfig } from '../types/water';
import { supabase } from '../integrations/supabase/client';

const mapSupabasePersonToPerson = (person: SupabasePerson): Person => ({
  id: person.id,
  name: person.name,
  avatar: person.avatar,
  hasPaid: person.has_paid,
  receipt: person.receipt,
  paymentHistory: person.payment_history as any[] || [],
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
      .insert([{
        name: person.name,
        avatar: person.avatar,
        has_paid: person.hasPaid,
        payment_history: person.paymentHistory,
        receipt: person.receipt,
        last_payment_month: person.lastPaymentMonth,
        pending_amount: person.pendingAmount,
      }]);

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
        payment_history: updates.paymentHistory,
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
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      toast.error('Error al subir el comprobante');
      console.error(error);
      return null;
    }
  };

  return {
    config,
    people,
    isLoading: configLoading || peopleLoading,
    updateConfig,
    addPerson,
    updatePerson,
    deletePerson,
    uploadFile
  };
};