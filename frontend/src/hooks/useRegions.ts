import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRegions, saveRegion, deleteRegion, bulkApplyRegionRate } from '@/api/regionApi';
import type { Region, ShippingRate } from '@/types/shipping.types';

export const regionKeys = {
  all: ['regions'] as const,
  list: () => [...regionKeys.all, 'list'] as const,
};

export const useRegions = () =>
  useQuery({
    queryKey: regionKeys.list(),
    queryFn: getRegions,
    staleTime: 1000 * 60 * 5,
  });

export const useSaveRegion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (region: Partial<Region>) => saveRegion(region),
    onSuccess: () => qc.invalidateQueries({ queryKey: regionKeys.all }),
  });
};

export const useDeleteRegion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRegion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: regionKeys.all }),
  });
};

export const useBulkApplyRegionRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ regionCode, rate }: { regionCode: string; rate: Partial<ShippingRate> }) =>
      bulkApplyRegionRate(regionCode, rate),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipping'] }),
  });
};
