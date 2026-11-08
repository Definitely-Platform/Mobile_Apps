import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';
import { PermissionService } from '@/services/permissionService';

interface UpdateAvatarModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  {
    id: 'preset_1',
    label: 'Alex (Default)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop',
  },
  {
    id: 'preset_2',
    label: 'Marcus',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop',
  },
  {
    id: 'preset_3',
    label: 'Elena',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop',
  },
  {
    id: 'preset_4',
    label: 'David',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop',
  },
  {
    id: 'preset_5',
    label: 'Sophia',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop',
  },
  {
    id: 'preset_6',
    label: 'Jordan',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop',
  },
  {
    id: 'preset_7',
    label: 'Nadia',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop',
  },
  {
    id: 'preset_8',
    label: 'Chen',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop',
  },
];

export function UpdateAvatarModal({ visible, onClose }: UpdateAvatarModalProps) {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateAvatar = useAuthStore((s) => s.updateAvatar);

  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectPreset = async (url: string) => {
    setIsSaving(true);
    try {
      await updateAvatar(url);
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setIsSaving(true);

      // 1. Check & request photo library permission
      const permRes = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permRes.granted) {
        setIsSaving(false);
        if (!permRes.canAskAgain) {
          Alert.alert(
            'Gallery Permission Required',
            'Definitely One needs access to your photo library to select a profile picture. Please enable Photos/Storage permission in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'Permission Denied',
            'Photo library permission is needed to choose a profile picture.'
          );
        }
        return;
      }

      // 2. Open device gallery / photo picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await updateAvatar(result.assets[0].uri);
        onClose();
      }
    } catch (err: any) {
      console.warn('[UpdateAvatarModal] Gallery pick error:', err);
      Alert.alert('Gallery Error', err?.message || 'Could not access the gallery. Please check permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsSaving(true);

      // 1. Check & request camera permission
      const permRes = await ImagePicker.requestCameraPermissionsAsync();
      if (!permRes.granted) {
        setIsSaving(false);
        if (!permRes.canAskAgain) {
          Alert.alert(
            'Camera Permission Required',
            'Definitely One needs camera access to take a profile picture. Please enable Camera permission in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'Permission Denied',
            'Camera permission is required to capture a profile picture.'
          );
        }
        return;
      }

      // 2. Open device camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await updateAvatar(result.assets[0].uri);
        onClose();
      }
    } catch (err: any) {
      console.warn('[UpdateAvatarModal] Camera error:', err);
      Alert.alert('Camera Error', err?.message || 'Could not open the camera. Please check camera permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCustomUrl = async () => {
    if (!customUrl.trim()) return;
    setIsSaving(true);
    try {
      await updateAvatar(customUrl.trim());
      setCustomUrl('');
      setShowUrlInput(false);
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to update photo URL.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              await updateAvatar(null);
              onClose();
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <ThemedText style={styles.title}>Update Profile Picture</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Avatar Preview */}
          <View style={styles.previewSection}>
            <View style={[styles.previewRing, { borderColor: `${colors.primary}50` }]}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.previewImage} />
              ) : (
                <View style={[styles.previewFallback, { backgroundColor: colors.card }]}>
                  <ThemedText style={styles.previewInitial}>
                    {(user?.name || user?.email || 'U')[0].toUpperCase()}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.userName}>{user?.name || 'Account'}</ThemedText>
            <ThemedText style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email}
            </ThemedText>
          </View>

          {isSaving && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                Updating profile picture...
              </ThemedText>
            </View>
          )}

          {/* Native Capture & Gallery Options */}
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              DEVICE CAPTURE
            </ThemedText>
          </View>

          <View style={[styles.actionGroup, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[styles.actionRow, { borderBottomColor: colors.cardBorder }]}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
              disabled={isSaving}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.primary}18` }]}>
                <Ionicons name="camera" size={20} color={colors.primary} />
              </View>
              <View style={styles.actionTextWrap}>
                <ThemedText style={styles.actionTitle}>Take Photo</ThemedText>
                <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                  Capture a fresh shot with your camera
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handlePickFromGallery}
              activeOpacity={0.7}
              disabled={isSaving}>
              <View style={[styles.iconBox, { backgroundColor: '#10b98118' }]}>
                <Ionicons name="images" size={20} color="#10b981" />
              </View>
              <View style={styles.actionTextWrap}>
                <ThemedText style={styles.actionTitle}>Choose from Library</ThemedText>
                <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                  Select an existing photo from your gallery
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Curated Executive Presets */}
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              EXECUTIVE PRESETS
            </ThemedText>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsScroll}>
            {PRESET_AVATARS.map((preset) => {
              const isSelected = user?.avatarUrl === preset.url;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.presetCard,
                    {
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                      backgroundColor: colors.card,
                    },
                  ]}
                  onPress={() => handleSelectPreset(preset.url)}
                  disabled={isSaving}
                  activeOpacity={0.75}>
                  <Image source={{ uri: preset.url }} style={styles.presetImage} />
                  {isSelected && (
                    <View style={[styles.presetCheckmark, { backgroundColor: colors.primary }]}>
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    </View>
                  )}
                  <ThemedText style={[styles.presetLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                    {preset.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Web URL / Custom Link Option */}
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              WEB & ADVANCED
            </ThemedText>
          </View>

          <View style={[styles.actionGroup, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[styles.actionRow, showUrlInput && { borderBottomColor: colors.cardBorder, borderBottomWidth: 1 }]}
              onPress={() => setShowUrlInput(!showUrlInput)}
              activeOpacity={0.7}>
              <View style={[styles.iconBox, { backgroundColor: '#8b5cf618' }]}>
                <Ionicons name="link" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.actionTextWrap}>
                <ThemedText style={styles.actionTitle}>Paste Image URL</ThemedText>
                <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                  Link a remote CDN or profile picture URL
                </ThemedText>
              </View>
              <Ionicons
                name={showUrlInput ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showUrlInput && (
              <View style={styles.urlInputBox}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: `${colors.background}`,
                      color: colors.text,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  placeholder="https://example.com/avatar.jpg"
                  placeholderTextColor={colors.textSecondary}
                  value={customUrl}
                  onChangeText={setCustomUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <TouchableOpacity
                  style={[styles.urlApplyBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveCustomUrl}
                  disabled={!customUrl.trim() || isSaving}>
                  <ThemedText style={styles.urlApplyText}>Apply</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {user?.avatarUrl && (
              <TouchableOpacity
                style={[styles.actionRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.cardBorder }]}
                onPress={handleRemovePhoto}
                activeOpacity={0.7}
                disabled={isSaving}>
                <View style={[styles.iconBox, { backgroundColor: `${colors.danger}18` }]}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </View>
                <View style={styles.actionTextWrap}>
                  <ThemedText style={[styles.actionTitle, { color: colors.danger }]}>
                    Remove Picture
                  </ThemedText>
                  <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                    Reset avatar back to initials
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  previewFallback: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInitial: {
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  actionGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
  },
  presetsScroll: {
    gap: 10,
    paddingVertical: 6,
    marginBottom: 16,
  },
  presetCard: {
    width: 76,
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  presetImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 6,
  },
  presetCheckmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  urlInputBox: {
    padding: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  urlApplyBtn: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urlApplyText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
