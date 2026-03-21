import LayoutCanvas from './components/LayoutCanvas'
import { LayoutEngine } from './core/LayoutEngine'
import { CanvasConfig, LayoutEngineOptions } from './types'

// 类型定义
export * from './types'

// 核心类
export { LayoutEngine } from './core/LayoutEngine'
export { GridManager } from './core/GridManager'
export { SnapManager } from './core/SnapManager'

// 钩子
export { useLayoutEngine } from './hooks/useLayoutEngine'
export type { UseLayoutEngineOptions, UseLayoutEngineReturn } from './hooks/useLayoutEngine'

// 工具函数
export const createLayoutEngine = (options: LayoutEngineOptions) => {
  return new LayoutEngine(options)
}

// 默认配置
export const defaultCanvasConfig: CanvasConfig = {
  width: 1920,
  height: 1080,
  backgroundColor: '#ffffff',
  gridSize: 20,
  snapThreshold: 5,
  showGrid: true,
  showGuides: true,
}

export const defaultLayoutEngineOptions: LayoutEngineOptions = {
  canvas: defaultCanvasConfig,
  snapThreshold: 5,
  showSnapGuides: true,
  enableGridSnap: true,
  minElementSize: { width: 100, height: 100 },
}

export { LayoutCanvas }
