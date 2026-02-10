import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';

interface FilterBarProps {
  startDate: Date | null;
  endDate: Date | null;
  showStartPicker: boolean;
  showEndPicker: boolean;
  isFilterActive: boolean;
  onStartPress: () => void;
  onEndPress: () => void;
  onToggleFilter: () => void;
  onDateChange: (isStart: boolean, date?: Date) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  startDate, endDate, showStartPicker, showEndPicker, isFilterActive,
  onStartPress, onEndPress, onToggleFilter, onDateChange
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
      <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            onPress={onStartPress} 
            style={[styles.dateButton, { borderColor: colors.borderLight }]}
          >
             <Text style={[styles.dateButtonText, { color: colors.text.primary }]}>
                 Start: {startDate ? startDate.toLocaleDateString() : 'None'}
             </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onEndPress} 
            style={[styles.dateButton, { borderColor: colors.borderLight }]}
          >
              <Text style={[styles.dateButtonText, { color: colors.text.primary }]}>
                  End: {endDate ? endDate.toLocaleDateString() : 'None'}
              </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
                styles.applyButton, 
                { backgroundColor: colors.border },
                isFilterActive && { backgroundColor: colors.success }
            ]}
            onPress={onToggleFilter}
          >
              <Text style={[styles.applyButtonText, { color: colors.text.primary }]}>
                  {isFilterActive ? 'Clear' : 'Filter'}
              </Text>
          </TouchableOpacity>

          {(showStartPicker || showEndPicker) && (
              <DateTimePicker
                  value={showStartPicker ? (startDate || new Date()) : (endDate || new Date())}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => onDateChange(showStartPicker, selectedDate)}
              />
          )}
      </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  dateButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
      fontSize: 13,
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  applyButtonText: {
      fontSize: 13,
      fontWeight: '600',
  },
});

export default FilterBar;
