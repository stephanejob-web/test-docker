/**
 * Button component
 * Google Maps style button
 */

import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '@shopify/restyle';
import type { Theme } from '@/theme/theme';
import Text from './Text';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const theme = useTheme<Theme>();

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
      ? theme.colors.card
      : 'transparent';

  const textColor =
    variant === 'primary'
      ? theme.colors.textInverse
      : variant === 'secondary'
      ? theme.colors.text
      : theme.colors.primary;

  const borderColor = variant === 'outline' ? theme.colors.primary : 'transparent';

  const paddingVertical = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
  const paddingHorizontal = size === 'small' ? 16 : size === 'medium' ? 24 : 32;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        fullWidth && styles.fullWidth,
      ]}
    >
      <View
        style={[
          styles.button,
          {
            backgroundColor,
            borderColor,
            borderWidth: variant === 'outline' ? 1 : 0,
            opacity: disabled ? 0.5 : 1,
            paddingVertical,
            paddingHorizontal,
            borderRadius: theme.borderRadii.m,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text
            style={{ color: textColor, textAlign: 'center', fontWeight: '600' }}
          >
            {children}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
