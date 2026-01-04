/**
 * Toast Context for global error/success messages
 * Non-intrusive snackbar-style notifications
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Animated, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { Box } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number, action?: Toast['action']) => void;
  showError: (message: string, action?: Toast['action']) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 3000,
    action?: Toast['action']
  ) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type, duration, action };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const showError = useCallback((message: string, action?: Toast['action']) => {
    showToast(message, 'error', 4000, action);
  }, [showToast]);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success', 2500);
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning', 3500);
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info', 3000);
  }, [showToast]);

  const handleDismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showWarning, showInfo }}>
      {children}

      {/* Toast Container */}
      <Box
        style={[
          styles.container,
          {
            bottom: insets.bottom + 16,
          },
        ]}
        pointerEvents="box-none"
      >
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            index={index}
            onDismiss={handleDismiss}
          />
        ))}
      </Box>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, index, onDismiss }: { toast: Toast; index: number; onDismiss: (id: string) => void }) {
  const translateY = React.useRef(new Animated.Value(100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Slide out animation before dismiss
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, (toast.duration || 3000) - 200);

    return () => clearTimeout(timeout);
  }, [toast.duration, translateY, opacity]);

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return { backgroundColor: '#34A853', icon: 'checkmark-circle' as const };
      case 'error':
        return { backgroundColor: '#EA4335', icon: 'alert-circle' as const };
      case 'warning':
        return { backgroundColor: '#FBBC04', icon: 'warning' as const };
      case 'info':
      default:
        return { backgroundColor: '#4285F4', icon: 'information-circle' as const };
    }
  };

  const { backgroundColor, icon } = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor,
          transform: [{ translateY }],
          opacity,
          marginBottom: index > 0 ? 8 : 0,
        },
      ]}
    >
      <Box flexDirection="row" alignItems="center" flex={1} style={{ gap: 8 }}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
      </Box>

      {toast.action && (
        <Box
          onTouchEnd={() => {
            toast.action?.onPress();
            onDismiss(toast.id);
          }}
          style={{ paddingLeft: 16, paddingVertical: 4 }}
        >
          <Text style={styles.actionText}>{toast.action.label}</Text>
        </Box>
      )}

      {/* Dismiss button */}
      <Box
        onTouchEnd={() => onDismiss(toast.id)}
        style={{ paddingLeft: 8, paddingVertical: 4 }}
      >
        <Ionicons name="close" size={20} color="#FFFFFF" />
      </Box>
    </Animated.View>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  message: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
