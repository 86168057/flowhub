const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let currentWorkingDir = 'E:\\iflow\\iflow';
let currentIflowProcess = null; // 保存当前运行的 iflow 进程

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    transparent: false,
    backgroundColor: '#121212',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // 打开开发者工具（调试用）- 已关闭以加快启动速度
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
    // 关闭时杀死 iflow 进程
    if (currentIflowProcess) {
      currentIflowProcess.kill();
      currentIflowProcess = null;
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 处理器注册

ipcMain.handle('send-command', async (event, command, images = []) => {
  return new Promise((resolve, reject) => {
    let output = '';
    let errorOutput = '';
    let completed = false;

    const iflowPath = 'C:\\Users\\86168\\AppData\\Roaming\\npm\\node_modules\\@iflow-ai\\iflow-cli\\bundle\\iflow.js';
    
    console.log('发送命令到 iFlow:', command);
    console.log('附加图片数量:', images.length);
    
    try {
      const iflowProcess = spawn('node', [iflowPath, command], {
        cwd: currentWorkingDir,
        env: { ...process.env, FORCE_COLOR: '1', NODE_ENV: 'production' },
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 180000, // 3分钟超时
        windowsHide: true
      });

      // 保存进程引用，用于停止
      currentIflowProcess = iflowProcess;

      iflowProcess.stdout.on('data', (data) => {
        output += data.toString('utf8');
        console.log('iFlow 输出:', data.toString('utf8'));
      });

      iflowProcess.stderr.on('data', (data) => {
        errorOutput += data.toString('utf8');
        console.log('iFlow 错误:', data.toString('utf8'));
      });

      iflowProcess.on('close', (code) => {
        currentIflowProcess = null;
        if (!completed) {
          completed = true;
          console.log('iFlow 进程关闭，退出码:', code);
          resolve({
            success: true,
            output: output,
            error: errorOutput,
            exitCode: code
          });
        }
      });

      iflowProcess.on('error', (error) => {
        currentIflowProcess = null;
        console.error('iFlow 进程错误:', error);
        if (!completed) {
          completed = true;
          resolve({
            success: false,
            output: '',
            error: error.message,
            exitCode: -1
          });
        }
      });

      iflowProcess.on('timeout', () => {
        console.log('iFlow 进程超时');
        currentIflowProcess = null;
        if (!completed) {
          completed = true;
          iflowProcess.kill();
          resolve({
            success: false,
            output: output,
            error: '命令执行超时（3分钟）',
            exitCode: -1
          });
        }
      });
    } catch (error) {
      console.error('启动 iFlow 进程失败:', error);
      currentIflowProcess = null;
      if (!completed) {
        completed = true;
        resolve({
          success: false,
          output: '',
          error: error.message,
          exitCode: -1
        });
      }
    }
  });
});

// 停止思考
ipcMain.handle('stop-thinking', async () => {
  if (currentIflowProcess) {
    console.log('停止思考，杀死 iflow 进程');
    try {
      currentIflowProcess.kill('SIGINT');
      currentIflowProcess = null;
      return { success: true };
    } catch (error) {
      console.error('停止思考失败:', error);
      currentIflowProcess = null;
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: '没有正在运行的进程' };
});

ipcMain.handle('execute-command', async (event, command) => {
  return new Promise((resolve, reject) => {
    let output = '';
    let errorOutput = '';

    try {
      // 使用 PowerShell，对 UTF-8 支持更好
      const shell = 'powershell.exe';
      // 设置输出编码为 UTF-8，并执行命令
      const args = [
        '-NoProfile',
        '-Command',
        `$OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ${command}`
      ];

      const cmdProcess = spawn(shell, args, {
        cwd: currentWorkingDir,
        shell: false,
        timeout: 30000,
        windowsHide: true,
        env: {
          ...process.env,
          LANG: 'en_US.UTF-8'
        }
      });

      let completed = false;

      cmdProcess.stdout.on('data', (data) => {
        output += data.toString('utf8');
      });

      cmdProcess.stderr.on('data', (data) => {
        errorOutput += data.toString('utf8');
      });

      cmdProcess.on('close', (code) => {
        if (!completed) {
          completed = true;
          resolve({
            success: code === 0,
            output: output,
            error: errorOutput,
            exitCode: code
          });
        }
      });

      cmdProcess.on('error', (error) => {
        if (!completed) {
          completed = true;
          reject({
            success: false,
            output: '',
            error: error.message,
            exitCode: -1
          });
        }
      });

      cmdProcess.on('timeout', () => {
        if (!completed) {
          completed = true;
          cmdProcess.kill();
          resolve({
            success: false,
            output: output,
            error: '命令执行超时',
            exitCode: -1
          });
        }
      });
    } catch (error) {
      reject({
        success: false,
        output: '',
        error: error.message,
        exitCode: -1
      });
    }
  });
});

ipcMain.handle('get-working-directory', async () => {
  return currentWorkingDir;
});

ipcMain.handle('set-working-directory', async (event, dirPath) => {
  currentWorkingDir = dirPath;
  console.log('工作目录已设置为:', currentWorkingDir);
  return currentWorkingDir;
});

// 读取文件
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const fs = require('fs').promises;
    const content = await fs.readFile(filePath, 'utf8');
    return {
      success: true,
      content: content
    };
  } catch (error) {
    console.error('读取文件失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// 写入文件
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    const fs = require('fs').promises;
    await fs.writeFile(filePath, content, 'utf8');
    return {
      success: true
    };
  } catch (error) {
    console.error('写入文件失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// 显示右键菜单
ipcMain.handle('show-context-menu', async (event, filePath, isFolder) => {
  try {
    const { shell } = require('electron');
    if (isFolder) {
      // 打开文件夹
      await shell.openPath(filePath);
    } else {
      // 打开文件的右键菜单
      await shell.showItemInFolder(filePath);
    }
    return {
      success: true
    };
  } catch (error) {
    console.error('显示右键菜单失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// 在文件管理器中打开文件夹
ipcMain.handle('open-folder-in-explorer', async (event, folderPath) => {
  try {
    const { shell } = require('electron');
    await shell.openPath(folderPath);
    return {
      success: true
    };
  } catch (error) {
    console.error('打开文件夹失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// 选择图片文件
ipcMain.handle('select-image', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
      ]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return {
        success: true,
        filePath: result.filePaths[0]
      };
    }
    return {
      success: false,
      error: '用户取消了选择'
    };
  } catch (error) {
    console.error('选择图片失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// 读取文件为base64
ipcMain.handle('read-file-as-base64', async (event, filePath) => {
  try {
    const fs = require('fs').promises;
    const data = await fs.readFile(filePath);
    const base64 = `data:image/${filePath.split('.').pop()};base64,${data.toString('base64')}`;
    return {
      success: true,
      content: base64
    };
  } catch (error) {
    console.error('读取文件失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('open-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      currentWorkingDir = result.filePaths[0];
      return {
        success: true,
        path: currentWorkingDir
      };
    }
    return {
      success: false,
      error: '用户取消了选择'
    };
  } catch (error) {
    console.error('选择文件夹出错:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('select-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      currentWorkingDir = result.filePaths[0];
      return currentWorkingDir;
    }
    return null;
  } catch (error) {
    console.error('选择文件夹出错:', error);
    throw error;
  }
});

ipcMain.handle('toggle-mode', async (event) => {
  return new Promise((resolve) => {
    resolve({
      success: true,
      mode: '智能模式'
    });
  });
});

ipcMain.handle('toggle-thinking', async (event) => {
  return new Promise((resolve) => {
    resolve({
      success: true,
      enabled: false
    });
  });
});

ipcMain.handle('send-image-to-iflow', async (event, base64Image) => {
  return new Promise((resolve, reject) => {
    let output = '';
    let errorOutput = '';

    const iflowPath = 'C:\\Users\\86168\\AppData\\Roaming\\npm\\node_modules\\@iflow-ai\\iflow-cli\\bundle\\iflow.js';
    
    try {
      const iflowProcess = spawn('node', [iflowPath, `@${base64Image}`], {
        cwd: currentWorkingDir,
        env: { ...process.env, FORCE_COLOR: '1' },
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 120000
      });

      let completed = false;

      iflowProcess.stdout.on('data', (data) => {
        output += data.toString('utf8');
      });

      iflowProcess.stderr.on('data', (data) => {
        errorOutput += data.toString('utf8');
      });

      iflowProcess.on('close', (code) => {
        if (!completed) {
          completed = true;
          resolve({
            success: true,
            output: output,
            error: errorOutput,
            exitCode: code
          });
        }
      });

      iflowProcess.on('error', (error) => {
        if (!completed) {
          completed = true;
          reject({
            success: false,
            output: '',
            error: error.message,
            exitCode: -1
          });
        }
      });
    } catch (error) {
      reject({
        success: false,
        output: '',
        error: error.message,
        exitCode: -1
      });
    }
  });
});

// 窗口控制
ipcMain.on('minimize-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('minimize-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

// 保存图片到截图文件夹
ipcMain.handle('save-image-to-screenshots', async (event, sourcePath) => {
  try {
    const path = require('path');
    const fs = require('fs');
    
    // 获取项目根目录
    const projectRoot = 'E:\\iflow\\iflow';
    const screenshotsDir = path.join(projectRoot, '截图');
    
    // 如果截图文件夹不存在，创建它
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // 生成唯一的文件名
    const ext = path.extname(sourcePath);
    const timestamp = Date.now();
    const counter = Math.floor(Math.random() * 1000);
    const fileName = `screenshot_${timestamp}_${counter}${ext}`;
    const destPath = path.join(screenshotsDir, fileName);
    
    // 复制文件
    fs.copyFileSync(sourcePath, destPath);
    
    return {
      success: true,
      savedPath: destPath
    };
  } catch (error) {
    console.error('保存图片失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// 保存图片buffer到截图文件夹
ipcMain.handle('save-image-buffer-to-screenshots', async (event, buffer, mimeType) => {
  try {
    const path = require('path');
    const fs = require('fs');
    
    // 获取项目根目录
    const projectRoot = 'E:\\iflow\\iflow';
    const screenshotsDir = path.join(projectRoot, '截图');
    
    // 如果截图文件夹不存在，创建它
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // 根据mimeType确定扩展名
    let ext = '.png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      ext = '.jpg';
    } else if (mimeType.includes('gif')) {
      ext = '.gif';
    } else if (mimeType.includes('webp')) {
      ext = '.webp';
    }
    
    // 生成唯一的文件名
    const timestamp = Date.now();
    const counter = Math.floor(Math.random() * 1000);
    const fileName = `screenshot_${timestamp}_${counter}${ext}`;
    const destPath = path.join(screenshotsDir, fileName);
    
    // 写入文件
    fs.writeFileSync(destPath, Buffer.from(buffer));
    
    return {
      success: true,
      savedPath: destPath
    };
  } catch (error) {
    console.error('保存图片buffer失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// 清空截图文件夹内的图片
ipcMain.handle('clear-screenshots', async () => {
  try {
    const path = require('path');
    const fs = require('fs');
    
    const projectRoot = 'E:\\iflow\\iflow';
    const screenshotsDir = path.join(projectRoot, '截图');
    
    if (!fs.existsSync(screenshotsDir)) {
      return {
        success: true,
        count: 0
      };
    }
    
    const files = fs.readdirSync(screenshotsDir);
    let count = 0;
    
    files.forEach(file => {
      const filePath = path.join(screenshotsDir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
        count++;
      }
    });
    
    return {
      success: true,
      count: count
    };
  } catch (error) {
    console.error('清空截图失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// 清空截图文件夹和文件夹内的图片
ipcMain.handle('clear-screenshot-folder', async () => {
  try {
    const path = require('path');
    const fs = require('fs');
    
    const projectRoot = 'E:\\iflow\\iflow';
    const screenshotsDir = path.join(projectRoot, '截图');
    
    console.log('尝试删除截图文件夹:', screenshotsDir);
    console.log('文件夹是否存在:', fs.existsSync(screenshotsDir));
    
    if (fs.existsSync(screenshotsDir)) {
      // 删除整个文件夹及其内容
      fs.rmSync(screenshotsDir, { recursive: true, force: true });
      console.log('截图文件夹已删除');
    } else {
      console.log('截图文件夹不存在，无需删除');
    }
    
    // 验证文件夹是否已删除
    const stillExists = fs.existsSync(screenshotsDir);
    console.log('验证文件夹是否已删除:', !stillExists);
    
    return {
      success: true,
      deleted: !stillExists
    };
  } catch (error) {
    console.error('删除截图文件夹失败:', error);
    console.error('错误堆栈:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
});

// 优雅关闭
app.on('before-quit', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.destroy();
  }
});