import type { HistoryEntry, HistoryManagerOptions } from '../types'

// 历史管理器类
export class HistoryManager {
  // 历史记录栈，用于存储所有操作记录
  private history: HistoryEntry[] = []
  // 重做栈，用于存储被撤销的操作
  private redoStack: HistoryEntry[] = []
  // 最大历史记录数量限制
  private maxHistorySize: number
  // 当前批量操作组的ID，null表示不在任何组中
  private currentGroup: string | null = null

  constructor(options: HistoryManagerOptions = {}) {
    this.maxHistorySize = options.maxHistorySize || 50
  }

  /**
   * 开始批量操作组
   * @returns 组ID
   */
  startGroup(): string {
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.currentGroup = groupId
    return groupId
  }

  /**
   * 结束批量操作组
   */
  endGroup(): void {
    this.currentGroup = null
  }

  /**
   * 记录操作
   * @param action 操作类型
   * @param elementId 元素ID
   * @param before 操作前的状态
   * @param after 操作后的状态
   */
  record(action: string, elementId?: string, before?: any, after?: any): void {
    // 清除重做栈
    this.redoStack = []

    // 创建历史记录项
    const entry: HistoryEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action,
      elementId,
      before,
      after,
      group: this.currentGroup,
    }

    // 添加到历史栈
    this.history.push(entry)

    // 限制历史记录数量
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }
  }

  /**
   * 撤销操作
   * @returns 被撤销的操作，如果没有可撤销的操作则返回 null
   */
  undo(): HistoryEntry | null {
    if (this.history.length === 0) {
      return null
    }

    // 获取最后一个操作
    const entry = this.history.pop()
    if (!entry) {
      return null
    }

    // 如果是批量操作，需要将同一组的所有操作都移到重做栈
    if (entry.group) {
      const groupEntries = [entry]
      // 从历史栈中找到同一组的其他操作
      while (this.history.length > 0) {
        const lastEntry = this.history[this.history.length - 1]
        if (lastEntry.group === entry.group) {
          groupEntries.unshift(this.history.pop()!)
        } else {
          break
        }
      }
      // 将组操作添加到重做栈
      this.redoStack.push(...groupEntries)
      return groupEntries[0] // 返回组的第一个操作
    } else {
      // 单个操作直接添加到重做栈
      this.redoStack.push(entry)
      return entry
    }
  }

  /**
   * 重做操作
   * @returns 被重做的操作，如果没有可重做的操作则返回 null
   */
  redo(): HistoryEntry | null {
    if (this.redoStack.length === 0) {
      return null
    }

    // 获取重做栈中的操作
    const entry = this.redoStack.pop()
    if (!entry) {
      return null
    }

    // 如果是批量操作，需要将同一组的所有操作都移到历史栈
    if (entry.group) {
      const groupEntries = [entry]
      // 从重做栈中找到同一组的其他操作
      while (this.redoStack.length > 0) {
        const lastEntry = this.redoStack[this.redoStack.length - 1]
        if (lastEntry.group === entry.group) {
          groupEntries.unshift(this.redoStack.pop()!)
        } else {
          break
        }
      }
      // 将组操作添加到历史栈
      this.history.push(...groupEntries)
      return groupEntries[0] // 返回组的第一个操作
    } else {
      // 单个操作直接添加到历史栈
      this.history.push(entry)
      return entry
    }
  }

  /**
   * 清除所有历史记录
   */
  clear(): void {
    this.history = []
    this.redoStack = []
    this.currentGroup = null
  }

  /**
   * 获取历史记录数量
   */
  getHistorySize(): number {
    return this.history.length
  }

  /**
   * 获取重做栈数量
   */
  getRedoSize(): number {
    return this.redoStack.length
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.history.length > 0
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /**
   * 记录添加元素操作
   * @param elementId 元素ID
   * @param element 元素数据
   */
  recordAddElement(elementId: string, element: any): void {
    this.record('add', elementId, null, element)
  }

  /**
   * 记录删除元素操作
   * @param elementId 元素ID
   * @param element 元素数据
   */
  recordDeleteElement(elementId: string, element: any): void {
    this.record('delete', elementId, element, null)
  }

  /**
   * 记录更新元素操作
   * @param elementId 元素ID
   * @param before 操作前的状态
   * @param after 操作后的状态
   */
  recordUpdateElement(elementId: string, before: any, after: any): void {
    this.record('update', elementId, before, after)
  }

  /**
   * 记录移动元素操作
   * @param elementId 元素ID
   * @param before 操作前的位置
   * @param after 操作后的位置
   */
  recordMoveElement(elementId: string, before: any, after: any): void {
    this.record('move', elementId, before, after)
  }

  /**
   * 记录调整元素大小操作
   * @param elementId 元素ID
   * @param before 操作前的尺寸
   * @param after 操作后的尺寸
   */
  recordResizeElement(elementId: string, before: any, after: any): void {
    this.record('resize', elementId, before, after)
  }

  /**
   * 记录选择元素操作
   * @param elementId 元素ID
   * @param before 操作前的选中状态
   * @param after 操作后的选中状态
   */
  recordSelectElement(elementId: string | null, before: string | null, after: string | null): void {
    this.record('select', elementId || undefined, before, after)
  }

  /**
   * 记录画布缩放操作
   * @param before 操作前的缩放比例
   * @param after 操作后的缩放比例
   */
  recordZoom(before: number, after: number): void {
    this.record('zoom', undefined, before, after)
  }
}
