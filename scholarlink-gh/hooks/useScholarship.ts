import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scholarshipService } from '../services/scholarshipService';

export function useScholarshipDetail(scholarshipId: number) {
  return useQuery({
    queryKey: ['scholarship', scholarshipId],
    queryFn: () => scholarshipService.getScholarship(scholarshipId),
  });
}

export function useScholarshipEligibility(scholarshipId: number) {
  return useQuery({
    queryKey: ['eligibility', scholarshipId],
    queryFn: () => scholarshipService.checkEligibility(scholarshipId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSavedScholarships() {
  return useQuery({
    queryKey: ['savedScholarships'],
    queryFn: () => scholarshipService.getSavedScholarships(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useToggleSaveScholarship() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (scholarshipId: number) => scholarshipService.toggleSaveScholarship(scholarshipId),
    onSuccess: (data, variables) => {
      // Invalidate the saved scholarships list so it refetches
      queryClient.invalidateQueries({ queryKey: ['savedScholarships'] });
      // Also invalidate the specific scholarship query in case it's tracking saved state there
      queryClient.invalidateQueries({ queryKey: ['scholarship', variables] });
    },
  });
}
