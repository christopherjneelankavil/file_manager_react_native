import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Breadcrumb } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  onNavigateUp: () => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs, onNavigateUp }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.breadcrumbs, { backgroundColor: colors.surfaceHighlight }]}>
        <TouchableOpacity onPress={onNavigateUp} disabled={breadcrumbs.length <= 1}>
            <Text style={[
                styles.breadcrumbText, 
                { color: colors.text.link },
                breadcrumbs.length <= 1 && { color: colors.text.disabled }
            ]}>
                ⬅ Back
            </Text>
        </TouchableOpacity>
        <Text style={[styles.pathText, { color: colors.text.secondary }]} numberOfLines={1}>
            {breadcrumbs.map(b => b.name).join(' > ')}
        </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  breadcrumbText: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: '500',
  },
  pathText: {
    flex: 1,
    fontSize: 14,
  },
});

export default Breadcrumbs;
