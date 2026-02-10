export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  export const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  export const getFileIcon = (name: string) => {
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
