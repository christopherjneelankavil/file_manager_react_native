import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  Text,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UsbFileModule from '../native/UsbPackageManager';
import { UsbFile, Breadcrumb, ProgressData } from '../types';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import FilterBar from '../components/FilterBar';
import FileItem from '../components/FileItem';
import { useTheme } from '../theme/ThemeContext';

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [files, setFiles] = useState<UsbFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  
  // Date filtering state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  
  // Selection & Copy State
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copyProgress, setCopyProgress] = useState<ProgressData>({ handled: 0, total: 0, currentFile: '' });

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('CopyProgress', (event) => {
        setCopyProgress(event);
    });
    return () => {
        subscription.remove();
    };
  }, []);

  const formatFileSize = (bytes: number) => { // Kept local helper just for internal logic if needed, but UI uses the component util
     // Actually we don't need this here if FileItem handles it, 
     // but let's clear it if not used. 
     // Only used for Alert in onFilePress
     if (bytes === 0) return '0 B';
     const k = 1024;
     const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));
     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pickUsbRoot = async () => {
    try {
      const uri = await UsbFileModule.openDocumentTree();
      if (uri) {
        setCurrentUri(uri);
        setBreadcrumbs([{name: 'Root', uri: uri}]);
        loadFiles(uri);
        // Reset selection when changing root
        setSelectionMode(false);
        setSelectedFiles(new Set());
      }
    } catch (e: any) {
        if(e.code !== 'CANCELED') {
             Alert.alert('Error', 'Failed to select USB root: ' + e.message);
        }
    }
  };

  const loadFiles = async (uri: string) => {
    try {
      const fileList = await UsbFileModule.listFiles(uri);
      setFiles(fileList);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to list files: ' + e.message);
    }
  };

  const toggleSelection = (uri: string) => {
      const newSelection = new Set(selectedFiles);
      if (newSelection.has(uri)) {
          newSelection.delete(uri);
      } else {
          newSelection.add(uri);
      }
      setSelectedFiles(newSelection);
      
      if (newSelection.size === 0) {
          setSelectionMode(false);
      }
  };

  const onFilePress = (file: UsbFile) => {
    if (selectionMode) {
        toggleSelection(file.uri);
        return;
    }

    if (file.isDirectory) {
      setCurrentUri(file.uri);
      setBreadcrumbs([...breadcrumbs, {name: file.name, uri: file.uri}]);
      loadFiles(file.uri);
      // Reset selection when navigating
      setSelectionMode(false);
      setSelectedFiles(new Set());
    } else {
      Alert.alert('File', `Name: ${file.name}\nSize: ${formatFileSize(file.size)}\nType: ${file.type}`);
    }
  };

  const onFileLongPress = (file: UsbFile) => {
      if (!selectionMode) {
          setSelectionMode(true);
          const newSelection = new Set<string>();
          newSelection.add(file.uri);
          setSelectedFiles(newSelection);
      } else {
          toggleSelection(file.uri);
      }
  };

  const selectAll = () => {
      const newSelection = new Set<string>();
      filteredFiles.forEach(file => {
          if (!file.isDirectory) {
              newSelection.add(file.uri);
          }
      });
      setSelectedFiles(newSelection);
      if (newSelection.size > 0) setSelectionMode(true);
  };

  const startCopy = async () => {
      if (selectedFiles.size === 0) return;

      try {
          const targetFolderUri = await UsbFileModule.openDocumentTree();
          if (targetFolderUri) {
              setIsCopying(true);
              const filesToCopy = Array.from(selectedFiles);
              
              try {
                  const count = await UsbFileModule.copyFiles(filesToCopy, targetFolderUri);
                  Alert.alert("Success", `Successfully copied ${count} files.`);
                  setSelectionMode(false);
                  setSelectedFiles(new Set());
              } catch (e: any) {
                  Alert.alert("Copy Failed", e.message);
              } finally {
                  setIsCopying(false);
                  setCopyProgress({ handled: 0, total: 0, currentFile: '' });
              }
          }
      } catch (e: any) {
          if (e.code !== 'CANCELED') {
              Alert.alert("Error", "Failed to select destination: " + e.message);
          }
      }
  };

  const navigateUp = () => {
    if (breadcrumbs.length > 1) {
      const newBreadcrumbs = [...breadcrumbs];
      newBreadcrumbs.pop();
      const parent = newBreadcrumbs[newBreadcrumbs.length - 1];
      setBreadcrumbs(newBreadcrumbs);
      setCurrentUri(parent.uri);
      loadFiles(parent.uri);
    }
  };

  const filteredFiles = useMemo(() => {
    if (!isFilterActive || (!startDate && !endDate)) {
      return files;
    }
    return files.filter(file => {
      const fileDate = new Date(file.lastModified);
      let matchesStart = true;
      let matchesEnd = true;

      if (startDate) {
        matchesStart = fileDate >= startDate;
      }
      if (endDate) {
        // Set end date to end of day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        matchesEnd = fileDate <= endOfDay;
      }
      return matchesStart && matchesEnd;
    });
  }, [files, isFilterActive, startDate, endDate]);

  const onDateChange = (isStart: boolean, date?: Date) => {
      if (isStart) {
          setShowStartPicker(false);
          if (date) setStartDate(date);
      } else {
          setShowEndPicker(false);
          if (date) setEndDate(date);
      }
  };

  return (
    
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header 
            currentUri={currentUri} 
            onPickRoot={pickUsbRoot} 
            onSelectAll={selectAll}
        />

        {currentUri && (
            <>
                <Breadcrumbs breadcrumbs={breadcrumbs} onNavigateUp={navigateUp} />

                <FilterBar
                    startDate={startDate}
                    endDate={endDate}
                    showStartPicker={showStartPicker}
                    showEndPicker={showEndPicker}
                    isFilterActive={isFilterActive}
                    onStartPress={() => setShowStartPicker(true)}
                    onEndPress={() => setShowEndPicker(true)}
                    onToggleFilter={() => setIsFilterActive(!isFilterActive)}
                    onDateChange={onDateChange}
                />

                <FlatList
                    data={filteredFiles}
                    renderItem={({item}) => (
                        <FileItem
                            item={item}
                            isSelected={selectedFiles.has(item.uri)}
                            selectionMode={selectionMode}
                            onPress={onFilePress}
                            onLongPress={onFileLongPress}
                        />
                    )}
                    keyExtractor={item => item.uri}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>
                            No files found
                        </Text>
                    }
                />

                {selectedFiles.size > 0 && !isCopying && (
                    <TouchableOpacity 
                        style={[styles.fab, { backgroundColor: colors.primary }]} 
                        onPress={startCopy}
                    >
                        <Text style={[styles.fabIcon, { color: colors.text.white }]}>💾</Text>
                    </TouchableOpacity>
                )}

                {isCopying && (
                    <View style={[styles.progressPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                        <Text style={[styles.progressText, { color: colors.text.primary }]}>
                            Copying {copyProgress.handled} of {copyProgress.total} files...
                        </Text>
                        <Text style={[styles.progressSubText, { color: colors.text.tertiary }]} numberOfLines={1}>
                            {copyProgress.currentFile}
                        </Text>
                        <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceHighlight }]}>
                             <View 
                                style={[
                                    styles.progressBarFill, 
                                    { 
                                        width: `${(copyProgress.handled / Math.max(copyProgress.total, 1)) * 100}%`,
                                        backgroundColor: colors.primary
                                    }
                                ]} 
                             />
                        </View>
                    </View>
                )}
            </>
        )}
      </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
  },
  fab: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
  },
  fabIcon: {
      fontSize: 30,
  },
  progressPanel: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 15,
      borderTopWidth: 1,
      elevation: 10,
  },
  progressText: {
      fontWeight: 'bold',
      marginBottom: 5,
  },
  progressSubText: {
      fontSize: 12,
      marginBottom: 10,
  },
  progressBarBg: {
      height: 4,
      borderRadius: 2,
  },
  progressBarFill: {
      height: '100%',
      borderRadius: 2,
  },
});

export default HomeScreen;
