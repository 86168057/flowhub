# FlowHub

<div align="center">

![FlowHub Logo](assets/github-logo.png)

**iFlow CLI 图形化界面**

一款功能强大的 iFlow AI 命令行工具的现代化桌面图形化界面

[![Version](https://img.shields.io/badge/version-V0.1-purple)](https://github.com/86168057/flowhub/releases)
[![Platform](https://img.shields.io/badge/platform-Windows-blue)](https://github.com/86168057/flowhub)
[![License](https://img.shields.io/badge/license-ISC-green)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-40.0.0-9BE64D)](https://www.electronjs.org/)

[下载](https://github.com/86168057/flowhub/releases) · [功能特性](#功能特性) · [使用指南](#使用指南) · [更新日志](#更新日志)

</div>

---

## ✨ 功能特性

### 🤖 AI 驱动的命令行交互
- 基于 GLM-4.7 AI 模型的智能对话系统
- 支持自然语言命令输入和实时响应
- AI 思考过程可视化（可开启/关闭）
- 支持图片输入，实现多模态交互

### 📁 文件浏览器
- 直观的文件树形结构展示
- 支持文件和文件夹的快速导航
- 实时文件系统监听，自动刷新
- 支持右键菜单快速操作

### 📝 内置代码编辑器
- 轻量级代码编辑功能
- 语法高亮显示
- 自动保存支持
- 快速复制文件内容

### 💻 终端集成
- 完整的终端输出显示
- 支持 Markdown 格式化渲染
- 命令历史记录功能
- 实时状态监控

### 🎨 多种工作模式
- **智能模式**: AI 默认行为，正常执行速度
- **YOLO 模式**: 自动批准所有操作，快速执行
- **计划模式**: 只规划不执行（只读模式）
- **默认模式**: 手动批准操作，安全执行

### 🖼️ 截图管理
- 支持粘贴图片到对话
- 一键清理截图功能
- 自动保存截图到项目目录

### ⚙️ 丰富的设置选项
- 字体大小调节
- 主题切换（深色/浅色/跟随系统）
- 自动保存设置
- 显示/隐藏命令历史
- AI 思考动画开关

### 🔄 自动更新
- 启动时自动检查更新
- 精美的更新下载窗口
- 实时下载进度显示
- 一键自动安装更新

---

## 🚀 快速开始

### 系统要求

- **操作系统**: Windows 10 或更高版本
- **处理器**: x64 架构
- **内存**: 4GB RAM 或更多
- **存储空间**: 500MB 可用空间

### 安装步骤

1. **下载安装包**
   - 访问 [Releases 页面](https://github.com/86168057/flowhub/releases)
   - 下载最新的 Windows 安装包（`.exe` 文件）

2. **运行安装程序**
   - 双击下载的安装包
   - 按照安装向导完成安装
   - 选择安装路径（默认：`%APPDATA%\FlowHub`）

3. **启动应用**
   - 安装完成后，从桌面快捷方式或开始菜单启动 FlowHub
   - 首次启动会自动检查更新

### 从源码构建

如果你想从源码构建应用，请按照以下步骤操作：

```bash
# 1. 克隆仓库
git clone https://github.com/86168057/flowhub.git
cd flowhub

# 2. 安装依赖
npm install

# 3. 启动开发模式
npm start

# 4. 构建安装包
npm run build          # 构建 NSIS 安装包
npm run build:portable # 构建便携版
```

**注意**: 构建需要安装 Visual Studio Build Tools 和 Spectre 缓解库。

---

## 📖 使用指南

### 基本操作

1. **发送命令**
   - 在底部输入框中输入你的问题或命令
   - 点击"发送"按钮或按回车键
   - AI 会实时回复你的问题

2. **切换工作模式**
   - 点击状态栏中的模式名称（如"智能模式"）
   - 或使用快捷键 `Alt + M`
   - 模式会在四种模式间循环切换

3. **开启/关闭 AI 思考**
   - 点击状态栏中的"思考：关闭/开启"
   - 或使用快捷键 `Tab`
   - 开启后会显示 AI 的思考过程

4. **加载图片**
   - 点击输入框上方的📷按钮
   - 选择要上传的图片
   - 或直接使用 `Ctrl + V` 粘贴剪贴板中的图片

5. **编辑文件**
   - 在左侧文件浏览器中双击文件
   - 在右侧编辑器中编辑内容
   - 点击"保存"按钮保存更改

6. **管理截图**
   - 在设置中点击"截图管理"
   - 点击"一键清理截图"删除所有截图

### 高级功能

#### 设置命令别名
在终端中输入自定义命令来快速执行常见操作。

#### 使用环境变量
FlowHub 支持读取系统环境变量，可在命令中使用。

#### 自定义主题
在设置中选择"跟随系统"主题，FlowHub 会自动适应系统主题。

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Enter` | 发送命令 |
| `Alt + M` | 切换工作模式 |
| `Tab` | 开启/关闭 AI 思考 |
| `Ctrl + V` | 粘贴图片 |
| `Esc` | 停止 AI 思考 |
| `Ctrl + C` | 复制选中内容 |

---

## 🛠️ 技术栈

- **框架**: [Electron](https://www.electronjs.org/) 40.0.0
- **构建工具**: [electron-builder](https://www.electron.build/) 26.4.0
- **AI 模型**: GLM-4.7
- **终端**: node-pty
- **编码**: iconv-lite
- **语言**: JavaScript (Node.js)

---

## 📂 项目结构

```
flowhub/
├── assets/              # 资源文件
│   └── github-logo.png  # GitHub logo
├── main.js              # 主进程代码
├── preload.js           # 预加载脚本
├── index.html           # 主界面 HTML
├── update-window.html   # 更新窗口 HTML
├── package.json         # 项目配置
├── package-lock.json    # 依赖锁定文件
└── README.md            # 项目说明文档
```

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

## 📝 更新日志

### [V0.1] - 2026-01-29

#### 新增功能
- ✨ 初始版本发布
- 🤖 集成 iFlow CLI 和 GLM-4.7 AI 模型
- 📁 实现文件浏览器功能
- 📝 添加内置代码编辑器
- 💻 集成终端输出显示
- 🎨 实现四种工作模式切换
- 🖼️ 添加截图管理功能
- ⚙️ 完整的设置系统
- 🔄 自动检查和下载更新功能
- 🎨 深色/浅色主题支持

#### 技术实现
- 基于 Electron 框架构建
- 使用 node-pty 实现终端集成
- GitHub API 集成用于自动更新
- 完整的 Windows 原生安装包支持

---

## 📄 许可证

本项目采用 [ISC 许可证](LICENSE)。

---

## 🙏 致谢

- [iFlow CLI](https://github.com/iflow-ai/iflow-cli) - 强大的 AI 命令行工具
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [GLM-4.7](https://open.bigmodel.cn/) - 智谱 AI 的强大语言模型

---

## 📞 联系方式

- **GitHub**: [https://github.com/86168057/flowhub](https://github.com/86168057/flowhub)
- **问题反馈**: [Issues](https://github.com/86168057/flowhub/issues)

---

<div align="center">

**用 ⚡ FlowHub，让 AI 命令行交互更简单**

Made with ❤️ by iFlow

[回到顶部](#flowhub)

</div>