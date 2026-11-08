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

  const categoryLabel =
    service.category.charAt(0).toUpperCase() + service.category.slice(1);

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={() => onLaunch(service)}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.iconTitleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: `${service.iconColor}14` }]}>
            <Ionicons
              name={service.iconName as any}
              size={22}
              color={service.iconColor}
            />
          </View>
          <View style={styles.titleArea}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.serviceName} numberOfLines={1}>
                {service.name}
              </ThemedText>
              {service.badge && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        service.badge === 'Live'
                          ? `${colors.success}18`
                          : `${colors.primary}18`,
                    },
                  ]}>
                  {service.badge === 'Live' && (
                    <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
                  )}
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
            <ThemedText type="small" style={[styles.categoryLabel, { color: colors.textSecondary }]}>
              {categoryLabel}
            </ThemedText>
          </View>
        </View>

        {onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleFavorite(service.id);
            }}
            accessibilityLabel="Toggle Favorite">
            <Ionicons
              name={service.isFavorite ? 'star' : 'star-outline'}
              size={17}
              color={service.isFavorite ? '#F59E0B' : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Tagline */}
      <ThemedText style={[styles.tagline, { color: colors.textSecondary }]} numberOfLines={2}>
        {service.tagline}
      </ThemedText>

      {/* Footer Row: Metrics Chip & Launch Action */}
      <View style={styles.footerRow}>
        {service.metrics ? (
          <View style={[styles.metricChip, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="pulse-outline" size={12} color={colors.textSecondary} />
            <ThemedText style={[styles.metricChipLabel, { color: colors.textSecondary }]}>
              {service.metrics.label}:
            </ThemedText>
            <ThemedText style={[styles.metricChipValue, { color: colors.text }]}>
              {service.metrics.value}
            </ThemedText>
          </View>
        ) : (
          <View />
        )}

        <View style={[styles.launchPill, { backgroundColor: `${service.iconColor}14` }]}>
          <ThemedText style={[styles.launchPillText, { color: service.iconColor }]}>
            Launch
          </ThemedText>
          <Ionicons name="arrow-forward" size={12} color={service.iconColor} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  favoriteBtn: {
    padding: 4,
  },
  tagline: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metricChipLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  metricChipValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  launchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },
  launchPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
