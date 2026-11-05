export interface UserOrganization {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'member' | 'user' | 'company' | 'superadmin' | string;
  status?: 'active' | 'suspended' | 'pending' | 'deactivated';
  organization?: UserOrganization;
  tokenVersion?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface AuthSession {
  user: UserProfile;
  tokens: AuthTokens;
  biometricsEnabled: boolean;
  lastActive: number;
}
