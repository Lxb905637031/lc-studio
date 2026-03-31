import { useCallback, useEffect, useRef, useState } from 'react'

import { HistoryManager } from '../core/HistoryManager'
import type { HistoryManagerOptions } from '../types'

/**
 * 历史管理器钩子
 * @param options 历史管理器选项
 * @returns 历史管理器实例和相关状态
 */
export function useHistoryManager(options: HistoryManagerOptions = {}) {
  // 使用 useRef 保存历史管理器实例，确保只创建一次
  const historyManagerRef = useRef<HistoryManager | null>(null)

  // 确保历史管理器实例只创建一次
  if (!historyManagerRef.current) {
    historyManagerRef.current = new HistoryManager(options)
  }

  // 获取历史管理器实例
  const historyManager = historyManagerRef.current

  // 状态管理
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [historySize, setHistorySize] = useState(0)
  const [redoSize, setRedoSize] = useState(0)

  // 更新状态的方法
  const updateState = useCallback(() => {
    setCanUndo(historyManager.canUndo())
    setCanRedo(historyManager.canRedo())
    setHistorySize(historyManager.getHistorySize())
    setRedoSize(historyManager.getRedoSize())
  }, [historyManager])

  // 初始化时更新状态
  useEffect(() => {
    updateState()
  }, [updateState])

  // 记录操作
  const record = useCallback(
    (action: string, elementId?: string, before?: any, after?: any) => {
      historyManager.record(action, elementId, before, after)
      updateState()
    },
    [historyManager, updateState]
  )

  // 撤销操作
  const undo = useCallback(() => {
    const entry = historyManager.undo()
    updateState()
    return entry
  }, [historyManager, updateState])

  // 重做操作
  const redo = useCallback(() => {
    const entry = historyManager.redo()
    updateState()
    return entry
  }, [historyManager, updateState])

  // 开始批量操作组
  const startGroup = useCallback(() => {
    return historyManager.startGroup()
  }, [historyManager])

  // 结束批量操作组
  const endGroup = useCallback(() => {
    historyManager.endGroup()
  }, [historyManager])

  // 清除所有历史记录
  const clear = useCallback(() => {
    historyManager.clear()
    updateState()
  }, [historyManager, updateState])

  // 记录添加元素操作
  const recordAddElement = useCallback(
    (elementId: string, element: any) => {
      historyManager.recordAddElement(elementId, element)
      updateState()
    },
    [historyManager, updateState]
  )

  // 记录删除元素操作
  const recordDeleteElement = useCallback(
    (elementId: string, element: any) => {
      historyManager.recordDeleteElement(elementId, element)
      updateState()
    },
    [historyManager, updateState]
  )

  // 记录更新元素操作
  const recordUpdateElement = useCallback(
    (elementId: string, before: any, after: any) => {
      historyManager.recordUpdateElement(elementId, before, after)
      updateState()
    },
    [historyManager, updateState]
  )

  // 记录移动元素操作
  const recordMoveElement = useCallback(
    (elementId: string, before: any, after: any) => {
      historyManager.recordMoveElement(elementId, before, after)
      updateState()
    },
    [historyManager, updateState]
  )

  // 记录调整元素大小操作
  const recordResizeElement = useCallback(
    (elementId: string, before: any, after: any) => {
      historyManager.recordResizeElement(elementId, before, after)
      updateState()
    },
    [historyManager, updateState]
  )

  // 记录选择元素操作
  const recordSelectElement = useCallback(
    (elementId: string | null, before: string | null, after: string | null) => {
      historyManager.recordSelectElement(elementId, before, after)
      updateState()
    },
    [historyManager, updateState]
  )

  // 记录画布缩放操作
  const recordZoom = useCallback(
    (before: number, after: number) => {
      historyManager.recordZoom(before, after)
      updateState()
    },
    [historyManager, updateState]
  )

  return {
    // 历史管理器实例
    historyManager,
    // 状态
    canUndo,
    canRedo,
    historySize,
    redoSize,
    // 方法
    record,
    undo,
    redo,
    startGroup,
    endGroup,
    clear,
    recordAddElement,
    recordDeleteElement,
    recordUpdateElement,
    recordMoveElement,
    recordResizeElement,
    recordSelectElement,
    recordZoom,
  }
}

/**
 * 使用默认历史管理器的钩子
 * @returns 默认历史管理器实例和相关状态
 */
export function useDefaultHistoryManager() {
  return useHistoryManager()
}
