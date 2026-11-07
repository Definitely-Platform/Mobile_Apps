import React from 'react';
import { Text, type TextProps, StyleSheet, useColorScheme } from 'react-native';
import { themeTokens } from './tokens';

export interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'mono';
  color?: string;
}

export function ThemedText({
  style,
  type = 'default',
  color,
  ...rest
}: ThemedTextProps) {
  const isDark = useColorScheme() !== 'light';
  const defaultColor = isDark ? themeTokens.colors.textPrimaryDark : '#0f172a';

  return (
    <Text
      style={[
        { color: color || defaultColor },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'defaultSemiBold' && styles.defaultSemiBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'caption' && styles.caption,
        type === 'mono' && styles.mono,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 15,
    lineHeight: 22,
  },
  defaultSemiBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  link: {
    lineHeight: 24,
    fontSize: 15,
    color: themeTokens.colors.primary,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    color: themeTokens.colors.textMutedDark,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
});
