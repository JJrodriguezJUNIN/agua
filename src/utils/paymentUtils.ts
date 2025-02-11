
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

  // Verificamos si ha pagado específicamente el mes actual
  const hasCurrentMonthPayment = updatedPaymentHistory.some(p => p.month === currentMonth);

  const mockConfig: WaterConfig = {
    id: 1,
    bottlePrice: payment.amount,
    bottleCount: payment.bottleCount || 1
  };

  return {
    hasPaid: hasCurrentMonthPayment,
    lastPaymentMonth: payment.month,
    pendingAmount: hasCurrentMonthPayment ? undefined : (person.pendingAmount || calculatePaymentAmount(mockConfig, 1)),
    paymentHistory: updatedPaymentHistory,
    ...(payment.receipt && { receipt: payment.receipt }),
  };
};

