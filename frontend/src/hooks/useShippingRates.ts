import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getShippingRates,
  saveShippingRate,
  deleteShippingRate,
  importRatesCSV,
} from '@/api/shippingApi';
import type { LocationType, ShippingRate } from '@/types/shipping.types';

export const shippingKeys = {
  all: ['shipping'] as const,
  rates: () => [...shippingKeys.all, 'rates'] as const,
  ratesByLocation: (type?: string, code?: string) =>
    [...shippingKeys.rates(), type, code] as const,
};

export const useShippingRates = (locationType?: LocationType, locationCode?: string) =>
  useQuery({
    queryKey: shippingKeys.ratesByLocation(locationType, locationCode),
    queryFn: () => getShippingRates(locationType, locationCode),
    enabled: !!locationType && !!locationCode,
  });

export const useSaveShippingRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rate: Partial<ShippingRate>) => saveShippingRate(rate),
    onSuccess: () => qc.invalidateQueries({ queryKey: shippingKeys.rates() }),
  });
};

export const useDeleteShippingRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteShippingRate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: shippingKeys.rates() }),
  });
};

export const useImportRatesCSV = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importRatesCSV(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: shippingKeys.rates() }),
  });
};
