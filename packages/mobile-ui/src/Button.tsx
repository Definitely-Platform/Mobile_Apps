import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';
import { themeTokens } from './tokens';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text
          style={[
            styles.textBase,
            variant === 'primary' && styles.primaryText,
            variant === 'secondary' && styles.secondaryText,
            variant === 'outline' && styles.outlineText,
            variant === 'danger' && styles.dangerText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: themeTokens.colors.primary,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  outline: {
    borderWidth: 1,
    borderColor: themeTokens.colors.borderDark,
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: themeTokens.colors.textSecondaryDark,
  },
  outlineText: {
    color: themeTokens.colors.textPrimaryDark,
  },
  dangerText: {
    color: '#ef4444',
  },
});
