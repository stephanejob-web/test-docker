/**
 * MapTypeModal Component
 * Google Maps style bottom modal to select map type
 */

import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';

type MapType = 'standard' | 'satellite';

interface MapTypeModalProps {
  visible: boolean;
  currentMapType: MapType;
  onClose: () => void;
  onSelectMapType: (type: MapType) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAP_TYPES = [
  {
    type: 'standard' as MapType,
    label: 'Plan',
    icon: 'map-outline',
    description: 'Vue cartographique standard',
  },
  {
    type: 'satellite' as MapType,
    label: 'Satellite',
    icon: 'planet-outline',
    description: 'Imagerie satellite',
  },
] as const;

export default function MapTypeModal({
  visible,
  currentMapType,
  onClose,
  onSelectMapType,
}: MapTypeModalProps) {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide down animation
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleSelect = (type: MapType) => {
    onSelectMapType(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text variant="subtitle" style={styles.title}>
                  Type de carte
                </Text>
              </View>

              {/* Map Type Options */}
              <View style={styles.optionsContainer}>
                {MAP_TYPES.map((mapType) => {
                  const isSelected = currentMapType === mapType.type;
                  return (
                    <TouchableOpacity
                      key={mapType.type}
                      style={styles.option}
                      onPress={() => handleSelect(mapType.type)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionLeft}>
                        <View
                          style={[
                            styles.iconContainer,
                            isSelected && styles.iconContainerSelected,
                          ]}
                        >
                          <Ionicons
                            name={mapType.icon}
                            size={24}
                            color={isSelected ? '#4285F4' : '#5F6368'}
                          />
                        </View>
                        <View style={styles.optionText}>
                          <Text
                            variant="body"
                            style={[
                              styles.optionLabel,
                              isSelected && styles.optionLabelSelected,
                            ]}
                          >
                            {mapType.label}
                          </Text>
                          <Text variant="caption" style={styles.optionDescription}>
                            {mapType.description}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color="#4285F4" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text variant="body" style={styles.cancelText}>
                  Annuler
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34, // Safe area for home indicator
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F3F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#E8F0FE',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: '#4285F4',
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 13,
    color: '#5F6368',
  },
  cancelButton: {
    marginHorizontal: 24,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F1F3F4',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5F6368',
  },
});
