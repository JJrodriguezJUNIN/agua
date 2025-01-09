import { createClient } from '@supabase/supabase-js';
import { Person, Payment, WaterConfig } from '../types/water';

const supabaseUrl = 'https://fsvjoabunvedifukozxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdmpvYWJ1bnZlZGlmdWtvenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMzk4MTIsImV4cCI6MjA1MTkxNTgxMn0.Topvn0Hb5FqB2kFndUgjV1zlpkXneCpfizyQxHSU-gc';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getWaterConfig = async () => {
  const { data, error } = await supabase
    .from('water_config')
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
};

export const updateWaterConfig = async (config: Partial<WaterConfig>) => {
  const { error } = await supabase
    .from('water_config')
    .update(config)
    .eq('id', 1);
  
  if (error) throw error;
};

export const getPeople = async () => {
  const { data, error } = await supabase
    .from('people')
    .select('*');
  
  if (error) throw error;
  return data;
};

export const addPerson = async (person: Omit<Person, 'id'>) => {
  const { data, error } = await supabase
    .from('people')
    .insert([person])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updatePerson = async (id: string, updates: Partial<Person>) => {
  const { error } = await supabase
    .from('people')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deletePerson = async (id: string) => {
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const uploadReceipt = async (file: File) => {
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
};