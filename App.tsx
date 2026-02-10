import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import UsbFileModule, {UsbFile} from './UsbPackageManager';
import { DeviceEventEmitter } from 'react-native';

function App(): React.JSX.Element {
  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [files, setFiles] = useState<UsbFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{name: string; uri: string}[]>([]);
  
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
  const [copyProgress, setCopyProgress] = useState({ handled: 0, total: 0, currentFile: '' });

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('CopyProgress', (event) => {
        setCopyProgress(event);
    });
    return () => {
        subscription.remove();
    };
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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

  const renderFileItem = ({item}: {item: UsbFile}) => {
    const isSelected = selectedFiles.has(item.uri);
    return (
        <TouchableOpacity 
            style={[styles.fileItem, isSelected && styles.selectedItem]} 
            onPress={() => onFilePress(item)}
            onLongPress={() => onFileLongPress(item)}
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

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
      case 'mp4': case 'mkv': case 'mov': return '🎥';
      case 'mp3': case 'wav': return '🎵';
      case 'pdf': return '📄';
      case 'txt': return '📝';
      default: return '📄';
    }
  };

  const renderDatePickers = () => (
      <View style={styles.filterContainer}>
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
             <Text style={styles.dateButtonText}>
                 Start: {startDate ? startDate.toLocaleDateString() : 'None'}
             </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>
                  End: {endDate ? endDate.toLocaleDateString() : 'None'}
              </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.applyButton, isFilterActive ? styles.activeFilter : null]}
            onPress={() => setIsFilterActive(!isFilterActive)}
          >
              <Text style={styles.applyButtonText}>{isFilterActive ? 'Clear Filter' : 'Filter'}</Text>
          </TouchableOpacity>

          {(showStartPicker || showEndPicker) && (
              <DateTimePicker
                  value={showStartPicker ? (startDate || new Date()) : (endDate || new Date())}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                      if (showStartPicker) {
                          setShowStartPicker(false);
                          if (selectedDate) setStartDate(selectedDate);
                      } else {
                          setShowEndPicker(false);
                          if (selectedDate) setEndDate(selectedDate);
                      }
                  }}
              />
          )}
      </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>USB File Manager</Text>
            {!currentUri && (
                <TouchableOpacity style={styles.selectButton} onPress={pickUsbRoot}>
                    <Text style={styles.selectButtonText}>Select USB Root</Text>
                </TouchableOpacity>
            )}
            {currentUri && (
                <View style={styles.headerActions}>
                     <TouchableOpacity onPress={selectAll} style={styles.headerButton}>
                         <Text style={styles.headerButtonText}>Select All</Text>
                     </TouchableOpacity>
                </View>
            )}
        </View>

        {currentUri && (
            <>
                <View style={styles.breadcrumbs}>
                     <TouchableOpacity onPress={navigateUp} disabled={breadcrumbs.length <= 1}>
                         <Text style={[styles.breadcrumbText, breadcrumbs.length <= 1 && styles.disabledText]}>
                             ⬅ Back
                         </Text>
                     </TouchableOpacity>
                     <Text style={styles.pathText} numberOfLines={1}>
                         {breadcrumbs.map(b => b.name).join(' > ')}
                     </Text>
                </View>

                {renderDatePickers()}

                <FlatList
                    data={filteredFiles}
                    renderItem={renderFileItem}
                    keyExtractor={item => item.uri}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>No files found</Text>}
                />

                {selectedFiles.size > 0 && !isCopying && (
                    <TouchableOpacity style={styles.fab} onPress={startCopy}>
                        <Text style={styles.fabIcon}>💾</Text>
                    </TouchableOpacity>
                )}

                {isCopying && (
                    <View style={styles.progressPanel}>
                        <Text style={styles.progressText}>
                            Copying {copyProgress.handled} of {copyProgress.total} files...
                        </Text>
                        <Text style={styles.progressSubText} numberOfLines={1}>
                            {copyProgress.currentFile}
                        </Text>
                        <View style={styles.progressBarBg}>
                             <View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${(copyProgress.handled / Math.max(copyProgress.total, 1)) * 100}%` }
                                ]} 
                             />
                        </View>
                    </View>
                )}
            </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  selectButton: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#eee',
  },
  breadcrumbText: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 10,
  },
  disabledText: {
    color: '#aaa',
  },
  pathText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dateButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  dateButtonText: {
      fontSize: 12,
      color: '#333',
  },
  applyButton: {
    padding: 8,
    backgroundColor: '#ddd',
    borderRadius: 5,
    justifyContent: 'center',
  },
  activeFilter: {
      backgroundColor: '#4CAF50',
  },
  applyButtonText: {
      fontSize: 12,
      color: '#333',
      fontWeight: 'bold',
  },
  listContent: {
    padding: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  iconContainer: {
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
  },
  selectedItem: {
      backgroundColor: '#e6f7ff',
      borderColor: '#1890ff',
      borderWidth: 1,
  },
  checkbox: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#eee',
      borderWidth: 1,
      borderColor: '#ccc',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
  },
  checkmark: {
      color: '#2196F3',
      fontSize: 14,
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
      color: '#007AFF',
      fontWeight: 'bold',
  },
  fab: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#2196F3',
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
      backgroundColor: '#fff',
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: '#ddd',
      elevation: 10,
  },
  progressText: {
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#333',
  },
  progressSubText: {
      fontSize: 12,
      color: '#666',
      marginBottom: 10,
  },
  progressBarBg: {
      height: 4,
      backgroundColor: '#eee',
      borderRadius: 2,
  },
  progressBarFill: {
      height: '100%',
      backgroundColor: '#2196F3',
      borderRadius: 2,
  },
});

export default App;
