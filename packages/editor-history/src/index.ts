// 导出类型
export * from './types'

// 导出核心类
export { HistoryManager } from './core/HistoryManager'

// 导出 hooks
export * from './hooks/useHistoryManager'

// 导出默认实例
import { HistoryManager } from './core/HistoryManager'
export default new HistoryManager()
