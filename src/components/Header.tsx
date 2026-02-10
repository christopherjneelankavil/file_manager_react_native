import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface HeaderProps {
    currentUri: string | null;
    onPickRoot: () => void;
    onSelectAll: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUri, onPickRoot, onSelectAll }) => {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>USB File Manager</Text>
            {!currentUri && (
                <TouchableOpacity style={styles.selectButton} onPress={onPickRoot}>
                    <Text style={styles.selectButtonText}>Select USB Root</Text>
                </TouchableOpacity>
            )}
            {currentUri && (
                <View style={styles.headerActions}>
                     <TouchableOpacity onPress={onSelectAll} style={styles.headerButton}>
                         <Text style={styles.headerButtonText}>Select All</Text>
                     </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  selectButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  selectButtonText: {
    color: colors.text.white,
    fontWeight: 'bold',
  },
  headerActions: {
      flexDirection: 'row',
      marginTop: 10,
  },
  headerButton: {
      padding: 5,
  },
  headerButtonText: {
      color: colors.text.link,
      fontWeight: 'bold',
  },
});

export default Header;
