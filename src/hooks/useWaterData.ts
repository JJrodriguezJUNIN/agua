import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Person, WaterConfig } from '../types/water';
import { supabase } from '../integrations/supabase/client';

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
      return data;
    }
  });

  const { data: people, isLoading: peopleLoading } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*');

      if (error) throw error;
      return data;
    }
  });

  const updateConfig = async (updates: Partial<WaterConfig>) => {
    const { error } = await supabase
      .from('water_config')
      .update(updates)
      .eq('id', 1);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['waterConfig'] });
    toast.success('Configuración actualizada');
  };

  const addPerson = async (person: Omit<Person, 'id'>) => {
    const { error } = await supabase
      .from('people')
      .insert([person]);

    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['people'] });
    toast.success('Usuario agregado exitosamente');
  };

  const updatePerson = async ({ id, updates }: { id: string; updates: Partial<Person> }) => {
    const { error } = await supabase
      .from('people')
      .update(updates)
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