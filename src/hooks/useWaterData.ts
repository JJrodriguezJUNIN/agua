
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Person, WaterConfig, SupabasePerson, SupabaseWaterConfig } from '../types/water';
import { supabase } from '../integrations/supabase/client';
import { Json } from '../integrations/supabase/types';
import { getCurrentMonth } from '../utils/dateUtils';
import { 
  uploadReceipt, 
  createPaymentRecord, 
  preparePaymentUpdate,
  calculatePaymentAmount 
} from '../utils/paymentUtils';

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
  currentMonth: config.current_month,
  isMonthActive: config.is_month_active,
  isAmountUpdated: config.is_amount_updated,
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
        current_month: updates.currentMonth,
        is_month_active: updates.isMonthActive,
        is_amount_updated: updates.isAmountUpdated,
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

  const processPayment = async (personId: string, file: File | null) => {
    const person = people?.find(p => p.id === personId);
    if (!person || !config || !file) return;

    try {
      const receiptUrl = await uploadReceipt(file);
      if (!receiptUrl) {
        toast.error('Error al subir el comprobante');
        return;
      }

      const currentMonth = config.currentMonth || getCurrentMonth();
      const payment = createPaymentRecord({ person, config, currentMonth }, undefined, undefined, receiptUrl);
      const updates = preparePaymentUpdate(person, payment, currentMonth);
      
      await updatePerson({ id: personId, updates });
      toast.success('Pago procesado exitosamente');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Error al procesar el pago');
    }
  };

  const processCashPayment = async (personId: string, amount: number, selectedMonth?: string) => {
    const person = people?.find(p => p.id === personId);
    if (!person || !config) return;

    try {
      const currentMonth = config.currentMonth || getCurrentMonth();
      const payment = createPaymentRecord({ person, config, currentMonth }, amount, selectedMonth);
      const updates = preparePaymentUpdate(person, payment, currentMonth);

      await updatePerson({ id: personId, updates });
      toast.success('Pago en efectivo registrado exitosamente');
    } catch (error) {
      console.error('Cash payment error:', error);
      toast.error('Error al registrar el pago en efectivo');
    }
  };

  const startNewMonth = async () => {
    if (!config || !people) return;
    
    const nextMonth = getCurrentMonth();
    
    await updateConfig({
      ...config,
      currentMonth: nextMonth,
      isMonthActive: true,
    });

    for (const person of people) {
      const pendingAmount = person.hasPaid ? 0 : (person.pendingAmount || 0) + calculatePaymentAmount(config, people.length);
      
      await updatePerson({
        id: person.id,
        updates: {
          hasPaid: false,
          pendingAmount,
        },
      });
    }

    queryClient.invalidateQueries({ queryKey: ['people'] });
    toast.success('Nuevo mes iniciado exitosamente');
  };

  const deletePayment = async (personId: string, paymentMonth: string) => {
    const person = people?.find(p => p.id === personId);
    if (!person) return;

    try {
      const updatedPaymentHistory = person.paymentHistory.filter(
        payment => payment.month !== paymentMonth
      );

      const currentMonth = getCurrentMonth();
      const isCurrentMonthPayment = paymentMonth === currentMonth;

      const pendingAmount = isCurrentMonthPayment && config 
        ? calculatePaymentAmount(config, people?.length || 1)
        : person.pendingAmount;

      await updatePerson({
        id: personId,
        updates: {
          paymentHistory: updatedPaymentHistory,
          hasPaid: isCurrentMonthPayment ? false : person.hasPaid,
          lastPaymentMonth: isCurrentMonthPayment ? undefined : person.lastPaymentMonth,
          pendingAmount,
        },
      });

      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Pago eliminado exitosamente');
    } catch (error) {
      console.error('Delete payment error:', error);
      toast.error('Error al eliminar el pago');
    }
  };

  const updateReceipt = async (personId: string, paymentMonth: string, newReceipt: File) => {
    const person = people?.find(p => p.id === personId);
    if (!person) return;

    try {
      const receiptUrl = await uploadReceipt(newReceipt);
      if (!receiptUrl) {
        toast.error('Error al subir el nuevo comprobante');
        return;
      }

      const updatedPaymentHistory = person.paymentHistory.map(payment => {
        if (payment.month === paymentMonth) {
          return {
            ...payment,
            receipt: receiptUrl,
          };
        }
        return payment;
      });

      await updatePerson({
        id: personId,
        updates: {
          paymentHistory: updatedPaymentHistory,
          receipt: receiptUrl,
        },
      });

      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Comprobante actualizado exitosamente');
    } catch (error) {
      console.error('Update receipt error:', error);
      toast.error('Error al actualizar el comprobante');
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
    processPayment,
    processCashPayment,
    updateReceipt,
    deletePayment,
    startNewMonth
  };
};
