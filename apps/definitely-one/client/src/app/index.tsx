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
import { LoginScreen } from '@/components/auth/LoginScreen';
import { useAuthStore } from '@/store/authStore';
import { useEcosystemStore } from '@/store/ecosystemStore';
import { EcosystemService } from '@/types/ecosystem';
import { useTheme } from '@/hooks/use-theme';
import { useServicesQuery, useRefreshEcosystem } from '@/hooks/useEcosystemQueries';

const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'ai', label: 'AI & Automations' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'communication', label: 'Connect' },
  { id: 'finance', label: 'Finance' },
  { id: 'developer', label: 'Dev & API' },
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

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Biometric Security Lock */}
      <BiometricLockModal />

      {/* Top Header */}
      <Header
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
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
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search tools, products, services..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pinned Quick Launch Bar */}
        {pinnedServices.length > 0 && searchQuery.length === 0 && (
          <View style={styles.pinnedSection}>
            <ThemedText style={styles.sectionTitle}>Pinned Tools</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedList}>
              {pinnedServices.map((svc) => (
                <TouchableOpacity
                  key={svc.id}
                  style={[
                    styles.pinnedTile,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  onPress={() => setActiveService(svc)}>
                  <View style={[styles.pinnedIconWrap, { backgroundColor: `${svc.iconColor}20` }]}>
                    <Ionicons name={svc.iconName as any} size={20} color={svc.iconColor} />
                  </View>
                  <ThemedText style={styles.pinnedTileName} numberOfLines={1}>
                    {svc.name.replace('Definitely ', '')}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories Bar */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
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
                        color: isSelected ? '#FFFFFF' : colors.text,
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

        {/* Service Cards Catalog */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeaderRow}>
            <ThemedText style={styles.sectionTitle}>
              Ecosystem Services ({filteredServices.length})
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Unified Access
            </ThemedText>
          </View>

          {filteredServices.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="search-outline" size={32} color={colors.textSecondary} />
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                No services found matching "{searchQuery}"
              </ThemedText>
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
    paddingTop: 14,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  pinnedSection: {
    paddingTop: 10,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  pinnedList: {
    paddingHorizontal: 18,
    gap: 10,
  },
  pinnedTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  pinnedIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedTileName: {
    fontSize: 13,
    fontWeight: '600',
  },
  categorySection: {
    paddingVertical: 10,
  },
  categoryList: {
    paddingHorizontal: 18,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 12,
  },
  catalogSection: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  catalogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});
