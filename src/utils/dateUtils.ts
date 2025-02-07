
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const getCurrentMonth = () => {
  return format(new Date(), "MMMM 'de' yyyy", { locale: es }).replace(/^\w/, (c) => c.toUpperCase());
};
