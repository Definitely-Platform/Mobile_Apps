import React from 'react';
import { View, type ViewProps, useColorScheme } from 'react-native';
import { themeTokens } from './tokens';

export function ThemedView({ style, ...otherProps }: ViewProps) {
  const isDark = useColorScheme() !== 'light';
  const backgroundColor = isDark ? themeTokens.colors.backgroundDark : '#f8fafc';

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function GlassCard({ style, ...otherProps }: ViewProps) {
  const isDark = useColorScheme() !== 'light';
  const bg = isDark ? themeTokens.colors.backgroundCardDark : '#ffffff';
  const border = isDark ? themeTokens.colors.borderDark : 'rgba(0,0,0,0.06)';

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: 20,
          padding: 20,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
