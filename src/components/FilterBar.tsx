import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';

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
  return (
      <View style={styles.filterContainer}>
          <TouchableOpacity onPress={onStartPress} style={styles.dateButton}>
             <Text style={styles.dateButtonText}>
                 Start: {startDate ? startDate.toLocaleDateString() : 'None'}
             </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onEndPress} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>
                  End: {endDate ? endDate.toLocaleDateString() : 'None'}
              </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.applyButton, isFilterActive ? styles.activeFilter : null]}
            onPress={onToggleFilter}
          >
              <Text style={styles.applyButtonText}>{isFilterActive ? 'Clear Filter' : 'Filter'}</Text>
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
    padding: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  dateButtonText: {
      fontSize: 12,
      color: colors.text.primary,
  },
  applyButton: {
    padding: 8,
    backgroundColor: colors.border,
    borderRadius: 5,
    justifyContent: 'center',
  },
  activeFilter: {
      backgroundColor: colors.success,
  },
  applyButtonText: {
      fontSize: 12,
      color: colors.text.primary,
      fontWeight: 'bold',
  },
});

export default FilterBar;
