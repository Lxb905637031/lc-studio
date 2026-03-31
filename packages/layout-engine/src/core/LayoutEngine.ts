import {
  CanvasConfig,
  DragState,
  LayoutElement,
  LayoutEngineEvents,
  LayoutEngineOptions,
  Position,
  ResizeDirection,
  Size,
  SnapGuide,
} from '../types'
import { GridManager } from './GridManager'
import { SnapManager } from './SnapManager'

/**
 * 布局引擎核心类
 * 负责管理画布上的布局元素，包括元素的添加、删除、选择、拖拽、调整大小等操作
 * 支持网格吸附和元素吸附功能
 */
export class LayoutEngine {
  private elements: Map<string, LayoutElement> = new Map()
  private selectedElementId: string | null = null
  private dragState: DragState = {
    isDragging: false,
    isResizing: false,
    dragStartPosition: {
      x: 0,
      y: 0,
    },
    elementStartBounds: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  }
  private eventListeners: Partial<LayoutEngineEvents> = {}
  private snapManager: SnapManager
  private gridManager: GridManager
  private canvasConfig: CanvasConfig
  private minElementSize: Size

  /**
   * 创建布局引擎实例
   * @param options 布局引擎配置选项
   */
  constructor(options: LayoutEngineOptions) {
    this.canvasConfig = options.canvas
    this.minElementSize = options.minElementSize || { width: 100, height: 100 }
    this.snapManager = new SnapManager({
      threshold: options.snapThreshold || 5,
    })
    this.gridManager = new GridManager({
      size: options.canvas.gridSize || 20,
      show: options.canvas.showGrid !== false,
    })
  }

  // ==================== 事件监听 ====================

  /**
   * 注册事件监听器
   * @param event 事件名称
   * @param listener 事件回调函数
   */
  on<K extends keyof LayoutEngineEvents>(event: K, listener: LayoutEngineEvents[K]) {
    this.eventListeners[event] = listener
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   */
  off<K extends keyof LayoutEngineEvents>(event: K) {
    delete this.eventListeners[event]
  }

  // ==================== 元素管理 ====================

  /**
   * 添加元素到画布
   * @param element 要添加的元素
   */
  addElement(element: LayoutElement) {
    this.elements.set(element.id, element)
    this.emit('element:add', element)
  }

  /**
   * 从画布移除元素
   * @param elementId 元素ID
   */
  removeElement(elementId: string) {
    if (this.elements.has(elementId)) {
      this.elements.delete(elementId)
      this.emit('element:remove', elementId)
      // 取消选中被删除的元素
      if (elementId === this.selectedElementId) {
        this.selectedElementId = null
        this.emit('element:deselect', null)
      }
    }
  }

  /**
   * 获取指定ID的元素
   * @param elementId 元素ID
   * @returns 元素对象，如果不存在则返回 undefined
   */
  getElement(elementId: string): LayoutElement | undefined {
    return this.elements.get(elementId)
  }

  /**
   * 获取所有元素
   * @returns 元素数组
   */
  getAllElements(): LayoutElement[] {
    return Array.from(this.elements.values())
  }

  /**
   * 选中元素
   * @param elementId 元素ID，null 表示取消选中
   */
  selectElement(elementId: string | null) {
    this.selectedElementId = elementId
    this.emit('element:select', elementId)
  }

  /**
   * 取消选中元素
   */
  deselectElement() {
    this.selectedElementId = null
    this.emit('element:deselect', null)
  }

  /**
   * 获取当前选中的元素
   * @returns 选中的元素，如果不存在则返回 null
   */
  getSelectedElement(): LayoutElement | null {
    return this.selectedElementId ? this.elements.get(this.selectedElementId) || null : null
  }

  // ==================== 拖拽处理 ====================

  /**
   * 开始拖拽元素
   * @param elementId 元素ID
   * @param position 拖拽起始位置
   */
  startDrag(elementId: string, position: Position) {
    const element = this.getElement(elementId)
    if (!element) {
      return
    }
    this.selectElement(elementId)
    this.dragState = {
      isDragging: true,
      isResizing: false,
      dragStartPosition: position,
      elementStartBounds: {
        ...element.bounds,
      },
    }
    this.emit('element:moveStart', element.id, element.bounds)
  }

  /**
   * 开始调整元素大小
   * @param elementId 元素ID
   * @param position 调整起始位置
   * @param direction 调整方向（n, e, s, w, ne, se, sw, nw）
   */
  startResize(elementId: string, position: Position, direction: ResizeDirection) {
    const element = this.getElement(elementId)
    if (!element) {
      return
    }
    this.selectElement(elementId)
    this.dragState = {
      isDragging: false,
      isResizing: true,
      dragStartPosition: position,
      elementStartBounds: {
        ...element.bounds,
      },
      resizeDirection: direction,
    }
    this.emit('element:resizeStart', element.id, element.bounds)
  }

  /**
   * 结束调整大小操作
   */
  endResize() {
    const element = this.getSelectedElement()
    if (!element) {
      return
    }
    this.emit('element:resizeEnd', element.id, element.bounds)
  }

  /**
   * 更新拖拽/调整位置
   * @param currentPosition 当前位置
   * @param scale 画布缩放比例
   */
  updateDrag(currentPosition: Position, scale: number = 1) {
    const element = this.getSelectedElement()
    if (!element) {
      return
    }

    if (!this.dragState.isDragging && !this.dragState.isResizing) {
      return
    }

    const deltaX = (currentPosition.x - this.dragState.dragStartPosition!.x) * scale
    const deltaY = (currentPosition.y - this.dragState.dragStartPosition!.y) * scale
    if (this.dragState.isResizing) {
      this.handleResizeMove(element, deltaX, deltaY)
    } else if (this.dragState.isDragging) {
      this.handleDragMove(element, deltaX, deltaY)
    }
  }

  /**
   * 处理拖拽移动
   * @param element 元素
   * @param deltaX X轴偏移量
   * @param deltaY Y轴偏移量
   */
  private handleDragMove(element: LayoutElement, deltaX: number, deltaY: number) {
    let newX = this.dragState.elementStartBounds!.x + deltaX
    let newY = this.dragState.elementStartBounds!.y + deltaY

    // 应用网格吸附
    if (this.canvasConfig.gridSize) {
      const snapped = this.gridManager.snapToGrid({ x: newX, y: newY })
      newX = snapped.x
      newY = snapped.y
    }

    // 应用元素吸附
    const otherElements = this.getAllElements().filter(e => e.id !== element.id)
    const snapResult = this.snapManager.getSnapPosition(
      { x: newX, y: newY, width: element.bounds.width, height: element.bounds.height },
      otherElements.map(e => e.bounds)
    )

    newX = snapResult.position.x
    newY = snapResult.position.y

    // 边界检查
    newX = Math.max(Math.min(newX, this.canvasConfig.width - element.bounds.width), 0)
    newY = Math.max(Math.min(newY, this.canvasConfig.height - element.bounds.height), 0)

    element.bounds.x = newX
    element.bounds.y = newY

    this.emit('element:move', element.id, element.bounds)
  }

  /**
   * 处理调整大小移动
   * @param element 元素
   * @param deltaX X轴偏移量
   * @param deltaY Y轴偏移量
   */
  private handleResizeMove(element: LayoutElement, deltaX: number, deltaY: number) {
    const direction = this.dragState.resizeDirection!
    const startBounds = this.dragState.elementStartBounds!
    const newBounds = { ...startBounds }
    switch (direction) {
      case 'e':
        newBounds.width = Math.max(this.minElementSize.width, startBounds.width + deltaX)
        break
      case 'w':
        newBounds.width = Math.max(this.minElementSize.width, startBounds.width - deltaX)
        newBounds.x = startBounds.x + (startBounds.width - newBounds.width)
        break
      case 's':
        newBounds.height = Math.max(this.minElementSize.height, startBounds.height + deltaY)
        break
      case 'n':
        newBounds.height = Math.max(this.minElementSize.height, startBounds.height - deltaY)
        newBounds.y = startBounds.y + (startBounds.height - newBounds.height)
        break
      case 'se':
        newBounds.width = Math.max(this.minElementSize.width, startBounds.width + deltaX)
        newBounds.height = Math.max(this.minElementSize.height, startBounds.height + deltaY)
        break
      case 'sw':
        newBounds.width = Math.max(this.minElementSize.width, startBounds.width - deltaX)
        newBounds.height = Math.max(this.minElementSize.height, startBounds.height + deltaY)
        newBounds.x = startBounds.x + (startBounds.width - newBounds.width)
        break
      case 'ne':
        newBounds.width = Math.max(this.minElementSize.width, startBounds.width + deltaX)
        newBounds.height = Math.max(this.minElementSize.height, startBounds.height - deltaY)
        newBounds.y = startBounds.y + (startBounds.height - newBounds.height)
        break
      case 'nw':
        newBounds.width = Math.max(this.minElementSize.width, startBounds.width - deltaX)
        newBounds.height = Math.max(this.minElementSize.height, startBounds.height - deltaY)
        newBounds.x = startBounds.x + (startBounds.width - newBounds.width)
        newBounds.y = startBounds.y + (startBounds.height - newBounds.height)
        break
    }

    // 边界检查
    newBounds.x = Math.max(Math.min(newBounds.x, this.canvasConfig.width - newBounds.width), 0)
    newBounds.y = Math.max(Math.min(newBounds.y, this.canvasConfig.height - newBounds.height), 0)

    element.bounds = newBounds
    this.emit('element:resize', element.id, element.bounds)
  }

  /**
   * 结束拖拽操作
   */
  endDrag() {
    this.dragState = {
      isDragging: false,
      isResizing: false,
      dragStartPosition: { x: 0, y: 0 },
      elementStartBounds: { x: 0, y: 0, width: 0, height: 0 },
    }

    this.snapManager.clearGuides()
    const selectedElement = this.getSelectedElement()
    if (!selectedElement) {
      return
    }

    const { id, bounds } = selectedElement

    if (id && bounds) {
      this.emit('element:moveEnd', id, bounds)
    }
  }

  // ==================== 画布操作 ====================

  /**
   * 处理画布拖放事件
   * @param position 拖放位置
   * @param data 拖放数据
   * @param scale 画布缩放比例
   */
  handleCanvasDrop(position: Position, data: any, scale: number = 1): void {
    const adjustedPosition = {
      x: position.x / scale,
      y: position.y / scale,
    }

    this.emit('canvas:drop', adjustedPosition, data)
  }

  /**
   * 获取当前吸附参考线
   * @returns 吸附参考线数组
   */
  getSnapGuides(): SnapGuide[] {
    return this.snapManager.getActiveGuides()
  }

  /**
   * 更新画布配置
   * @param config 画布配置
   */
  updateCanvasConfig(config: Partial<CanvasConfig>) {
    this.canvasConfig = { ...this.canvasConfig, ...config }
    if (config.gridSize) {
      this.gridManager.updateGridSize(config.gridSize)
    }
  }

  /**
   * 获取画布配置
   * @returns 画布配置
   */
  getCanvasConfig(): CanvasConfig {
    return { ...this.canvasConfig }
  }

  /**
   * 清空所有元素
   */
  clear() {
    this.elements.clear()
    this.selectedElementId = null
    this.endDrag()
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   */
  private emit<K extends keyof LayoutEngineEvents>(event: K, ...args: Parameters<LayoutEngineEvents[K]>) {
    const listener = this.eventListeners[event]
    if (listener) {
      ;(listener as any)(...(args as any))
    }
  }
}
