# @lc-studio/layout-engine

一个基于 React 的布局引擎，提供画布上的元素拖拽、调整大小、网格吸附和元素吸附功能。

## 功能特性

- ✅ 元素拖拽移动
- ✅ 元素大小调整（支持 8 个方向）
- ✅ 网格吸附
- ✅ 元素吸附对齐
- ✅ 拖放支持
- ✅ 事件系统
- ✅ React Hooks 支持

## 安装

```bash
npm install @lc-studio/layout-engine react
```

## 基本使用

```tsx
import { LayoutEngine, LayoutCanvas, defaultLayoutEngineOptions } from '@lc-studio/layout-engine'

// 创建布局引擎实例
const engine = new LayoutEngine(defaultLayoutEngineOptions)

// 或使用工具函数
const engine = createLayoutEngine(defaultLayoutEngineOptions)
```

## 核心 API

### LayoutEngine

布局引擎核心类，负责管理画布上的元素和交互逻辑。

#### 构造函数

```ts
new LayoutEngine(options: LayoutEngineOptions)
```

#### 方法

- `addElement(element: LayoutElement)` - 添加元素
- `removeElement(elementId: string)` - 移除元素
- `getElement(elementId: string)` - 获取元素
- `getAllElements()` - 获取所有元素
- `selectElement(elementId: string | null)` - 选中元素
- `deselectElement()` - 取消选中
- `getSelectedElement()` - 获取选中元素
- `startDrag(elementId: string, position: Position)` - 开始拖拽
- `startResize(elementId: string, position: Position, direction: ResizeDirection)` - 开始调整大小
- `updateDrag(position: Position, scale?: number)` - 更新拖拽/调整位置
- `endDrag()` - 结束拖拽
- `getSnapGuides()` - 获取吸附参考线
- `updateCanvasConfig(config: Partial<CanvasConfig>)` - 更新画布配置
- `getCanvasConfig()` - 获取画布配置
- `clear()` - 清空所有元素

#### 事件

- `element:select` - 元素被选中
- `element:deselect` - 元素被取消选中
- `element:move` - 元素移动中
- `element:moveEnd` - 元素移动结束
- `element:resize` - 元素调整大小中
- `element:resizeEnd` - 元素调整大小结束
- `element:add` - 新增元素
- `element:remove` - 移除元素
- `canvas:drop` - 画布拖放

### LayoutCanvas

React 组件，用于渲染画布和元素。

#### Props

| 属性              | 类型                                                              | 默认值 | 说明               |
| ----------------- | ----------------------------------------------------------------- | ------ | ------------------ |
| elements          | `LayoutElement[]`                                                 | -      | 元素列表           |
| selectedElementId | `string \| null`                                                  | -      | 当前选中的元素ID   |
| canvasConfig      | `CanvasConfig`                                                    | -      | 画布配置           |
| scale             | `number`                                                          | 1      | 画布缩放比例       |
| scrollable        | `boolean`                                                         | true   | 是否可滚动         |
| snapGuides        | `SnapGuide[]`                                                     | []     | 吸附参考线         |
| showGrid          | `boolean`                                                         | false  | 是否显示网格       |
| showSnapGuides    | `boolean`                                                         | false  | 是否显示吸附参考线 |
| canvasDragOver    | `(e: DragEvent) => void`                                          | -      | 拖拽经过事件       |
| canvasDrop        | `(e: DragEvent) => void`                                          | -      | 拖放事件           |
| canvasWheel       | `(e: WheelEvent) => void`                                         | -      | 滚轮事件           |
| dragStart         | `(id: string, e: MouseEvent) => void`                             | -      | 拖拽开始事件       |
| resizeStart       | `(id: string, direction: ResizeDirection, e: MouseEvent) => void` | -      | 调整大小开始事件   |
| resizeEnd         | `(id: string, direction: ResizeDirection, e: MouseEvent) => void` | -      | 调整大小结束事件   |

### GridManager

网格管理器，负责网格的绘制和吸附计算。

#### 构造函数

```ts
new GridManager(options: GridManagerOptions)
```

#### 方法

- `snapToGrid(position: Position)` - 将位置吸附到网格
- `drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number)` - 绘制网格
- `getGridBackground()` - 获取网格背景样式
- `getGridBackgroundStyle()` - 获取网格背景样式对象
- `updateGridSize(size: number)` - 更新网格大小
- `toggleGrid(show: boolean)` - 切换网格显示
- `getGridSize()` - 获取网格大小
- `isGridVisible()` - 检查网格是否可见
- `getNearestGridPosition(position: Position)` - 获取最近的网格位置
- `isOnGrid(position: Position, tolerance?: number)` - 检查位置是否在网格上

### SnapManager

吸附管理器，负责元素之间的吸附对齐。

#### 构造函数

```ts
new SnapManager(options: SnapManagerOptions)
```

#### 方法

- `getSnapPosition(elementBounds: Bounds, otherElements: Bounds[])` - 获取吸附位置
- `getActiveGuides()` - 获取活跃参考线
- `clearGuides()` - 清除参考线
- `updateThreshold(threshold: number)` - 更新吸附阈值
- `isShowGuides()` - 检查是否显示参考线
- `toggleShowGuides(show: boolean)` - 切换参考线显示

### useLayoutEngine

React Hooks，简化布局引擎的使用。

#### 返回值

- `engine` - LayoutEngine 实例
- `elements` - 元素列表
- `selectedElementId` - 选中的元素ID
- `snapGuides` - 吸附参考线
- `handleCanvasDrop` - 处理画布拖放
- `handleDragStart` - 处理拖拽开始
- `handleDragMove` - 处理拖拽移动
- `handleDragEnd` - 处理拖拽结束
- `handleResizeStart` - 处理调整大小开始
- `handleResizeMove` - 处理调整大小移动
- `handleResizeEnd` - 处理调整大小结束

## 类型定义

### LayoutElement

```ts
interface LayoutElement {
  id: string
  bounds: Bounds
  type?: string
  data?: any
  [key: string]: any
}
```

### Bounds

```ts
interface Bounds extends Position, Size {
  x: number
  y: number
  width: number
  height: number
}
```

### Position

```ts
interface Position {
  x: number
  y: number
}
```

### Size

```ts
interface Size {
  width: number
  height: number
}
```

### ResizeDirection

```ts
type ResizeDirection = 'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw'
```
