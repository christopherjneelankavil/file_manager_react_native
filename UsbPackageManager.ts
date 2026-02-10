import { NativeModules } from 'react-native';

const { UsbFileModule } = NativeModules;

export interface UsbFile {
  name: string;
  uri: string;
  type: string;
  size: number;
  lastModified: number;
  isDirectory: boolean;
}

interface UsbFileModuleType {
  openDocumentTree(): Promise<string>;
  listFiles(uri: string): Promise<UsbFile[]>;
  copyFiles(sourceUris: string[], targetFolderUri: string): Promise<number>;
}

export default UsbFileModule as UsbFileModuleType;
