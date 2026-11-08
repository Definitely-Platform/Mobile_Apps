import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Header } from '@/components/hub/Header';
import { ServiceCard } from '@/components/hub/ServiceCard';
import { BiometricLockModal } from '@/components/hub/BiometricLockModal';
import { ServiceLauncherModal } from '@/components/hub/ServiceLauncherModal';
import { NotificationsModal } from '@/components/hub/NotificationsModal';
import { ProfileModal } from '@/components/hub/ProfileModal';
import { UserTopDrawerModal } from '@/components/hub/UserTopDrawerModal';
import { AccountWebViewModal } from '@/components/hub/AccountWebViewModal';
import { PermissionsOnboardingModal } from '@/components/hub/PermissionsOnboardingModal';
import { PermissionService } from '@/services/permissionService';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { useAuthStore } from '@/store/authStore';
import { useEcosystemStore } from '@/store/ecosystemStore';
import { EcosystemService } from '@/types/ecosystem';
import { useTheme } from '@/hooks/use-theme';
import { useServicesQuery, useRefreshEcosystem } from '@/hooks/useEcosystemQueries';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'ai', label: 'AI' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'communication', label: 'Connect' },
  { id: 'finance', label: 'Finance' },
  { id: 'developer', label: 'Developer' },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  const { data: services = [], isRefetching } = useServicesQuery();
  const refreshEcosystem = useRefreshEcosystem();
  const selectedCategory = useEcosystemStore((s) => s.selectedCategory);
  const setSelectedCategory = useEcosystemStore((s) => s.setSelectedCategory);
  const toggleFavorite = useEcosystemStore((s) => s.toggleFavorite);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeService, setActiveService] = useState<EcosystemService | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [accountWebViewOpen, setAccountWebViewOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (isAuthenticated) {
      PermissionService.hasCompletedOnboarding().then((done) => {
        if (!done) {
          setPermissionsModalOpen(true);
        }
      });
    }
  }, [isAuthenticated]);

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchesCategory =
        selectedCategory === 'all' || svc.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const pinnedServices = useMemo(() => {
    return services.filter((s) => s.isFavorite);
  }, [services]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Biometric Security Lock */}
      <BiometricLockModal />

      {/* Top Header */}
      <Header
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onToggleUserMenu={() => setUserDrawerOpen((prev) => !prev)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refreshEcosystem}
            tintColor={colors.primary}
          />
        }>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}>
            <Ionicons name="search-outline" size={17} color={colors.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search services..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Launch (Pinned Favorites) */}
        {pinnedServices.length > 0 && searchQuery.length === 0 && (
          <View style={styles.pinnedSection}>
            <View style={styles.pinnedHeader}>
              <ThemedText style={styles.sectionTitle}>Quick Launch</ThemedText>
              <View style={[styles.countBadge, { backgroundColor: colors.backgroundElement }]}>
                <ThemedText style={[styles.countBadgeText, { color: colors.textSecondary }]}>
                  {pinnedServices.length}
                </ThemedText>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedList}>
              {pinnedServices.map((svc) => {
                const shortName = svc.name.replace(/^Definitely\s+/, '');
                return (
                  <TouchableOpacity
                    key={svc.id}
                    activeOpacity={0.7}
                    style={styles.pinnedItem}
                    onPress={() => setActiveService(svc)}>
                    <View
                      style={[
                        styles.pinnedIconWrap,
                        {
                          backgroundColor: `${svc.iconColor}15`,
                          borderColor: `${svc.iconColor}30`,
                        },
                      ]}>
                      <Ionicons name={svc.iconName as any} size={22} color={svc.iconColor} />
                    </View>
                    <ThemedText style={styles.pinnedItemLabel} numberOfLines={1}>
                      {shortName}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Categories Filter Tabs */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.75}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}>
                  <ThemedText
                    style={[
                      styles.categoryLabel,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {cat.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Services Catalog */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeaderRow}>
            <View style={styles.catalogTitleRow}>
              <ThemedText style={styles.sectionTitle}>Services</ThemedText>
              <View style={[styles.countBadge, { backgroundColor: colors.backgroundElement }]}>
                <ThemedText style={[styles.countBadgeText, { color: colors.textSecondary }]}>
                  {filteredServices.length}
                </ThemedText>
              </View>
            </View>

            {(searchQuery.length > 0 || selectedCategory !== 'all') && (
              <TouchableOpacity onPress={handleResetFilters} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <ThemedText style={[styles.resetText, { color: colors.primary }]}>
                  Reset
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {filteredServices.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="search-outline" size={26} color={colors.textSecondary} />
              </View>
              <ThemedText style={styles.emptyTitle}>No services found</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                No results matching "{searchQuery}"
              </ThemedText>
              <TouchableOpacity
                style={[styles.emptyResetBtn, { backgroundColor: colors.primary }]}
                onPress={handleResetFilters}>
                <ThemedText style={styles.emptyResetText}>Clear Search</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onLaunch={(svc) => setActiveService(svc)}
                onToggleFavorite={toggleFavorite}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <ServiceLauncherModal
        service={activeService}
        onClose={() => setActiveService(null)}
      />

      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <ProfileModal
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      {/* Top-Down Sliding User Drawer (Half Screen) */}
      <UserTopDrawerModal
        visible={userDrawerOpen}
        onClose={() => setUserDrawerOpen(false)}
        onOpenManageAccount={() => setAccountWebViewOpen(true)}
      />

      {/* In-App WebView for Definitely ID */}
      <AccountWebViewModal
        visible={accountWebViewOpen}
        onClose={() => setAccountWebViewOpen(false)}
      />

      {/* Post-Login Ecosystem Device Permissions Onboarding */}
      <PermissionsOnboardingModal
        visible={permissionsModalOpen}
        onComplete={() => setPermissionsModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  pinnedSection: {
    paddingTop: 14,
    paddingBottom: 4,
  },
  pinnedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pinnedList: {
    paddingHorizontal: 18,
    gap: 14,
  },
  pinnedItem: {
    alignItems: 'center',
    width: 68,
  },
  pinnedIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pinnedItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  categorySection: {
    paddingVertical: 12,
  },
  categoryList: {
    paddingHorizontal: 18,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 12,
  },
  catalogSection: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  catalogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  catalogTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyResetText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
