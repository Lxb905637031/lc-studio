import './App.css'

import { useHistoryManager } from '@lc-studio/editor-history'
import type { Bounds, LayoutElement } from '@lc-studio/layout-engine'
import { LayoutCanvas, useLayoutEngine } from '@lc-studio/layout-engine'
import type { CSSProperties } from 'react'
import { useState } from 'react'

// 定义元素数据类型
interface ElementData {
  text?: string
  imageUrl?: string
  style?: CSSProperties
}

interface Material {
  id: string
  name: string
  type: string
  defaultWidth: number
  defaultHeight: number
  data?: ElementData
}

const materials: Material[] = [
  // 按钮
  {
    id: 'button',
    name: '普通按钮',
    type: 'Button',
    defaultWidth: 120,
    defaultHeight: 40,
    data: {
      text: '普通按钮',
      style: {
        fontSize: 14,
        textAlign: 'center' as const,
        color: '#000000',
        backgroundColor: '#f0f0f0',
      },
    },
  },

  // 图片
  {
    id: 'image-upload',
    name: '上传图片',
    type: 'ImageUpload',
    defaultWidth: 200,
    defaultHeight: 150,
    data: {
      imageUrl: '',
    },
  },

  // 其他基础元素
  {
    id: 'text',
    name: '文本',
    type: 'Text',
    defaultWidth: 200,
    defaultHeight: 50,
    data: {
      text: '文本内容',
      style: {
        fontSize: 16,
        textAlign: 'center' as const,
        color: '#000000',
        backgroundColor: '#ffffff',
      },
    },
  },
]

let elementIdCounter = 0
const generateElementId = () => `element-${Date.now()}-${elementIdCounter++}`

function App() {
  const {
    elements,
    selectedElementId,
    scale,
    snapGuides,
    canvasConfig,
    startDrag,
    startResize,
    endResize,
    handleCanvasDrop,
    handleCanvasWheel,
    engine,
    addElement,
    selectElement,
    updateElement,
    removeElement,
  } = useLayoutEngine({
    canvas: {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      gridSize: 0,
      showGrid: false,
      showGuides: true,
    },
    snapThreshold: 5,
    showSnapGuides: true,
    enableGridSnap: false,
    minElementSize: { width: 100, height: 40 },
  })

  // 初始化历史管理器
  const { canUndo, canRedo, recordAddElement, undo, redo, recordUpdateElement, recordDeleteElement } = useHistoryManager()

  const [startResizeBounds, setStartResizeBounds] = useState<null | Bounds>(null)
  const [startMoveBounds, setStartMoveBounds] = useState<null | Bounds>(null)

  engine.on('canvas:drop', (position, data) => {
    if (data && data.material) {
      const material = JSON.parse(data.material) as Material
      const newElement = {
        id: generateElementId(),
        type: material.type,
        bounds: {
          x: position.x - material.defaultWidth / 2,
          y: position.y - material.defaultHeight / 2,
          width: material.defaultWidth,
          height: material.defaultHeight,
        },
        data: material.data || {
          text: material.name,
          style: {
            fontSize: 14,
            textAlign: 'center' as const,
            color: '#000000',
            backgroundColor: '#ffffff',
          },
          imageUrl: '',
        },
      }
      addElement(newElement)
      recordAddElement(newElement.id, newElement)
      selectElement(newElement.id)
    }
  })

  // 监听移动开始事件
  engine.on('element:moveStart', (_, bounds) => {
    setStartMoveBounds({ ...bounds })
  })

  // 监听移动事件
  engine.on('element:move', (elementId, bounds) => {
    const element = elements.find(e => e.id === elementId)
    if (element && startMoveBounds) {
      const before = { ...element, bounds: { ...startMoveBounds } }
      const after = { ...element, bounds: { ...bounds } }
      recordUpdateElement(elementId, before, after)
    }
    setStartMoveBounds(null)
  })

  // 监听调整大小开始事件
  engine.on('element:resizeStart', (_, bounds) => {
    setStartResizeBounds(bounds)
  })

  // 监听调整大小结束事件
  engine.on('element:resizeEnd', (elementId, bounds) => {
    updateElement(elementId, { ...bounds })
    const element = elements.find(e => e.id === elementId)
    if (element) {
      recordUpdateElement(elementId, { ...element, bounds: startResizeBounds }, { ...element, bounds })
    }
    setStartResizeBounds(null)
  })

  const renderElement = (element: LayoutElement) => {
    const { type, bounds, data } = element
    const { text, style, imageUrl } = data || {}
    switch (type) {
      case 'Button':
      case 'Text':
        return (
          <div
            key={element.id}
            style={{
              ...style,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: style?.textAlign === 'left' ? 'flex-start' : style?.textAlign === 'right' ? 'flex-end' : 'center',
            }}
          >
            {text}
          </div>
        )
      case 'ImageUpload':
        return (
          <div
            key={element.id}
            style={{
              ...style,
              width: bounds.width,
              height: bounds.height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {imageUrl ? <img src={imageUrl} alt="上传图片" style={{ width: '100%', height: '100%' }} /> : <div>请在属性中上传图片</div>}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="lc-editor">
      <div className="materials-panel">
        <h3>物料库</h3>
        <div className="materials-list">
          {materials.map(material => (
            <div
              key={material.id}
              className="material-item"
              draggable
              onDragStart={e => {
                e.dataTransfer.setData('material', JSON.stringify(material))
                e.dataTransfer.effectAllowed = 'copy'
              }}
            >
              {material.name}
            </div>
          ))}
        </div>
      </div>

      <div className="editor-panel">
        <div className="editor-header">
          <h3>编辑区</h3>
          <div className="editor-controls">
            <button
              onClick={() => {
                const entry = undo()
                if (entry) {
                  // 根据操作类型执行相应的撤销操作
                  switch (entry.action) {
                    case 'add':
                      // 撤销添加元素操作，删除元素
                      if (entry.elementId) {
                        removeElement(entry.elementId)
                        selectElement(null)
                      }
                      break
                    case 'update':
                      // 撤销更新元素操作，恢复到之前的状态
                      if (entry.elementId && entry.before) {
                        // 只更新变化的部分
                        updateElement(entry.elementId, entry.before)
                      }
                      break
                    case 'delete':
                      // 撤销删除元素操作，恢复元素
                      if (entry.elementId && entry.before) {
                        addElement(entry.before)
                        selectElement(entry.elementId)
                      }
                      break
                  }
                }
              }}
              disabled={!canUndo}
            >
              撤销
            </button>
            <button
              onClick={() => {
                const entry = redo()
                if (entry) {
                  // 根据操作类型执行相应的重做操作ß
                  switch (entry.action) {
                    case 'update':
                      // 重做更新元素操作，恢复到之后的状态
                      if (entry.elementId && entry.after) {
                        updateElement(entry.elementId, { bounds: entry.after })
                      }
                      break
                    case 'add':
                      // 重做添加元素操作，添加元素
                      if (entry.elementId && entry.after) {
                        addElement(entry.after)
                        selectElement(entry.elementId)
                      }
                      break
                    case 'delete':
                      // 重做删除元素操作，删除元素
                      if (entry.elementId) {
                        removeElement(entry.elementId)
                        selectElement(null)
                      }
                      break
                  }
                }
              }}
              disabled={!canRedo}
            >
              重做
            </button>
            <button
              onClick={() => {
                if (selectedElementId) {
                  const element = elements.find(e => e.id === selectedElementId)
                  if (element) {
                    recordDeleteElement(selectedElementId, element)
                    removeElement(selectedElementId)
                    selectElement(null)
                  }
                }
              }}
              disabled={!selectedElementId}
            >
              删除元素
            </button>
          </div>
        </div>
        <div className="canvas-container">
          <LayoutCanvas
            elements={elements}
            selectedElementId={selectedElementId}
            canvasConfig={canvasConfig}
            scale={scale}
            showGrid={true}
            showSnapGuides={true}
            snapGuides={snapGuides}
            canvasDrop={handleCanvasDrop}
            dragStart={startDrag}
            resizeStart={startResize}
            resizeEnd={endResize}
            canvasWheel={handleCanvasWheel}
            renderElement={renderElement}
          />
        </div>
      </div>

      <div className="properties-panel">
        <h3>属性</h3>
        {selectedElementId ? (
          <div className="element-properties">
            <h4>元素属性</h4>
            <div className="property-group">
              <label>位置 X:</label>
              <input
                type="number"
                value={elements.find(e => e.id === selectedElementId)?.bounds.x || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const element = elements.find(el => el.id === selectedElementId)
                  if (element) {
                    const before = { ...element }
                    const after = {
                      ...element,
                      bounds: { ...element.bounds, x: parseFloat(e.target.value) || 0 },
                    }
                    updateElement(selectedElementId, { bounds: after.bounds })
                    recordUpdateElement(selectedElementId, before, after)
                  }
                }}
              />
            </div>
            <div className="property-group">
              <label>位置 Y:</label>
              <input
                type="number"
                value={elements.find(e => e.id === selectedElementId)?.bounds.y || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const element = elements.find(el => el.id === selectedElementId)
                  if (element) {
                    const before = { ...element }
                    const after = {
                      ...element,
                      bounds: { ...element.bounds, y: parseFloat(e.target.value) || 0 },
                    }
                    updateElement(selectedElementId, { bounds: after.bounds })
                    recordUpdateElement(selectedElementId, before, after)
                  }
                }}
              />
            </div>
            <div className="property-group">
              <label>宽度:</label>
              <input
                type="number"
                value={elements.find(e => e.id === selectedElementId)?.bounds.width || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const element = elements.find(el => el.id === selectedElementId)
                  if (element) {
                    const before = { ...element }
                    const after = {
                      ...element,
                      bounds: { ...element.bounds, width: parseFloat(e.target.value) || 0 },
                    }
                    updateElement(selectedElementId, { bounds: after.bounds })
                    recordUpdateElement(selectedElementId, before, after)
                  }
                }}
              />
            </div>
            <div className="property-group">
              <label>高度:</label>
              <input
                type="number"
                value={elements.find(e => e.id === selectedElementId)?.bounds.height || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const element = elements.find(el => el.id === selectedElementId)
                  if (element) {
                    const before = { ...element }
                    const after = {
                      ...element,
                      bounds: { ...element.bounds, height: parseFloat(e.target.value) || 0 },
                    }
                    updateElement(selectedElementId, { bounds: after.bounds })
                    recordUpdateElement(selectedElementId, before, after)
                  }
                }}
              />
            </div>
            <h4>其他属性</h4>

            {/* 根据元素类型显示不同的属性 */}
            {(() => {
              const element = elements.find(e => e.id === selectedElementId)
              if (!element) return null

              // 非图片类型：显示文字相关属性
              if (!element.type?.includes('Image')) {
                return (
                  <>
                    <div className="property-group">
                      <label>文字文案:</label>
                      <input
                        type="text"
                        value={element.data?.text || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const before = { ...element }
                          const after = {
                            ...element,
                            data: {
                              ...element.data,
                              text: e.target.value,
                            },
                          }
                          updateElement(selectedElementId, {
                            data: after.data,
                          })
                          recordUpdateElement(selectedElementId, before, after)
                        }}
                      />
                    </div>
                    <div className="property-group">
                      <label>文字大小:</label>
                      <input
                        type="number"
                        value={element.data?.style?.fontSize || 14}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const before = { ...element }
                          const after = {
                            ...element,
                            data: {
                              ...element.data,
                              style: {
                                ...element.data?.style,
                                fontSize: parseInt(e.target.value) || 14,
                              },
                            },
                          }
                          updateElement(selectedElementId, {
                            data: after.data,
                          })
                          recordUpdateElement(selectedElementId, before, after)
                        }}
                      />
                    </div>
                    <div className="property-group">
                      <label>文字居中方式:</label>
                      <select
                        value={element.data?.style?.textAlign || 'center'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const before = { ...element }
                          const after = {
                            ...element,
                            data: {
                              ...element.data,
                              style: {
                                ...element.data?.style,
                                textAlign: e.target.value as 'left' | 'center' | 'right',
                              },
                            },
                          }
                          updateElement(selectedElementId, {
                            data: after.data,
                          })
                          recordUpdateElement(selectedElementId, before, after)
                        }}
                      >
                        <option value="left">左对齐</option>
                        <option value="center">居中</option>
                        <option value="right">右对齐</option>
                      </select>
                    </div>
                    <div className="property-group">
                      <label>文字颜色:</label>
                      <input
                        type="color"
                        value={element.data?.style?.color || '#000000'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const before = { ...element }
                          const after = {
                            ...element,
                            data: {
                              ...element.data,
                              style: {
                                ...element.data?.style,
                                color: e.target.value,
                              },
                            },
                          }
                          updateElement(selectedElementId, {
                            data: after.data,
                          })
                          recordUpdateElement(selectedElementId, before, after)
                        }}
                      />
                    </div>
                    <div className="property-group">
                      <label>背景颜色:</label>
                      <input
                        type="color"
                        value={element.data?.style?.backgroundColor || '#ffffff'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const before = { ...element }
                          const after = {
                            ...element,
                            data: {
                              ...element.data,
                              style: {
                                ...element.data?.style,
                                backgroundColor: e.target.value,
                              },
                            },
                          }
                          updateElement(selectedElementId, {
                            data: after.data,
                          })
                          recordUpdateElement(selectedElementId, before, after)
                        }}
                      />
                    </div>
                  </>
                )
              }

              // 图片类型：显示图片相关属性
              if (element.type?.includes('Image')) {
                return (
                  <>
                    <div className="property-group">
                      <label>图片地址:</label>
                      <input
                        type="text"
                        value={element.data?.imageUrl || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const before = { ...element }
                          const after = {
                            ...element,
                            data: {
                              ...element.data,
                              imageUrl: e.target.value,
                            },
                          }
                          updateElement(selectedElementId, {
                            data: after.data,
                          })
                          recordUpdateElement(selectedElementId, before, after)
                        }}
                      />
                    </div>
                    <div className="property-group">
                      <label>上传图片:</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = event => {
                                const imageUrl = event.target?.result as string
                                const before = { ...element }
                                const after = {
                                  ...element,
                                  data: {
                                    ...element.data,
                                    imageUrl,
                                  },
                                }
                                updateElement(selectedElementId, {
                                  data: after.data,
                                })
                                recordUpdateElement(selectedElementId, before, after)
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '40px',
                            border: '1px dashed #e0e0e0',
                            borderRadius: '4px',
                            backgroundColor: '#f9f9f9',
                            cursor: 'pointer',
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ color: '#666' }}
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        </div>
                      </div>
                    </div>
                    {element.data?.imageUrl && (
                      <div className="property-group">
                        <label>图片预览:</label>
                        <div
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            padding: '8px',
                            textAlign: 'center',
                          }}
                        >
                          <img
                            src={element.data.imageUrl}
                            alt="预览"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100px',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )
              }

              return null
            })()}
          </div>
        ) : (
          <div className="no-selection">
            <p>请选择一个元素</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
