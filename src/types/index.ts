export interface UsbFile {
    name: string;
    uri: string;
    type: string;
    size: number;
    lastModified: number;
    isDirectory: boolean;
  }
  
  export interface Breadcrumb {
    name: string;
    uri: string;
  }
  
  export interface ProgressData {
    handled: number;
    total: number;
    currentFile: string;
  }
