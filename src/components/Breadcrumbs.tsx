import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Breadcrumb } from '../types';
import { colors } from '../theme/colors';

interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  onNavigateUp: () => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs, onNavigateUp }) => {
  return (
    <View style={styles.breadcrumbs}>
        <TouchableOpacity onPress={onNavigateUp} disabled={breadcrumbs.length <= 1}>
            <Text style={[styles.breadcrumbText, breadcrumbs.length <= 1 && styles.disabledText]}>
                ⬅ Back
            </Text>
        </TouchableOpacity>
        <Text style={styles.pathText} numberOfLines={1}>
            {breadcrumbs.map(b => b.name).join(' > ')}
        </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.surfaceHighlight,
  },
  breadcrumbText: {
    fontSize: 16,
    color: colors.secondary,
    marginRight: 10,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  pathText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default Breadcrumbs;
