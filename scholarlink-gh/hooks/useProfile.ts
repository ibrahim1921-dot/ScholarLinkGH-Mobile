import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

export function useProfileCompleteness() {
  return useQuery({
    queryKey: ['profileCompleteness'],
    queryFn: () => profileService.getProfileCompleteness(),
  });
}
