/**
 * 二维坐标点
 */
export interface Position {
  /** 横坐标 */
  x: number
  /** 纵坐标 */
  y: number
}

/**
 * 尺寸信息
 */
export interface Size {
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
}

/**
 * 边界框：同时包含位置与尺寸
 */
export interface Bounds extends Position, Size {}

/**
 * 布局元素：画布上的可拖拽/可调整大小的元素
 */
export interface LayoutElement {
  /** 元素唯一标识 */
  id: string
  /** 元素边界框 */
  bounds: Bounds
  /** 可选元素类型，用于区分不同组件 */
  type?: string
  /** 任意自定义数据 */
  data?: any
  /** 允许额外动态属性 */
  [key: string]: any
}

/**
 * 画布配置
 */
export interface CanvasConfig {
  /** 画布宽度 */
  width: number
  /** 画布高度 */
  height: number
  /** 背景色 */
  backgroundColor?: string
  /** 网格大小（像素） */
  gridSize?: number
  /** 吸附阈值：距离多少像素时触发吸附 */
  snapThreshold?: number
  /** 是否显示网格 */
  showGrid?: boolean
  /** 是否显示辅助线 */
  showGuides?: boolean
}

/**
 * 拖拽状态：记录当前是否正在拖拽或调整大小
 */
export interface DragState {
  /** 是否处于拖拽中 */
  isDragging: boolean
  /** 是否处于调整大小中 */
  isResizing: boolean
  /** 拖拽起始坐标（相对于画布） */
  dragStartPosition?: Position
  /** 元素初始边界框（拖拽/调整前） */
  elementStartBounds?: Bounds
  /** 调整大小的方向 */
  resizeDirection?: ResizeDirection
}

/**
 * 调整大小方向：八个方位 + 四角
 */
export type ResizeDirection = 'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw'

/**
 * 吸附辅助线：用于对齐元素的垂直或水平线
 */
export interface SnapGuide {
  /** 辅助线类型：垂直或水平 */
  type: 'vertical' | 'horizontal'
  /** 辅助线位置（x 或 y 坐标） */
  position: number
  /** 参与对齐的元素 id 列表 */
  elements: string[]
}

/**
 * 布局引擎初始化选项
 */
export interface LayoutEngineOptions {
  /** 画布配置 */
  canvas: CanvasConfig
  /** 吸附阈值，可覆盖画布默认值 */
  snapThreshold?: number
  /** 是否显示吸附辅助线 */
  showSnapGuides?: boolean
  /** 是否启用网格吸附 */
  enableGridSnap?: boolean
  /** 元素最小尺寸限制 */
  minElementSize?: Size
}

/**
 * 布局引擎事件映射
 * 键为事件名，值为对应回调函数签名
 */
export interface LayoutEngineEvents {
  /** 元素被选中 */
  'element:select': (elementId: string | null) => void
  /** 元素被取消选中 */
  'element:deselect': (elementId: string | null) => void
  /** 元素移动中，持续触发 */
  'element:move': (elementId: string, bounds: Bounds) => void
  /** 元素移动结束，拖拽松开时触发一次 */
  'element:moveEnd': (elementId: string, bounds: Bounds) => void
  /** 元素调整大小中，持续触发 */
  'element:resize': (elementId: string, bounds: Bounds) => void
  /** 元素调整大小结束，松开时触发一次 */
  'element:resizeEnd': (elementId: string, bounds: Bounds) => void
  /** 新增元素到画布 */
  'element:add': (element: LayoutElement) => void
  /** 从画布移除元素 */
  'element:remove': (elementId: string) => void
  /** 外部拖放内容到画布 */
  'canvas:drop': (position: Position, data?: any) => void
}
