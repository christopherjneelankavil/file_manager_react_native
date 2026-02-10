import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UsbFile } from '../types';
import { formatFileSize, formatDate, getFileIcon } from '../utils/formatting';
import { colors } from '../theme/colors';

interface FileItemProps {
  item: UsbFile;
  isSelected: boolean;
  selectionMode: boolean;
  onPress: (item: UsbFile) => void;
  onLongPress: (item: UsbFile) => void;
}

const FileItem: React.FC<FileItemProps> = ({ item, isSelected, selectionMode, onPress, onLongPress }) => {
  return (
    <TouchableOpacity 
        style={[styles.fileItem, isSelected && styles.selectedItem]} 
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
    >
        <View style={styles.iconContainer}>
            <Text style={styles.icon}>{item.isDirectory ? '📁' : getFileIcon(item.name)}</Text>
            {selectionMode && (
                <View style={styles.checkbox}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
            )}
        </View>
        <View style={styles.fileDetails}>
            <Text style={styles.fileName}>{item.name}</Text>
            <Text style={styles.fileMeta}>
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
    padding: 15,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  selectedItem: {
      backgroundColor: colors.selection.background,
      borderColor: colors.selection.border,
      borderWidth: 1,
  },
  iconContainer: {
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
  },
  checkbox: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.surfaceHighlight,
      borderWidth: 1,
      borderColor: colors.borderLight,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
  },
  checkmark: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 12,
    color: colors.text.muted,
  },
});

export default FileItem;
