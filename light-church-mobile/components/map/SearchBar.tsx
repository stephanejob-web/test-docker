/**
 * SearchBar Component
 * Address autocomplete with automatic failover:
 * - Primary: data.gouv.fr (French Government API)
 * - Fallback: Nominatim (OpenStreetMap)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { Box, Text } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { searchAddresses } from '@/services/geoService';

interface AddressSuggestion {
  label: string;
  city: string;
  postcode: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface SearchBarProps {
  onLocationSelect: (latitude: number, longitude: number, label: string) => void;
}

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch address suggestions with automatic fallback (data.gouv.fr → Nominatim)
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Debounce 300ms
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchAddresses(query);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        // Search failed, show no suggestions
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelectLocation = (suggestion: AddressSuggestion) => {
    setQuery('');
    setIsOpen(false);
    Keyboard.dismiss();

    // coordinates = [longitude, latitude]
    onLocationSelect(suggestion.coordinates[1], suggestion.coordinates[0], suggestion.label);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    Keyboard.dismiss();
  };

  return (
    <Box style={styles.container}>
      {/* Search Input */}
      <Box style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#9AA0A6" style={styles.searchIcon} />

        <TextInput
          style={styles.input}
          placeholder="Rechercher une ville, adresse..."
          placeholderTextColor="#9AA0A6"
          value={query}
          onChangeText={setQuery}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
        />

        {isLoading && (
          <ActivityIndicator size="small" color="#4285F4" style={styles.loader} />
        )}

        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#9AA0A6" />
          </TouchableOpacity>
        )}
      </Box>

      {/* Suggestions List */}
      {isOpen && suggestions.length > 0 && (
        <Box style={styles.suggestionsContainer}>
          <Box style={styles.suggestionsHeader}>
            <Ionicons name="location" size={14} color="#4285F4" />
            <Text variant="caption" color="textSecondary" marginLeft="xs">
              RECHERCHE GÉOGRAPHIQUE
            </Text>
          </Box>

          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => `${item.label}-${index}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectLocation(item)}
              >
                <Ionicons name="location-outline" size={20} color="#4285F4" style={styles.suggestionIcon} />
                <Box flex={1}>
                  <Text variant="body" numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {item.city} • {item.postcode}
                  </Text>
                </Box>
              </TouchableOpacity>
            )}
          />
        </Box>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#202124',
    padding: 0,
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  suggestionIcon: {
    marginRight: 12,
  },
});
