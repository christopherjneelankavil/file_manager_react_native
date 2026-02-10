import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface HeaderProps {
    currentUri: string | null;
    onPickRoot: () => void;
    onSelectAll: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUri, onPickRoot, onSelectAll }) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const { colors } = theme;

    return (
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={styles.topRow}>
                <Text style={[styles.title, { color: colors.text.primary }]}>USB File Manager</Text>
                <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
                    <Text style={[styles.themeIcon, { color: colors.text.primary }]}>
                        {isDarkMode ? '☀️' : '🌙'}
                    </Text>
                </TouchableOpacity>
            </View>
            
            {!currentUri && (
                <TouchableOpacity 
                    style={[styles.selectButton, { backgroundColor: colors.primary }]} 
                    onPress={onPickRoot}
                >
                    <Text style={[styles.selectButtonText, { color: colors.text.white }]}>Select USB Root</Text>
                </TouchableOpacity>
            )}
            {currentUri && (
                <View style={styles.headerActions}>
                     <TouchableOpacity onPress={onSelectAll} style={styles.headerButton}>
                         <Text style={[styles.headerButtonText, { color: colors.text.link }]}>Select All</Text>
                     </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      alignItems: 'center',
      marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  themeToggle: {
      padding: 8,
  },
  themeIcon: {
      fontSize: 20,
  },
  selectButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  selectButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerActions: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
  },
  headerButton: {
      padding: 5,
  },
  headerButtonText: {
      fontWeight: '600',
      fontSize: 16,
  },
});

export default Header;
