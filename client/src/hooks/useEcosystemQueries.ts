import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/api/config';
import { fetchWithAuth } from '@/lib/apiClient';
import { EcosystemService, EcosystemNotification } from '@/types/ecosystem';
import { useEcosystemStore } from '@/store/ecosystemStore';

export const QUERY_KEYS = {
  services: ['ecosystem', 'services'] as const,
  notifications: ['ecosystem', 'notifications'] as const,
  user: ['auth', 'user'] as const,
};

export function useServicesQuery() {
  const localServices = useEcosystemStore((s) => s.services);

  return useQuery<EcosystemService[]>({
    queryKey: QUERY_KEYS.services,
    queryFn: async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/services`);
        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.status}`);
        }
        const data = await response.json();
        return data.services as EcosystemService[];
      } catch (err) {
        // Fallback to local default services if server is unreachable
        console.log('Using local ecosystem services cache');
        return localServices;
      }
    },
    initialData: localServices,
  });
}

export function useNotificationsQuery() {
  const localNotifications = useEcosystemStore((s) => s.notifications);

  return useQuery<EcosystemNotification[]>({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/notifications`);
        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }
        const data = await response.json();
        return data.notifications as EcosystemNotification[];
      } catch (err) {
        console.log('Using local notifications cache');
        return localNotifications;
      }
    },
    initialData: localNotifications,
  });
}

export function useRefreshEcosystem() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications }),
    ]);
  };
}
