/**
 * Card component
 * Container for content with shadow
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import Box from './Box';
import type { BoxProps } from '@shopify/restyle';
import type { Theme } from '@/theme/theme';

interface CardProps extends Omit<BoxProps<Theme>, 'children'> {
  children: React.ReactNode;
  elevation?: number;
}

export default function Card({
  children,
  elevation = 2,
  ...boxProps
}: CardProps) {
  return (
    <Box
      backgroundColor="surface"
      borderRadius="l"
      padding="m"
      style={elevation > 0 ? styles[`elevation${elevation}` as keyof typeof styles] : undefined}
      {...boxProps}
    >
      {children}
    </Box>
  );
}

const styles = StyleSheet.create({
  elevation1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  elevation2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevation3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
});
