import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { ThemedText, ThemedView, GlassCard, Button } from '@definitely/mobile-ui';
import { useAuthStore } from '@/store/authStore';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLocked = useAuthStore((s) => s.isLocked);
  const openSsoLogin = useAuthStore((s) => s.openSsoLogin);
  const openSsoRegister = useAuthStore((s) => s.openSsoRegister);
  const unlockWithBiometrics = useAuthStore((s) => s.unlockWithBiometrics);
  const logout = useAuthStore((s) => s.logout);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="caption">DEFINITELY MOBILE ECOSYSTEM</ThemedText>
          <ThemedText type="title">{'{{APP_NAME}}'}</ThemedText>
        </View>

        <GlassCard style={styles.card}>
          {isAuthenticated ? (
            isLocked ? (
              <View style={styles.centerBlock}>
                <ThemedText type="subtitle" style={styles.textCenter}>
                  App Locked
                </ThemedText>
                <ThemedText type="caption" style={styles.textCenter}>
                  Biometric protection enabled for {user?.email}
                </ThemedText>
                <Button
                  title="Unlock with Biometrics"
                  onPress={() => unlockWithBiometrics()}
                  style={styles.mt}
                />
              </View>
            ) : (
              <View>
                <ThemedText type="caption">AUTHENTICATED USER</ThemedText>
                <ThemedText type="subtitle">{user?.name || user?.email}</ThemedText>
                <ThemedText type="caption" style={styles.mb}>
                  {user?.email} • {user?.role}
                </ThemedText>
                <Button
                  title="Sign Out"
                  variant="secondary"
                  onPress={() => logout()}
                  style={styles.mt}
                />
              </View>
            )
          ) : (
            <View style={styles.centerBlock}>
              <ThemedText type="subtitle" style={styles.textCenter}>
                Welcome to {'{{APP_NAME}}'}
              </ThemedText>
              <ThemedText type="caption" style={styles.textCenter}>
                Sign in with your unified Definitely account to access the platform.
              </ThemedText>
              <Button
                title="Sign in with Definitely SSO"
                onPress={() => openSsoLogin()}
                style={styles.mt}
              />
              <Button
                title="Create an Account"
                variant="secondary"
                onPress={() => openSsoRegister()}
                style={styles.mtSmall}
              />
            </View>
          )}
        </GlassCard>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  card: {
    width: '100%',
  },
  centerBlock: {
    alignItems: 'center',
  },
  textCenter: {
    textAlign: 'center',
    marginBottom: 8,
  },
  mb: {
    marginBottom: 16,
  },
  mt: {
    marginTop: 20,
    width: '100%',
  },
  mtSmall: {
    marginTop: 10,
    width: '100%',
  },
});
