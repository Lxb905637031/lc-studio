import type { Position } from '../types'

export interface GridManagerOptions {
  size: number
  show: boolean
}

export class GridManager {
  private gridSize: number
  private showGrid: boolean

  constructor(options: GridManagerOptions) {
    this.gridSize = options.size
    this.showGrid = options.show
  }

  /**
   * 将位置吸附到网格
   */
  snapToGrid(position: Position): Position {
    if (this.gridSize <= 0) {
      return position
    }
    return {
      x: Math.round(position.x / this.gridSize) * this.gridSize,
      y: Math.round(position.y / this.gridSize) * this.gridSize,
    }
  }

  /**
   * 绘制网格线到Canvas
   */
  drawGrid(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    if (!this.showGrid || this.gridSize <= 0) {
      return
    }
    ctx.save()
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()

    // 绘制垂直线
    for (let x = this.gridSize; x < canvasWidth; x += this.gridSize) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
    }
    // 绘制水平线
    for (let y = this.gridSize; y < canvasHeight; y += this.gridSize) {
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
    }
    ctx.stroke()
    ctx.restore()
  }

  /**
   * 生成网格CSS背景
   */
  getGridBackground(): string {
    if (!this.showGrid || this.gridSize <= 0) {
      return ''
    }
    return `
       linear-gradient(to right, rgba(0, 27, 135, 0.3) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 27, 135, 0.3) 1px, transparent 1px)
    `
  }

  /**
   * 获取网格背景样式对象
   */
  getGridBackgroundStyle(): Record<string, string> {
    return {
      backgroundImage: this.getGridBackground(),
      backgroundSize: `${this.gridSize}px ${this.gridSize}px`,
      backgroundPosition: '0 0',
    }
  }

  /**
   * 更新网格大小
   */
  updateGridSize(size: number): void {
    this.gridSize = Math.max(0, size)
  }

  /**
   * 切换网格显示
   */
  toggleGrid(show: boolean): void {
    this.showGrid = show
  }

  /**
   * 获取网格大小
   */
  getGridSize(): number {
    return this.gridSize
  }

  /**
   * 获取网格显示状态
   */
  isGridVisible(): boolean {
    return this.showGrid
  }

  /**
   * 计算最近的网格位置
   */
  getNearestGridPosition(position: Position): Position {
    if (this.gridSize <= 0) {
      return position
    }
    return {
      x: Math.round(position.x / this.gridSize) * this.gridSize,
      y: Math.round(position.y / this.gridSize) * this.gridSize,
    }
  }

  /**
   * 检查位置是否在网格点上
   */
  isOnGrid(position: Position, tolerance: number = 1): boolean {
    if (this.gridSize <= 0) {
      return false
    }
    const gridPosition = this.getNearestGridPosition(position)
    const distance = Math.sqrt(Math.pow(position.x - gridPosition.x, 2) + Math.pow(position.y - gridPosition.y, 2))
    return distance <= tolerance
  }
}
