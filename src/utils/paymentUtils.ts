
import { Person, WaterConfig } from '../types/water';
import { PaymentRecord, PaymentUpdateParams } from '../types/payment';
import { getCurrentMonth } from './dateUtils';
import { supabase } from '../integrations/supabase/client';
import { Json } from '../integrations/supabase/types';

export const calculatePaymentAmount = (config: WaterConfig, peopleCount: number) => {
  return Math.round((config.bottlePrice * config.bottleCount) / peopleCount);
};

export const uploadReceipt = async (file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};

export const createPaymentRecord = (
  { person, config, currentMonth }: PaymentUpdateParams,
  amount?: number,
  selectedMonth?: string,
  receiptUrl?: string
): PaymentRecord => {
  return {
    date: new Date().toISOString(),
    amount: amount ?? calculatePaymentAmount(config, 1),
    month: selectedMonth ?? currentMonth,
    bottleCount: config.bottleCount,
    ...(receiptUrl && { receipt: receiptUrl }),
  };
};

export const preparePaymentUpdate = (
  person: Person, 
  payment: PaymentRecord,
  currentMonth: string
) => {
  const updatedPaymentHistory = [...(person.paymentHistory || []), payment];

  // Verificar si el usuario ha pagado el mes actual
  const hasCurrentMonthPayment = updatedPaymentHistory.some(
    p => p.month === currentMonth
  );

  // Calcular el monto pendiente
  let pendingAmount = person.pendingAmount || 0;
  if (payment.month === currentMonth) {
    // Si es un pago del mes actual, restamos el monto pagado del pendiente
    pendingAmount = Math.max(0, pendingAmount - payment.amount);
  }

  return {
    hasPaid: hasCurrentMonthPayment && pendingAmount === 0,
    lastPaymentMonth: payment.month,
    pendingAmount,
    paymentHistory: updatedPaymentHistory,
    ...(payment.receipt && { receipt: payment.receipt }),
  };
};
