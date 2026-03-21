import React, { useEffect, useMemo, useRef } from 'react'

import { GridManager } from '../core/GridManager'
import type { CanvasConfig, LayoutElement, ResizeDirection } from '../types'

/**
 * 布局画布属性接口
 */
interface LayoutCanvasProps {
  /** 元素列表 */
  elements: LayoutElement[]
  /** 当前选中的元素ID */
  selectedElementId: string | null
  /** 画布配置 */
  canvasConfig: CanvasConfig
  /** 画布缩放比例 */
  scale?: number
  /** 是否可滚动 */
  scrollable?: boolean
  /** 吸附参考线列表 */
  snapGuides?: {
    type: 'horizontal' | 'vertical'
    position: number
  }[]
  /** 是否显示网格 */
  showGrid?: boolean
  /** 是否显示吸附参考线 */
  showSnapGuides?: boolean
  /** 画布拖拽经过事件回调 */
  canvasDragOver?: (e: DragEvent) => void
  /** 画布拖放事件回调 */
  canvasDrop?: (e: DragEvent) => void
  /** 画布滚轮事件回调 */
  canvasWheel?: (e: WheelEvent) => void
  /** 元素拖拽开始事件回调 */
  dragStart?: (id: string, e: MouseEvent) => void
  /** 元素调整大小开始事件回调 */
  resizeStart?: (id: string, direction: ResizeDirection, e: MouseEvent) => void
  /** 元素调整大小结束事件回调 */
  resizeEnd?: (id: string, direction: ResizeDirection, e: MouseEvent) => void
}

/**
 * 布局画布组件
 * 负责渲染画布、网格、吸附参考线以及可拖拽/调整大小的元素
 */
const LayoutCanvas: React.FC<LayoutCanvasProps> = ({
  elements,
  selectedElementId,
  canvasConfig,
  scale = 1,
  snapGuides = [],
  showGrid = false,
  showSnapGuides = false,
  scrollable = true,
  canvasDragOver,
  canvasDrop,
  canvasWheel,
  dragStart,
  resizeStart,
  resizeEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  const girdManager = new GridManager({
    size: canvasConfig.gridSize || 20,
    show: showGrid,
  })

  /**
   * 处理滚轮事件
   */
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    canvasWheel?.(e as unknown as WheelEvent)
  }

  /**
   * 处理拖拽经过事件
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
    canvasDragOver?.(e as unknown as DragEvent)
  }

  /**
   * 处理拖放事件
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    canvasDrop?.(e as unknown as DragEvent)
  }

  /**
   * 处理元素拖拽开始事件
   */
  const handleElementDragStart = (e: React.MouseEvent, element: LayoutElement) => {
    e.preventDefault()
    dragStart?.(element.id, e as unknown as MouseEvent)
  }

  /**
   * 处理调整大小开始事件
   */
  const handleResizeStart = (e: React.MouseEvent, element: LayoutElement, direction: ResizeDirection) => {
    e.preventDefault()
    resizeStart?.(element.id, direction, e as unknown as MouseEvent)
  }

  /**
   * 处理调整大小结束事件
   */
  const handleResizeEnd = (e: React.MouseEvent, element: LayoutElement, direction: ResizeDirection) => {
    e.preventDefault()
    resizeEnd?.(element.id, direction, e as unknown as MouseEvent)
  }

  /**
   * 绘制网格
   */
  const drawGrid = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    canvas.width = canvasConfig.width
    canvas.height = canvasConfig.height
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (showGrid) {
      girdManager.drawGrid(ctx, canvas.width, canvas.height)
    }
  }

  useEffect(() => {
    drawGrid()
  }, [])

  useEffect(() => {
    girdManager.updateGridSize(canvasConfig.gridSize || 20)
    girdManager.toggleGrid(showGrid)
    drawGrid()
  }, [canvasConfig, showGrid])

  const canvasStyle = useMemo(
    () => ({
      width: `${canvasConfig.width}px`,
      height: `${canvasConfig.height}px`,
      transform: `scale(${scale})`,
      transformOrigin: '0 0',
      backgroundColor: canvasConfig.backgroundColor || '#f0f0f0',
      ...girdManager.getGridBackgroundStyle(),
    }),
    [canvasConfig.width, canvasConfig.height, scale, canvasConfig.backgroundColor, showGrid]
  )

  const containerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    overflow: scrollable ? ('auto' as const) : ('hidden' as const),
  }

  const canvasWrapperStyle = {
    position: 'relative' as const,
    borderRadius: '4px' as const,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' as const,
  }

  return (
    <div ref={canvasContainerRef} style={containerStyle} onWheel={handleWheel} onDragOver={handleDragOver} onDrop={handleDrop}>
      <div style={canvasWrapperStyle}>
        <canvas ref={canvasRef} style={canvasStyle} />
        {showSnapGuides && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            {snapGuides.map((guide, index) => {
              const style =
                guide.type === 'horizontal'
                  ? { width: '100%', height: '1px', left: 0, top: `${guide.position}px` }
                  : { width: '1px', height: '100%', left: `${guide.position}px`, top: 0 }
              const guideStyle = {
                position: 'absolute' as const,
                backgroundColor: '#a855f7',
                zIndex: 1001,
                ...style,
              }
              return <div key={index} style={guideStyle} />
            })}
          </div>
        )}
        {/* 物料元素 */}
        {elements.map(element => {
          const isSelected = element.id === selectedElementId
          const elementStyle = {
            width: `${element.bounds.width}px`,
            height: `${element.bounds.height}px`,
            transform: `translate(${element.bounds.x}px, ${element.bounds.y}px)`,
            ...(isSelected ? { boxShadow: '0 0 0 2px rgba(99,102,241,0.2)' } : {}),
          }

          const onMouseDown = (e: React.MouseEvent) => handleElementDragStart(e, element)
          return (
            <div key={element.id} style={elementStyle} onMouseDown={onMouseDown}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4b5563',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb',
                }}
              >
                {element.type}
              </div>
              {isSelected && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#6366f1',
                      border: '1px solid white',
                      borderRadius: '50%',
                      zIndex: 1002,
                      top: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 'n-resize',
                    }}
                    onMouseDown={e => handleResizeStart(e, element, 'n')}
                    onMouseUp={e => handleResizeEnd(e, element, 'n')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#6366f1',
                      border: '1px solid white',
                      borderRadius: '50%',
                      zIndex: 1002,
                      top: '50%',
                      right: '-4px',
                      transform: 'translateY(-50%)',
                      cursor: 'e-resize',
                    }}
                    onMouseDown={e => handleResizeStart(e, element, 'e')}
                    onMouseUp={e => handleResizeEnd(e, element, 'e')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#6366f1',
                      border: '1px solid white',
                      borderRadius: '50%',
                      zIndex: 1002,
                      bottom: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 's-resize',
                    }}
                    onMouseDown={e => handleResizeStart(e, element, 's')}
                    onMouseUp={e => handleResizeEnd(e, element, 's')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#6366f1',
                      border: '1px solid white',
                      borderRadius: '50%',
                      zIndex: 1002,
                      top: '50%',
                      left: '-4px',
                      transform: 'translateY(-50%)',
                      cursor: 'w-resize',
                    }}
                    onMouseDown={e => handleResizeStart(e, element, 'w')}
                    onMouseUp={e => handleResizeEnd(e, element, 'w')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#6366f1',
                      border: '1px solid white',
                      borderRadius: '50%',
                      zIndex: 1002,
                      bottom: '-4px',
                      right: '-4px',
                      cursor: 'se-resize',
                    }}
                    onMouseDown={e => handleResizeStart(e, element, 'se')}
                    onMouseUp={e => handleResizeEnd(e, element, 'se')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#6366f1',
                      border: '1px solid white',
                      borderRadius: '50%',
                      zIndex: 1002,
                      left: '-4px',
                      bottom: '-4px',
                      cursor: 'sw-resize',
                    }}
                    onMouseDown={e => handleResizeStart(e, element, 'sw')}
                    onMouseUp={e => handleResizeEnd(e, element, 'sw')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#6366f1',
                      border: '1px solid white',
                      borderRadius: '50%',
                      zIndex: 1002,
                      left: '-4px',
                      top: '-4px',
                      cursor: 'nw-resize',
                    }}
                    onMouseDown={e => handleResizeStart(e, element, 'nw')}
                    onMouseUp={e => handleResizeEnd(e, element, 'nw')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#6366f1',
                      border: '1px solid white',
                      borderRadius: '50%',
                      zIndex: 1002,
                      top: '-4px',
                      right: '-4px',
                      cursor: 'ne-resize',
                    }}
                    onMouseDown={e => handleResizeStart(e, element, 'ne')}
                    onMouseUp={e => handleResizeEnd(e, element, 'ne')}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LayoutCanvas
