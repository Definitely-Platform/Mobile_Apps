import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { EcosystemService } from '@/types/ecosystem';
import { useTheme } from '@/hooks/use-theme';

interface ServiceLauncherModalProps {
  service: EcosystemService | null;
  onClose: () => void;
}

export function ServiceLauncherModal({ service, onClose }: ServiceLauncherModalProps) {
  const { colors } = useTheme();

  if (!service) return null;

  const handleOpenWeb = () => {
    Linking.openURL(service.webUrl);
  };

  return (
    <Modal visible={!!service} animationType="slide" transparent presentationStyle="pageSheet">
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.iconBox, { backgroundColor: `${service.iconColor}20` }]}>
            <Ionicons name={service.iconName as any} size={42} color={service.iconColor} />
          </View>

          <ThemedText style={styles.serviceTitle}>{service.name}</ThemedText>
          <ThemedText style={[styles.serviceTagline, { color: colors.textSecondary }]}>
            {service.tagline}
          </ThemedText>

          {/* Quick Metrics */}
          {service.metrics && (
            <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View>
                <ThemedText type="small" style={{ color: colors.textSecondary }}>
                  {service.metrics.label}
                </ThemedText>
                <ThemedText style={styles.statValue}>{service.metrics.value}</ThemedText>
              </View>
              <View style={[styles.tierTag, { backgroundColor: `${colors.primary}15` }]}>
                <ThemedText style={[styles.tierText, { color: colors.primary }]}>
                  {service.requiredTier?.toUpperCase()} TIER
                </ThemedText>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <ThemedText style={styles.sectionHeading}>About this Tool</ThemedText>
            <ThemedText style={[styles.bodyText, { color: colors.textSecondary }]}>
              {service.description}
            </ThemedText>
          </View>

          {/* Ecosystem Capabilities */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <ThemedText style={styles.sectionHeading}>Ecosystem Integration</ThemedText>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <ThemedText style={styles.featureText}>Unified Single Sign-On (No extra login)</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <ThemedText style={styles.featureText}>Real-time sync with Desktop & Web apps</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <ThemedText style={styles.featureText}>Cross-service workspace permissions</ThemedText>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={[styles.launchBtn, { backgroundColor: service.iconColor }]}
            onPress={handleOpenWeb}>
            <ThemedText style={styles.launchBtnText}>Launch {service.name}</ThemedText>
            <Ionicons name="open-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: 16,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  serviceTagline: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  tierTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    width: '100%',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  featureText: {
    fontSize: 13,
  },
  launchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    height: 50,
    borderRadius: 14,
    marginTop: 10,
  },
  launchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
