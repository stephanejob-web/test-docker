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
  showBadge?: boolean;
}

export default function RefreshButton({ onPress, loading = false, showBadge = false }: RefreshButtonProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Start rotation animation when loading
  React.useEffect(() => {
    if (loading) {
      spinValue.setValue(0);
      animationRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animationRef.current.start();
    } else {
      spinValue.stopAnimation();
      animationRef.current?.stop();
    }

    // Cleanup: stop animation on unmount to prevent memory leak
    return () => {
      animationRef.current?.stop();
      spinValue.stopAnimation();
    };
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

      {/* Badge rouge - Google Maps style */}
      {showBadge && !loading && (
        <Animated.View style={styles.badge} />
      )}
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
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EA4335',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
