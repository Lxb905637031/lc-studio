import type { Bounds, Position, SnapGuide } from '../types'

export interface SnapManagerOptions {
  /** 吸附阈值 */
  threshold: number
  /** 是否显示吸附辅助线（可选） */
  showGuides?: boolean
}

export interface SnapResult {
  /** 是否发生了吸附 */
  snapped: boolean
  /** 吸附后的位置 */
  position: Position
  /** 吸附辅助线列表 */
  guides: SnapGuide[]
}

export class SnapManager {
  private threshold: number
  private showGuides: boolean
  private activeGuides: SnapGuide[] = []

  constructor(options: SnapManagerOptions) {
    this.threshold = options.threshold
    this.showGuides = options.showGuides ?? true
  }

  /**
   * 获取元素吸附位置
   */
  getSnapPosition(elementBounds: Bounds, otherElements: Bounds[]): SnapResult {
    const guides: SnapGuide[] = []
    let snappedX = elementBounds.x
    let snappedY = elementBounds.y
    let snapped = false

    // 计算元素的关键点
    const elementPoints = this.getElementPoints(elementBounds)

    // 检查与其他元素的吸附
    for (const other of otherElements) {
      const otherPoints = this.getElementPoints(other)
      // 检查水平方向的吸附
      const horizontalSnap = this.checkHorizontalSnap(elementPoints, otherPoints)
      if (horizontalSnap.snapped) {
        snappedX = horizontalSnap.position
        snapped = true
        if (this.showGuides) {
          guides.push({
            type: 'vertical',
            position: horizontalSnap.guideLine,
            elements: [],
          })
        }
      }

      // 检查垂直方向的吸附
      const verticalSnap = this.checkVerticalSnap(elementPoints, otherPoints)
      if (verticalSnap.snapped) {
        snappedY = verticalSnap.position
        snapped = true
        if (this.showGuides) {
          guides.push({
            type: 'horizontal',
            position: verticalSnap.guideLine,
            elements: [],
          })
        }
      }
    }

    this.activeGuides = guides

    return {
      snapped,
      position: { x: snappedX, y: snappedY },
      guides,
    }
  }

  /**
   * 获取当前活跃的参考线
   */
  getActiveGuides(): SnapGuide[] {
    return [...this.activeGuides]
  }

  /**
   * 清除当前活跃的参考线
   */
  clearGuides() {
    this.activeGuides = []
  }

  /**
   * 更新吸附阈值
   */
  updateThreshold(threshold: number) {
    this.threshold = threshold
  }

  /**
   * 切换参考线显示状态
   */
  toggleGuides(show: boolean) {
    this.showGuides = show
    if (!show) {
      this.clearGuides()
    }
  }

  /**
   * 获取元素的关键点
   */
  private getElementPoints(elementBounds: Bounds) {
    const { x, y, width, height } = elementBounds
    return {
      left: x,
      right: x + width,
      top: y,
      bottom: y + height,
      centerX: x + width / 2,
      centerY: y + height / 2,
    }
  }

  /**
   * 检查水平方向的吸附
   */
  private checkHorizontalSnap(
    elementPoints: ReturnType<typeof this.getElementPoints>,
    otherPoints: ReturnType<typeof this.getElementPoints>
  ) {
    const snapTargets = [
      {
        element: elementPoints.left,
        other: otherPoints.left,
        offset: 0,
      },
      {
        element: elementPoints.left,
        other: otherPoints.right,
        offset: 0,
      },
      {
        element: elementPoints.centerX,
        other: otherPoints.centerX,
        offset: 0,
      },
      {
        element: elementPoints.right,
        other: otherPoints.left,
        offset: -elementPoints.right + elementPoints.left,
      },
      {
        element: elementPoints.right,
        other: otherPoints.right,
        offset: -elementPoints.right + elementPoints.left,
      },
    ]

    for (const target of snapTargets) {
      const distance = Math.abs(target.element - target.other)

      if (distance <= this.threshold) {
        return {
          snapped: true,
          position: target.other + target.offset,
          guideLine: target.other,
        }
      }
    }

    return {
      snapped: false,
      position: elementPoints.left,
      guideLine: 0,
    }
  }

  /**
   * 检查垂直方向的吸附
   */
  private checkVerticalSnap(
    elementPoints: ReturnType<typeof this.getElementPoints>,
    otherPoints: ReturnType<typeof this.getElementPoints>
  ) {
    const snapTargets = [
      {
        element: elementPoints.top,
        other: otherPoints.top,
        offset: 0,
      },
      {
        element: elementPoints.top,
        other: otherPoints.bottom,
        offset: 0,
      },
      {
        element: elementPoints.centerY,
        other: otherPoints.centerY,
        offset: 0,
      },
      {
        element: elementPoints.bottom,
        other: otherPoints.top,
        offset: -elementPoints.bottom + elementPoints.top,
      },
      {
        element: elementPoints.bottom,
        other: otherPoints.bottom,
        offset: -elementPoints.bottom + elementPoints.top,
      },
    ]

    for (const target of snapTargets) {
      const distance = Math.abs(target.element - target.other)

      if (distance <= this.threshold) {
        return {
          snapped: true,
          position: target.other + target.offset,
          guideLine: target.other,
        }
      }
    }

    return {
      snapped: false,
      position: elementPoints.top,
      guideLine: 0,
    }
  }
}
