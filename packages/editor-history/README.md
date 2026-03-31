# editor-history

editor-history 是一个专为编辑器设计的历史记录管理库，提供了撤销/重做功能的完整实现。

## 功能特性

- 支持多种操作类型的历史记录（添加、删除、更新、移动、调整大小等）
- 提供 React Hook 用于在 React 应用中便捷使用
- 支持批量操作组
- 可配置的历史记录大小限制
- 完整的撤销/重做功能

## 安装

```bash
# 使用 npm
npm install @lc-studio/editor-history

# 使用 yarn
yarn add @lc-studio/editor-history

# 使用 pnpm
pnpm add @lc-studio/editor-history
```

## 基本使用

### 在 React 应用中使用

```tsx
import { useHistoryManager } from '@lc-studio/editor-history'

function App() {
  const { canUndo, canRedo, recordAddElement, recordUpdateElement, recordDeleteElement, undo, redo } = useHistoryManager()

  // 记录添加元素操作
  const handleAddElement = element => {
    addElement(element)
    recordAddElement(element.id, element)
  }

  // 记录更新元素操作
  const handleUpdateElement = (elementId, before, after) => {
    updateElement(elementId, after)
    recordUpdateElement(elementId, before, after)
  }

  // 记录删除元素操作
  const handleDeleteElement = element => {
    removeElement(element.id)
    recordDeleteElement(element.id, element)
  }

  // 处理撤销操作
  const handleUndo = () => {
    const entry = undo()
    if (entry) {
      switch (entry.action) {
        case 'add':
          // 撤销添加操作，删除元素
          removeElement(entry.elementId!)
          break
        case 'update':
          // 撤销更新操作，恢复到之前的状态
          updateElement(entry.elementId!, entry.before!)
          break
        case 'delete':
          // 撤销删除操作，重新添加元素
          addElement(entry.before!)
          break
      }
    }
  }

  // 处理重做操作
  const handleRedo = () => {
    const entry = redo()
    if (entry) {
      switch (entry.action) {
        case 'add':
          // 重做添加操作，重新添加元素
          addElement(entry.after!)
          break
        case 'update':
          // 重做更新操作，恢复到之后的状态
          updateElement(entry.elementId!, entry.after!)
          break
        case 'delete':
          // 重做删除操作，删除元素
          removeElement(entry.elementId!)
          break
      }
    }
  }

  return (
    <div>
      <button onClick={handleAddElement}>添加元素</button>
      <button onClick={handleUndo} disabled={!canUndo}>
        撤销
      </button>
      <button onClick={handleRedo} disabled={!canRedo}>
        重做
      </button>
    </div>
  )
}
```

### 直接使用 HistoryManager 类

```typescript
import { HistoryManager } from '@lc-studio/editor-history'

// 创建历史管理器实例
const historyManager = new HistoryManager({ maxHistorySize: 50 })

// 记录操作
historyManager.record('add', 'element-1', null, { id: 'element-1', type: 'text', bounds: { x: 0, y: 0, width: 100, height: 50 } })

// 撤销操作
const entry = historyManager.undo()
if (entry) {
  console.log('Undo action:', entry.action)
}

// 重做操作
const redoEntry = historyManager.redo()
if (redoEntry) {
  console.log('Redo action:', redoEntry.action)
}
```

## API 文档

### useHistoryManager 钩子

#### 返回值

| 属性/方法             | 类型                                                                      | 描述                 |
| --------------------- | ------------------------------------------------------------------------- | -------------------- | ------------------- | -------------- | ---------------- |
| `canUndo`             | `boolean`                                                                 | 是否可以撤销         |
| `canRedo`             | `boolean`                                                                 | 是否可以重做         |
| `historySize`         | `number`                                                                  | 历史记录数量         |
| `redoSize`            | `number`                                                                  | 重做记录数量         |
| `record`              | `(action: string, elementId?: string, before?: any, after?: any) => void` | 记录操作             |
| `undo`                | `() => HistoryEntry                                                       | null`                | 撤销操作            |
| `redo`                | `() => HistoryEntry                                                       | null`                | 重做操作            |
| `startGroup`          | `() => string`                                                            | 开始批量操作组       |
| `endGroup`            | `() => void`                                                              | 结束批量操作组       |
| `clear`               | `() => void`                                                              | 清除所有历史记录     |
| `recordAddElement`    | `(elementId: string, element: any) => void`                               | 记录添加元素操作     |
| `recordDeleteElement` | `(elementId: string, element: any) => void`                               | 记录删除元素操作     |
| `recordUpdateElement` | `(elementId: string, before: any, after: any) => void`                    | 记录更新元素操作     |
| `recordMoveElement`   | `(elementId: string, before: any, after: any) => void`                    | 记录移动元素操作     |
| `recordResizeElement` | `(elementId: string, before: any, after: any) => void`                    | 记录调整元素大小操作 |
| `recordSelectElement` | `(elementId: string                                                       | null, before: string | null, after: string | null) => void` | 记录选择元素操作 |
| `recordZoom`          | `(before: number, after: number) => void`                                 | 记录画布缩放操作     |

### HistoryManager 类

#### 构造函数

```typescript
new HistoryManager(options?: HistoryManagerOptions)
```

**参数**:

- `options`: 历史管理器选项
  - `maxHistorySize`: 最大历史记录数量，默认值为 50

#### 方法

| 方法                                                                    | 描述                 |
| ----------------------------------------------------------------------- | -------------------- | ------------------- | ------ | ---------------- |
| `record(action: string, elementId?: string, before?: any, after?: any)` | 记录操作             |
| `undo(): HistoryEntry                                                   | null`                | 撤销操作            |
| `redo(): HistoryEntry                                                   | null`                | 重做操作            |
| `startGroup(): string`                                                  | 开始批量操作组       |
| `endGroup(): void`                                                      | 结束批量操作组       |
| `clear(): void`                                                         | 清除所有历史记录     |
| `getHistorySize(): number`                                              | 获取历史记录数量     |
| `getRedoSize(): number`                                                 | 获取重做记录数量     |
| `canUndo(): boolean`                                                    | 检查是否可以撤销     |
| `canRedo(): boolean`                                                    | 检查是否可以重做     |
| `recordAddElement(elementId: string, element: any)`                     | 记录添加元素操作     |
| `recordDeleteElement(elementId: string, element: any)`                  | 记录删除元素操作     |
| `recordUpdateElement(elementId: string, before: any, after: any)`       | 记录更新元素操作     |
| `recordMoveElement(elementId: string, before: any, after: any)`         | 记录移动元素操作     |
| `recordResizeElement(elementId: string, before: any, after: any)`       | 记录调整元素大小操作 |
| `recordSelectElement(elementId: string                                  | null, before: string | null, after: string | null)` | 记录选择元素操作 |
| `recordZoom(before: number, after: number)`                             | 记录画布缩放操作     |

## 类型定义

### HistoryEntry

```typescript
interface HistoryEntry {
  id: string // 唯一标识
  timestamp: number // 操作时间戳
  action: string // 操作类型（add, delete, update, move, resize等）
  elementId?: string // 涉及的元素ID
  before?: any // 操作前的状态
  after?: any // 操作后的状态
  group?: string | null // 批量操作的组ID
}
```

### HistoryManagerOptions

```typescript
interface HistoryManagerOptions {
  maxHistorySize?: number // 最大历史记录数量
}
```

## 示例应用

### 与布局引擎集成

```tsx
import { useLayoutEngine } from '@lc-studio/layout-engine'
import { useHistoryManager } from '@lc-studio/editor-history'

function App() {
  const { elements, addElement, removeElement, updateElement, selectElement, engine } = useLayoutEngine({
    canvas: {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    },
  })

  const { canUndo, canRedo, recordAddElement, recordUpdateElement, undo, redo } = useHistoryManager()

  // 监听移动开始事件
  engine.on('element:moveStart', (_, bounds) => {
    setStartMoveBounds({ ...bounds })
  })

  // 监听移动事件
  engine.on('element:move', (elementId, bounds) => {
    const element = elements.find(e => e.id === elementId)
    if (element && startMoveBounds) {
      const before = { ...element, bounds: { ...startMoveBounds } }
      const after = { ...element, bounds: { ...bounds } }
      recordUpdateElement(elementId, before, after)
    }
    setStartMoveBounds(null)
  })

  // 处理撤销操作
  const handleUndo = () => {
    const entry = undo()
    if (entry) {
      switch (entry.action) {
        case 'add':
          removeElement(entry.elementId!)
          selectElement(null)
          break
        case 'update':
          updateElement(entry.elementId!, { bounds: entry.before!.bounds })
          break
      }
    }
  }

  // 处理重做操作
  const handleRedo = () => {
    const entry = redo()
    if (entry) {
      switch (entry.action) {
        case 'add':
          addElement(entry.after!)
          selectElement(entry.elementId!)
          break
        case 'update':
          updateElement(entry.elementId!, { bounds: entry.after!.bounds })
          break
      }
    }
  }

  return (
    <div>
      {/* 编辑器内容 */}
      <div className="editor-controls">
        <button onClick={handleUndo} disabled={!canUndo}>
          撤销
        </button>
        <button onClick={handleRedo} disabled={!canRedo}>
          重做
        </button>
      </div>
    </div>
  )
}
```

## 开发

### 安装依赖

```bash
pnpm install
```

### 构建

```bash
pnpm build
```

### 类型检查

```bash
pnpm typecheck
```

## 许可证

MIT
