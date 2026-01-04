/**
 * SearchInput Component
 * Google Maps style search bar for filtering bottom sheet results
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  resultCount?: number;
}

export default function SearchInput({
  value,
  onChangeText,
  placeholder = 'Filtrer les résultats...',
  resultCount,
}: SearchInputProps) {
  const showClearButton = value.length > 0;

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Search Icon */}
        <Ionicons
          name="search-outline"
          size={20}
          color="#5F6368"
          style={styles.searchIcon}
        />

        {/* Text Input */}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#80868B"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never" // We use custom clear button
        />

        {/* Clear Button */}
        {showClearButton && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
          >
            <Ionicons name="close-circle" size={20} color="#5F6368" />
          </TouchableOpacity>
        )}
      </View>

      {/* Result count (optional) */}
      {resultCount !== undefined && value.length > 0 && (
        <View style={styles.resultCount}>
          <Ionicons name="filter-outline" size={14} color="#5F6368" />
          <Text style={styles.resultText}>
            {resultCount} résultat{resultCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F4',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#202124',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingLeft: 4,
  },
  resultText: {
    fontSize: 12,
    color: '#5F6368',
    marginLeft: 4,
  },
});
