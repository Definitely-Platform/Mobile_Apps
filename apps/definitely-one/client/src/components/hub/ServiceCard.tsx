import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { EcosystemService } from '@/types/ecosystem';
import { useTheme } from '@/hooks/use-theme';

interface ServiceCardProps {
  service: EcosystemService;
  onLaunch: (service: EcosystemService) => void;
  onToggleFavorite?: (serviceId: string) => void;
}

export function ServiceCard({ service, onLaunch, onToggleFavorite }: ServiceCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}>
      <View style={styles.headerRow}>
        <View style={styles.iconTitleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: `${service.iconColor}15` }]}>
            <Ionicons
              name={service.iconName as any}
              size={22}
              color={service.iconColor}
            />
          </View>
          <View style={styles.titleArea}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
              {service.badge && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        service.badge === 'Live'
                          ? `${colors.success}20`
                          : `${colors.primary}20`,
                    },
                  ]}>
                  <ThemedText
                    type="small"
                    style={{
                      color: service.badge === 'Live' ? colors.success : colors.primary,
                      fontSize: 10,
                      fontWeight: '700',
                    }}>
                    {service.badge}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              {service.category.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        {onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => onToggleFavorite(service.id)}
            accessibilityLabel="Toggle Favorite">
            <Ionicons
              name={service.isFavorite ? 'star' : 'star-outline'}
              size={18}
              color={service.isFavorite ? '#F59E0B' : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ThemedText style={[styles.tagline, { color: colors.textSecondary }]} numberOfLines={2}>
        {service.tagline}
      </ThemedText>

      {service.metrics && (
        <View style={[styles.metricsContainer, { backgroundColor: colors.backgroundElement }]}>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {service.metrics.label}
          </ThemedText>
          <ThemedText style={styles.metricsValue}>{service.metrics.value}</ThemedText>
        </View>
      )}

      <View style={styles.footerRow}>
        <View style={styles.tierPill}>
          <ThemedText type="small" style={{ color: colors.textSecondary, fontSize: 11 }}>
            Access: {service.requiredTier?.toUpperCase()}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.launchButton, { backgroundColor: service.iconColor }]}
          onPress={() => onLaunch(service)}>
          <ThemedText style={styles.launchButtonText}>Launch</ThemedText>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  favoriteBtn: {
    padding: 4,
  },
  tagline: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  metricsValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  launchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  launchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
