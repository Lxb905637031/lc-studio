import { useEffect, useMemo, useState } from 'react'

import { LayoutEngine } from '../core/LayoutEngine'
import type { CanvasConfig, LayoutElement, LayoutEngineOptions, Position, ResizeDirection, SnapGuide } from '../types'

export interface UseLayoutEngineOptions extends LayoutEngineOptions {
  autoSetupEventListeners?: boolean
}

export interface UseLayoutEngineReturn {
  // 核心引擎实例
  engine: LayoutEngine

  // 响应式状态
  elements: LayoutElement[]
  selectedElement: LayoutElement | null
  selectedElementId: string | null
  snapGuides: SnapGuide[]
  canvasConfig: CanvasConfig

  // 拖拽状态
  isDragging: boolean
  isResizing: boolean

  // 缩放相关
  scale: number

  // 方法
  addElement: (element: LayoutElement) => void
  removeElement: (elementId: string) => void
  selectElement: (elementId: string | null) => void
  deselectElement: () => void
  updateElement: (elementId: string, updates: Partial<LayoutElement>) => void

  // 拖拽方法
  startDrag: (elementId: string, event: MouseEvent) => void
  startResize: (elementId: string, event: MouseEvent, direction: ResizeDirection) => void
  endResize: () => void

  // 画布方法
  handleCanvasDrop: (event: DragEvent) => void
  handleCanvasWheel: (event: WheelEvent) => void

  // 工具方法
  getCanvasStyle: () => Record<string, string>
  getElementStyle: (element: LayoutElement) => Record<string, string>
  clear: () => void
}

export function useLayoutEngine(options: UseLayoutEngineOptions): UseLayoutEngineReturn {
  // 创建引擎实例
  const engine = new LayoutEngine(options)

  // 响应式状态
  const [elements, setElements] = useState<LayoutElement[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([])
  const [canvasConfig] = useState<CanvasConfig>(options.canvas)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isResizing, setIsResizing] = useState<boolean>(false)
  const [scale, setScale] = useState<number>(1)

  const selectedElement = useMemo(() => {
    return elements.find((element: LayoutElement) => element.id === selectedElementId!) || null
  }, [elements, selectedElementId])

  // 事件处理状态
  let dragStartPosition: Position = {
    x: 0,
    y: 0,
  }

  useEffect(() => {
    if (options.autoSetupEventListeners) {
      setupEventListeners()
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('wheel', handleCanvasWheel)
    document.addEventListener('mouseleave', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('wheel', handleCanvasWheel)
      document.removeEventListener('mouseleave', handleGlobalMouseUp)
    }
  }, [options.autoSetupEventListeners])

  function setupEventListeners() {
    engine.on('element:add', () => {
      setElements(engine.getAllElements())
    })

    engine.on('element:remove', () => {
      setElements(engine.getAllElements())
    })

    engine.on('element:select', (elementId: string | null) => {
      setSelectedElementId(elementId)
    })

    engine.on('element:move', () => {
      setElements(engine.getAllElements())
      setSnapGuides(engine.getSnapGuides())
    })

    engine.on('element:resize', () => {
      setElements(engine.getAllElements())
    })
  }

  // 全局鼠标事件处理
  function handleGlobalMouseMove(event: MouseEvent) {
    if (!isDragging || !isResizing) {
      engine.updateDrag(
        {
          x: event.clientX,
          y: event.clientY,
        },
        scale
      )
    }
  }

  // 全局鼠标事件处理
  function handleGlobalMouseUp() {
    if (!isDragging || !isResizing) {
      engine.endDrag()
      setIsDragging(false)
      setIsResizing(false)
      setSnapGuides([])
    }
  }

  // 方法实现
  function addElement(element: LayoutElement) {
    engine.addElement(element)
  }

  function removeElement(elementId: string) {
    engine.removeElement(elementId)
  }

  function selectElement(elementId: string | null) {
    engine.selectElement(elementId)
  }

  function deselectElement() {
    engine.deselectElement()
  }

  function updateElement(elementId: string, updates: Partial<LayoutElement>) {
    const element = engine.getElement(elementId)
    if (element) {
      Object.assign(element, updates)
      setElements(engine.getAllElements())
    }
  }

  function startDrag(elementId: string, event: MouseEvent) {
    if (event.target instanceof HTMLElement && event.target.classList.contains('resize-handle')) {
      return
    }
    dragStartPosition = {
      x: event.clientX,
      y: event.clientY,
    }
    engine.startDrag(elementId, dragStartPosition)
    setIsDragging(true)
  }

  function startResize(elementId: string, event: MouseEvent, direction: ResizeDirection) {
    event.stopPropagation()
    dragStartPosition = {
      x: event.clientX,
      y: event.clientY,
    }
    engine.startResize(elementId, dragStartPosition, direction)
    setIsResizing(true)
  }

  function endResize() {
    const element = engine.getElement(selectedElementId!)
    if (element) {
      engine.endResize()
    }
    setIsResizing(false)
  }

  function handleCanvasDrop(event: DragEvent) {
    event.preventDefault()
    if (!event.dataTransfer) {
      return
    }
    const canvasRect = (event.target as HTMLElement).getBoundingClientRect()
    const position = {
      x: event.clientX - canvasRect.left,
      y: event.clientY - canvasRect.top,
    }

    const entries = Object.fromEntries(event.dataTransfer.types.map((type: string) => [type, event.dataTransfer!.getData(type)]))
    const data = {
      type: event.dataTransfer.getData('text/plain') || event.dataTransfer.getData('char-type'),
      ...entries,
    }

    engine.handleCanvasDrop(position, data, scale)
  }

  function handleCanvasWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      const delta = event.deltaY < 0 ? 0.1 : -0.1
      const newScale = Math.max(0.1, Math.min(2, scale + delta))
      setScale(Number(newScale.toFixed(2)))
    }
  }

  function getCanvasStyle(): Record<string, string> {
    return {
      width: `${canvasConfig.width}px`,
      height: `${canvasConfig.height}px`,
      transform: `scale(${scale})`,
      transformOrigin: '0 0',
      backgroundColor: canvasConfig.backgroundColor || '#ffffff',
    }
  }

  function getElementStyle(element: LayoutElement): Record<string, string> {
    return {
      width: `${element.bounds.width}px`,
      height: `${element.bounds.height}px`,
      transform: `translate(${element.bounds.x}px, ${element.bounds.y}px)`,
      position: 'absolute',
    }
  }

  function clear() {
    engine.clear()
    setElements([])
    setSelectedElementId(null)
    setSnapGuides([])
    setIsDragging(false)
    setIsResizing(false)
  }

  return {
    engine,
    elements,
    selectedElementId,
    selectedElement,
    snapGuides,
    canvasConfig,
    isDragging,
    isResizing,
    scale,
    addElement,
    removeElement,
    selectElement,
    deselectElement,
    updateElement,
    startDrag,
    startResize,
    endResize,
    handleCanvasDrop,
    handleCanvasWheel,
    getCanvasStyle,
    getElementStyle,
    clear,
  }
}
