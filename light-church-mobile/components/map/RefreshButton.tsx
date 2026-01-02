/**
 * Refresh Button Component
 * Floating action button to refresh map data
 */

import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RefreshButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export default function RefreshButton({ onPress, loading = false }: RefreshButtonProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  // Start rotation animation when loading
  React.useEffect(() => {
    if (loading) {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
  }, [loading, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons
          name="refresh-outline"
          size={24}
          color="#4285F4"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 220, // 80-100px below MyLocationButton (better spacing)
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
});
