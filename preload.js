const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),

  // 命令执行
  sendCommand: (command, images) => ipcRenderer.invoke('send-command', command, images),
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),

  // 工作目录
  getWorkingDirectory: () => ipcRenderer.invoke('get-working-directory'),
  setWorkingDirectory: (dirPath) => ipcRenderer.invoke('set-working-directory', dirPath),

  // 文件夹选择
  openFolder: () => ipcRenderer.invoke('open-folder'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // 文件操作
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  showContextMenu: (filePath, isFolder) => ipcRenderer.invoke('show-context-menu', filePath, isFolder),
  openFolderInExplorer: (folderPath) => ipcRenderer.invoke('open-folder-in-explorer', folderPath),

  // 图片操作
  selectImage: () => ipcRenderer.invoke('select-image'),
  readFileAsBase64: (filePath) => ipcRenderer.invoke('read-file-as-base64', filePath),

  // 模式切换
  toggleMode: () => ipcRenderer.invoke('toggle-mode'),
  toggleThinking: () => ipcRenderer.invoke('toggle-thinking'),

  // 停止思考
    stopThinking: () => ipcRenderer.invoke('stop-thinking'),
    
    // 截图管理
      saveImageToScreenshots: (sourcePath) => ipcRenderer.invoke('save-image-to-screenshots', sourcePath),
      saveImageBufferToScreenshots: (buffer, mimeType) => ipcRenderer.invoke('save-image-buffer-to-screenshots', buffer, mimeType),
      clearScreenshots: () => ipcRenderer.invoke('clear-screenshots'),
      clearScreenshotFolder: () => ipcRenderer.invoke('clear-screenshot-folder'),    
    // 终端输出监听
    onTerminalOutput: (callback) => {
      ipcRenderer.on('terminal-output', (event, data) => {
        callback(data);
      });
    }
  });