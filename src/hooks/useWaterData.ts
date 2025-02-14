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
  paymentHistoryAdmin: (person.payment_history_admin || []) as any[],
  lastPaymentMonth: person.last_payment_month,
  pendingAmount: person.pending_amount,
  creditAmount: person.credit_amount,
  phoneNumber: person.phone_number,
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
        credit_amount: person.creditAmount,
        payment_history_admin: person.paymentHistoryAdmin as Json[],
        phone_number: person.phoneNumber,
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
        payment_history_admin: updates.paymentHistoryAdmin as Json[],
        receipt: updates.receipt,
        last_payment_month: updates.lastPaymentMonth,
        pending_amount: updates.pendingAmount,
        credit_amount: updates.creditAmount,
        phone_number: updates.phoneNumber,
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

  const processPayment = async (personId: string, file: File | null, customAmount?: number) => {
    const person = people?.find(p => p.id === personId);
    if (!person || !config || !file) return;

    try {
      const receiptUrl = await uploadReceipt(file);
      if (!receiptUrl) {
        toast.error('Error al subir el comprobante');
        return;
      }

      const currentMonth = config.currentMonth || getCurrentMonth();
      const regularAmount = calculatePaymentAmount(config, people.length);
      const payment = {
        ...createPaymentRecord({ person, config, currentMonth }, regularAmount, undefined, receiptUrl),
        ...(customAmount !== undefined && { adminEditedAmount: customAmount }),
      };

      // El monto a favor se calcula basado en el pago regular, no en el monto editado
      const requiredAmount = person.pendingAmount || regularAmount;
      const paymentAmountForCredit = customAmount !== undefined ? regularAmount : payment.amount;
      const newCreditAmount = paymentAmountForCredit > requiredAmount ? paymentAmountForCredit - requiredAmount : 0;
      const newPendingAmount = Math.max(0, requiredAmount - paymentAmountForCredit);

      const updates = {
        ...preparePaymentUpdate(person, payment, currentMonth),
        creditAmount: (person.creditAmount || 0) + newCreditAmount,
        pendingAmount: newPendingAmount,
      };

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
      const regularAmount = calculatePaymentAmount(config, people.length);
      
      // Crear el registro de pago con el monto editado
      const payment = createPaymentRecord({ person, config, currentMonth }, regularAmount, selectedMonth);
      payment.adminEditedAmount = amount;

      // El monto a favor se calcula como la diferencia entre el pago realizado y el monto requerido
      const requiredAmount = person.pendingAmount || regularAmount;
      const newCreditAmount = amount > requiredAmount ? amount - requiredAmount : 0;
      const newPendingAmount = Math.max(0, requiredAmount - amount);

      // Actualizar el historial de pagos y los montos
      const updatedPaymentHistory = [...(person.paymentHistory || []), payment];
      
      const updates = {
        paymentHistory: updatedPaymentHistory,
        hasPaid: true,
        lastPaymentMonth: currentMonth,
        creditAmount: (person.creditAmount || 0) + newCreditAmount,
        pendingAmount: newPendingAmount,
      };

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
      // Calcular nuevo monto pendiente considerando el monto a favor
      const monthlyAmount = calculatePaymentAmount(config, people.length);
      const creditAmount = person.creditAmount || 0;
      const newPendingAmount = Math.max(0, monthlyAmount - creditAmount);
      const remainingCredit = Math.max(0, creditAmount - monthlyAmount);
      
      await updatePerson({
        id: person.id,
        updates: {
          hasPaid: newPendingAmount === 0,
          pendingAmount: person.hasPaid ? newPendingAmount : (person.pendingAmount || 0) + newPendingAmount,
          creditAmount: remainingCredit,
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

  const editPaymentAmount = async (personId: string, paymentMonth: string, newAmount: number) => {
    const person = people?.find(p => p.id === personId);
    if (!person || !config) return;

    try {
      const updatedPaymentHistory = person.paymentHistory.map(payment => {
        if (payment.month === paymentMonth) {
          return {
            ...payment,
            adminEditedAmount: newAmount,
          };
        }
        return payment;
      });

      // Recalcular el monto a favor y pendiente
      const regularAmount = calculatePaymentAmount(config, people.length);
      const requiredAmount = person.pendingAmount || regularAmount;
      const newCreditAmount = newAmount > requiredAmount ? newAmount - requiredAmount : 0;
      const newPendingAmount = Math.max(0, requiredAmount - newAmount);

      await updatePerson({
        id: personId,
        updates: {
          paymentHistory: updatedPaymentHistory,
          creditAmount: newCreditAmount,
          pendingAmount: newPendingAmount,
        },
      });

      toast.success('Monto actualizado exitosamente');
    } catch (error) {
      console.error('Edit payment amount error:', error);
      toast.error('Error al actualizar el monto');
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
    startNewMonth,
    editPaymentAmount
  };
};
