import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UsbFile } from '../types';
import { formatFileSize, formatDate, getFileIcon } from '../utils/formatting';
import { useTheme } from '../theme/ThemeContext';

interface FileItemProps {
  item: UsbFile;
  isSelected: boolean;
  selectionMode: boolean;
  onPress: (item: UsbFile) => void;
  onLongPress: (item: UsbFile) => void;
}

const FileItem: React.FC<FileItemProps> = ({ item, isSelected, selectionMode, onPress, onLongPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <TouchableOpacity 
        style={[
            styles.fileItem, 
            { backgroundColor: colors.surface, shadowColor: colors.shadow },
            isSelected && [styles.selectedItem, { backgroundColor: colors.selection.background, borderColor: colors.selection.border }]
        ]} 
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
    >
        <View style={styles.iconContainer}>
            <Text style={styles.icon}>{item.isDirectory ? '📁' : getFileIcon(item.name)}</Text>
            {selectionMode && (
                <View style={[
                    styles.checkbox, 
                    { 
                        backgroundColor: colors.surfaceHighlight, 
                        borderColor: colors.borderLight 
                    }
                ]}>
                    {isSelected && <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>}
                </View>
            )}
        </View>
        <View style={styles.fileDetails}>
            <Text style={[styles.fileName, { color: colors.text.primary }]}>{item.name}</Text>
            <Text style={[styles.fileMeta, { color: colors.text.tertiary }]}>
            {item.isDirectory ? '' : formatFileSize(item.size) + ' • '}
            {formatDate(item.lastModified)}
            </Text>
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedItem: {
      borderWidth: 1,
  },
  iconContainer: {
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  checkbox: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
  },
  checkmark: {
      fontSize: 14,
      fontWeight: 'bold',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 13,
  },
});

export default FileItem;
