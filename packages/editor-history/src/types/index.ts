// 历史记录项接口
export interface HistoryEntry {
  id: string // 唯一标识
  timestamp: number // 操作时间戳
  action: string // 操作类型（add, delete, update, move, resize等）
  elementId?: string // 涉及的元素ID
  before?: any // 操作前的状态
  after?: any // 操作后的状态
  group?: string | null // 批量操作的组ID
}

// 历史管理器选项接口
export interface HistoryManagerOptions {
  maxHistorySize?: number // 最大历史记录数量
}
