import { create } from 'zustand';
import { EcosystemService, EcosystemNotification } from '@/types/ecosystem';

interface EcosystemState {
  services: EcosystemService[];
  notifications: EcosystemNotification[];
  selectedCategory: string;
  searchQuery: string;
  activeService: EcosystemService | null;

  // Actions
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;
  toggleFavorite: (serviceId: string) => void;
  setActiveService: (service: EcosystemService | null) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

const DEFAULT_SERVICES: EcosystemService[] = [
  {
    id: 'one-workspace',
    name: 'Definitely Workspace',
    slug: 'workspace',
    tagline: 'Docs, boards & project management',
    description: 'Centralized collaboration workspace for teams. Manage sprints, kanban boards, and living documentation seamlessly.',
    category: 'productivity',
    status: 'active',
    iconName: 'folder-outline',
    iconColor: '#3B82F6',
    accentColor: '#1D4ED8',
    isFavorite: true,
    requiredTier: 'free',
    webUrl: 'https://workspace.definitelyone.com',
    metrics: { label: 'Active Projects', value: '14' },
  },
  {
    id: 'one-ai',
    name: 'Definitely AI Agent',
    slug: 'ai',
    tagline: 'Autonomous workflows & assistants',
    description: 'Next-gen intelligence tailored to your business data. Automate research, generate reports, and trigger smart actions.',
    category: 'ai',
    status: 'active',
    iconName: 'sparkles-outline',
    iconColor: '#8B5CF6',
    accentColor: '#6D28D9',
    badge: 'Popular',
    isFavorite: true,
    requiredTier: 'pro',
    webUrl: 'https://ai.definitelyone.com',
    metrics: { label: 'Automations Run', value: '1,280' },
  },
  {
    id: 'one-analytics',
    name: 'Definitely Analytics',
    slug: 'analytics',
    tagline: 'Real-time telemetry & user insights',
    description: 'Unified business intelligence dashboards tracking user acquisition, revenue funnels, and real-time app events.',
    category: 'analytics',
    status: 'active',
    iconName: 'stats-chart-outline',
    iconColor: '#10B981',
    accentColor: '#059669',
    badge: 'Live',
    isFavorite: true,
    requiredTier: 'pro',
    webUrl: 'https://analytics.definitelyone.com',
    metrics: { label: 'Active Users', value: '48.2k' },
  },
  {
    id: 'one-chat',
    name: 'Definitely Connect',
    slug: 'connect',
    tagline: 'Encrypted channels, voice & meetings',
    description: 'Team messaging and video conferencing integrated directly into your Definitely One workspace directory.',
    category: 'communication',
    status: 'active',
    iconName: 'chatbubbles-outline',
    iconColor: '#EC4899',
    accentColor: '#BE185D',
    isFavorite: false,
    requiredTier: 'free',
    webUrl: 'https://connect.definitelyone.com',
    metrics: { label: 'Unread Chats', value: '3' },
  },
  {
    id: 'one-pay',
    name: 'Definitely Pay',
    slug: 'pay',
    tagline: 'Unified subscriptions & invoicing',
    description: 'Global payment gateway, invoice generation, team expense controls, and multi-currency billing.',
    category: 'finance',
    status: 'active',
    iconName: 'card-outline',
    iconColor: '#F59E0B',
    accentColor: '#D97706',
    isFavorite: false,
    requiredTier: 'enterprise',
    webUrl: 'https://pay.definitelyone.com',
    metrics: { label: 'MRR', value: '$34,900' },
  },
  {
    id: 'one-cloud',
    name: 'Definitely Cloud & API',
    slug: 'cloud',
    tagline: 'Developer SDKs, webhooks & API keys',
    description: 'Developer portal for building on top of Definitely One. Access GraphQL endpoints, webhook logs, and edge functions.',
    category: 'developer',
    status: 'beta',
    iconName: 'code-slash-outline',
    iconColor: '#06B6D4',
    accentColor: '#0891B2',
    badge: 'Beta',
    isFavorite: false,
    requiredTier: 'pro',
    webUrl: 'https://dev.definitelyone.com',
    metrics: { label: 'API Calls / 24h', value: '1.4M' },
  },
];

const DEFAULT_NOTIFICATIONS: EcosystemNotification[] = [
  {
    id: 'notif_01',
    serviceId: 'one-analytics',
    serviceName: 'Definitely Analytics',
    title: 'Traffic Surge Alert',
    message: 'Global traffic increased by +34% over the last 2 hours from Europe region.',
    timestamp: '10m ago',
    read: false,
    priority: 'high',
  },
  {
    id: 'notif_02',
    serviceId: 'one-ai',
    serviceName: 'Definitely AI Agent',
    title: 'Report Generation Finished',
    message: 'Weekly executive performance digest has been generated and ready for review.',
    timestamp: '1h ago',
    read: false,
    priority: 'normal',
  },
  {
    id: 'notif_03',
    serviceId: 'one-workspace',
    serviceName: 'Definitely Workspace',
    title: 'New Project Invitation',
    message: 'Sarah invited you to collaborate on "Q4 Mobile Rollout Roadmap".',
    timestamp: '3h ago',
    read: true,
    priority: 'normal',
  },
];

export const useEcosystemStore = create<EcosystemState>((set) => ({
  services: DEFAULT_SERVICES,
  notifications: DEFAULT_NOTIFICATIONS,
  selectedCategory: 'all',
  searchQuery: '',
  activeService: null,

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  toggleFavorite: (serviceId) =>
    set((state) => ({
      services: state.services.map((svc) =>
        svc.id === serviceId ? { ...svc, isFavorite: !svc.isFavorite } : svc
      ),
    })),

  setActiveService: (service) => set({ activeService: service }),

  markNotificationAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    })),
}));
