import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Trash2, Archive, AlertCircle, Info } from 'lucide-react-native';
import { hapticService } from '@/services/hapticService';

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'check' | 'trash' | 'archive' | 'alert' | 'info';
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const [translateY] = useState(() => new Animated.Value(100));
  const [opacity] = useState(() => new Animated.Value(0));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    ({
      message,
      actionLabel = 'Undo',
      onAction,
      icon = 'check',
      duration = 4000,
    }: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({ message, actionLabel, onAction, icon, duration });

      translateY.setValue(100);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, opacity, translateY]
  );

  const handleAction = () => {
    hapticService.medium();
    if (toast?.onAction) {
      toast.onAction();
    }
    hideToast();
  };

  const renderIcon = () => {
    if (!toast) return null;
    switch (toast.icon) {
      case 'trash':
        return <Trash2 size={16} color="#F87171" strokeWidth={2.2} />;
      case 'archive':
        return <Archive size={16} color="#FBBF24" strokeWidth={2.2} />;
      case 'alert':
        return <AlertCircle size={16} color="#EF4444" strokeWidth={2.2} />;
      case 'info':
        return <Info size={16} color="#60A5FA" strokeWidth={2.2} />;
      case 'check':
      default:
        return <CheckCircle2 size={16} color="#34D399" strokeWidth={2.2} />;
    }
  };

  const bottomOffset = Platform.OS === 'ios' ? insets.bottom + 65 : 75;

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: bottomOffset,
            left: 16,
            right: 16,
            zIndex: 9999,
            transform: [{ translateY }],
            opacity,
          }}
          pointerEvents="box-none"
        >
          <View
            style={{
              backgroundColor: '#0F172A',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                flex: 1,
                paddingRight: 10,
              }}
            >
              {renderIcon()}
              <Text
                numberOfLines={1}
                style={{
                  color: '#F8FAFC',
                  fontSize: 13,
                  fontWeight: '600',
                  flex: 1,
                }}
              >
                {toast.message}
              </Text>
            </View>

            {toast.onAction && (
              <Pressable
                hitSlop={8}
                onPress={handleAction}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 8,
                  backgroundColor: pressed
                    ? 'rgba(99, 102, 241, 0.35)'
                    : 'rgba(99, 102, 241, 0.2)',
                  borderColor: 'rgba(129, 140, 248, 0.4)',
                  borderWidth: 1,
                })}
              >
                <Text
                  style={{
                    color: '#A5B4FC',
                    fontSize: 12,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {toast.actionLabel || 'Undo'}
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
