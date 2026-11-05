import { useAuthStore } from '@/store/authStore';

export interface FetchWithAuthOptions extends RequestInit {
  retryOn401?: boolean;
}

/**
 * Universal Authenticated HTTP Client for Definitely Mobile App.
 * Automatically injects the active Bearer access token and performs
 * automatic Refresh Token Rotation (RTR) on 401 unauthorized responses.
 */
export async function fetchWithAuth(
  input: string | URL,
  init?: FetchWithAuthOptions
): Promise<Response> {
  const retryOn401 = init?.retryOn401 !== false;
  const store = useAuthStore.getState();
  const token = store.tokens?.accessToken;

  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  // Handle access token expiration with automated silent refresh
  if (response.status === 401 && retryOn401) {
    const refreshed = await store.refreshAuthSession();
    if (refreshed) {
      const newToken = useAuthStore.getState().tokens?.accessToken;
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(input, {
          ...init,
          headers,
        });
      }
    }
  }

  return response;
}
