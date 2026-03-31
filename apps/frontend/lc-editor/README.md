# lc-editor

lc-editor 是一个基于 React 的可视化编辑器，支持拖拽、调整大小、属性编辑等功能，并集成了完整的撤销/重做历史记录系统。

## 功能特性

- **物料库**：提供按钮、图片、文本等基础元素
- **拖拽功能**：支持从物料库拖拽元素到编辑区
- **调整大小**：支持调整元素的大小
- **移动元素**：支持在编辑区移动元素
- **属性编辑**：支持编辑元素的位置、大小、样式等属性
- **历史记录**：支持撤销/重做操作
- **删除元素**：支持删除选中的元素

## 技术栈

- React 19
- TypeScript
- Vite
- @lc-studio/layout-engine：布局引擎，负责元素的布局和交互
- @lc-studio/editor-history：历史记录管理器，负责撤销/重做功能

## 安装

### 前置条件

- Node.js 18.0 或更高版本
- npm 或 pnpm

### 安装依赖

```bash
# 从项目根目录安装依赖
pnpm install

# 进入 lc-editor 目录
cd apps/frontend/lc-editor

# 安装局部依赖
pnpm install
```

## 运行

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 使用方法

### 基本操作

1. **添加元素**：从左侧物料库拖拽元素到中间编辑区
2. **移动元素**：选中元素后，拖动元素到新位置
3. **调整大小**：选中元素后，拖动元素边缘的调整手柄
4. **编辑属性**：选中元素后，在右侧属性面板编辑元素的属性
5. **删除元素**：选中元素后，点击操作栏中的"删除元素"按钮
6. **撤销操作**：点击操作栏中的"撤销"按钮
7. **重做操作**：点击操作栏中的"重做"按钮

### 支持的元素类型

1. **普通按钮**：可编辑文字文案、文字大小、文字对齐方式、文字颜色、背景颜色
2. **上传图片**：可输入图片地址或上传本地图片
3. **文本**：可编辑文字文案、文字大小、文字对齐方式、文字颜色、背景颜色

## 项目结构

```
lc-editor/
├── public/              # 静态资源
│   ├── favicon.svg
│   └── icons.svg
├── src/                 # 源代码
│   ├── assets/          # 图片等资源
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── App.css          # 应用样式
│   ├── App.tsx          # 主应用组件
│   ├── index.css        # 全局样式
│   └── main.tsx         # 应用入口
├── .gitignore           # Git 忽略文件
├── README.md            # 项目文档
├── eslint.config.js     # ESLint 配置
├── index.html           # HTML 模板
├── package-lock.json    # npm 依赖锁定文件
├── package.json         # 项目配置和依赖
├── tsconfig.app.json    # TypeScript 配置（应用）
├── tsconfig.json        # TypeScript 配置
├── tsconfig.node.json   # TypeScript 配置（Node.js）
└── vite.config.ts       # Vite 配置
```

## 核心功能实现

### 1. 物料库

物料库提供了三种基础元素：普通按钮、上传图片和文本。每个物料都有默认的宽度、高度和样式。

### 2. 拖拽功能

实现了从物料库到编辑区的拖拽功能，使用 HTML5 的 Drag and Drop API。

### 3. 布局引擎集成

使用 @lc-studio/layout-engine 提供的布局引擎，实现元素的移动、调整大小等功能。

### 4. 历史记录系统

使用 @lc-studio/editor-history 提供的历史记录管理器，实现撤销/重做功能。

### 5. 属性编辑

根据元素类型显示不同的属性编辑表单，支持实时更新元素属性。

## 开发指南

### 代码风格

项目使用 ESLint 和 Prettier 进行代码风格检查和格式化。

```bash
# 运行 ESLint
pnpm lint
```

### 类型检查

项目使用 TypeScript 进行类型检查。

```bash
# 运行 TypeScript 类型检查
pnpm run tsc
```

## 扩展指南

### 添加新元素类型

1. 在 `materials` 数组中添加新的物料配置
2. 在 `renderElement` 函数中添加新元素类型的渲染逻辑
3. 在属性面板中添加新元素类型的属性编辑表单

## 许可证

MIT
