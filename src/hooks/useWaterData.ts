import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Person, WaterConfig } from '../types/water';
import {
  getWaterConfig,
  updateWaterConfig,
  getPeople,
  addPerson,
  updatePerson,
  deletePerson,
  uploadReceipt
} from '../lib/supabase';

export const useWaterData = () => {
  const queryClient = useQueryClient();

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['waterConfig'],
    queryFn: getWaterConfig
  });

  const { data: people, isLoading: peopleLoading } = useQuery({
    queryKey: ['people'],
    queryFn: getPeople
  });

  const updateConfigMutation = useMutation({
    mutationFn: updateWaterConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterConfig'] });
      toast.success('Configuración actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar la configuración');
      console.error(error);
    }
  });

  const addPersonMutation = useMutation({
    mutationFn: addPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Usuario agregado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al agregar usuario');
      console.error(error);
    }
  });

  const updatePersonMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Person> }) =>
      updatePerson(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar usuario');
      console.error(error);
    }
  });

  const deletePersonMutation = useMutation({
    mutationFn: deletePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar usuario');
      console.error(error);
    }
  });

  const handleFileUpload = async (file: File) => {
    try {
      return await uploadReceipt(file);
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
    updateConfig: updateConfigMutation.mutate,
    addPerson: addPersonMutation.mutate,
    updatePerson: updatePersonMutation.mutate,
    deletePerson: deletePersonMutation.mutate,
    handleFileUpload
  };
};