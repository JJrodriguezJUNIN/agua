
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
  const isCurrentMonthPayment = payment.month === currentMonth;
  const updatedPaymentHistory = [...(person.paymentHistory || []), payment];

  // Check if the user has paid for the current month
  const hasCurrentMonthPayment = updatedPaymentHistory.some(p => p.month === currentMonth);

  // Check if all previous months are paid
  const uniqueMonths = new Set(updatedPaymentHistory.map(p => p.month));
  const hasPaidAllMonths = Array.from(uniqueMonths).every(month => 
    updatedPaymentHistory.some(p => p.month === month)
  );

  return {
    hasPaid: hasCurrentMonthPayment && hasPaidAllMonths,
    lastPaymentMonth: payment.month,
    pendingAmount: isCurrentMonthPayment ? undefined : person.pendingAmount,
    paymentHistory: updatedPaymentHistory,
    ...(payment.receipt && { receipt: payment.receipt }),
  };
};

