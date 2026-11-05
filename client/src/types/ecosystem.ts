export type ServiceCategory = 
  | 'productivity' 
  | 'analytics' 
  | 'communication' 
  | 'finance' 
  | 'developer' 
  | 'ai';

export type ServiceStatus = 'active' | 'beta' | 'coming_soon' | 'maintenance';

export interface EcosystemService {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: ServiceCategory;
  status: ServiceStatus;
  iconName: string;
  iconColor: string;
  accentColor: string;
  badge?: string;
  isFavorite?: boolean;
  requiredTier?: 'free' | 'pro' | 'enterprise';
  webUrl: string;
  mobileRoute?: string;
  metrics?: {
    label: string;
    value: string;
  };
}

export interface EcosystemNotification {
  id: string;
  serviceId: string;
  serviceName: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high';
  actionUrl?: string;
}
