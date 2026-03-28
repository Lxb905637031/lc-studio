import './App.css'

import type { LayoutElement } from '@lc-studio/layout-engine'
import { LayoutCanvas, useLayoutEngine } from '@lc-studio/layout-engine'
import type { CSSProperties } from 'react'

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
  // {
  //   id: 'input',
  //   name: '输入框',
  //   type: 'Input',
  //   defaultWidth: 200,
  //   defaultHeight: 40,
  //   data: {
  //     text: '输入框',
  //     style: {
  //       fontSize: 14,
  //       textAlign: 'left' as const,
  //       color: '#000000',
  //       backgroundColor: '#ffffff'
  //     }
  //   }
  // },
  // {
  //   id: 'container',
  //   name: '容器',
  //   type: 'Container',
  //   defaultWidth: 300,
  //   defaultHeight: 200,
  //   data: {
  //     text: '容器',
  //     style: {
  //       fontSize: 14,
  //       textAlign: 'center' as const,
  //       color: '#000000',
  //       backgroundColor: '#f9f9f9'
  //     }
  //   }
  // },
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
    minElementSize: { width: 100, height: 100 },
  })

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
      selectElement(newElement.id)
    }
  })

  engine.on('element:resizeEnd', (elementId, bounds) => {
    updateElement(elementId, { ...bounds })
  })

  const renderElement = (element: LayoutElement) => {
    // return (
    //   <div key={element.id} style={elementStyle} onMouseDown={onMouseDown}>
    //     {element.type}
    //   </div>
    // )
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
                    updateElement(selectedElementId, { bounds: { ...element.bounds, x: parseFloat(e.target.value) || 0 } })
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
                    updateElement(selectedElementId, { bounds: { ...element.bounds, y: parseFloat(e.target.value) || 0 } })
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
                    updateElement(selectedElementId, { bounds: { ...element.bounds, width: parseFloat(e.target.value) || 0 } })
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
                    updateElement(selectedElementId, { bounds: { ...element.bounds, height: parseFloat(e.target.value) || 0 } })
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
                          updateElement(selectedElementId, {
                            data: {
                              ...element.data,
                              text: e.target.value,
                            },
                          })
                        }}
                      />
                    </div>
                    <div className="property-group">
                      <label>文字大小:</label>
                      <input
                        type="number"
                        value={element.data?.style?.fontSize || 14}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateElement(selectedElementId, {
                            data: {
                              ...element.data,
                              style: {
                                ...element.data?.style,
                                fontSize: parseInt(e.target.value) || 14,
                              },
                            },
                          })
                        }}
                      />
                    </div>
                    <div className="property-group">
                      <label>文字居中方式:</label>
                      <select
                        value={element.data?.style?.textAlign || 'center'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          updateElement(selectedElementId, {
                            data: {
                              ...element.data,
                              style: {
                                ...element.data?.style,
                                textAlign: e.target.value as 'left' | 'center' | 'right',
                              },
                            },
                          })
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
                          updateElement(selectedElementId, {
                            data: {
                              ...element.data,
                              style: {
                                ...element.data?.style,
                                color: e.target.value,
                              },
                            },
                          })
                        }}
                      />
                    </div>
                    <div className="property-group">
                      <label>背景颜色:</label>
                      <input
                        type="color"
                        value={element.data?.style?.backgroundColor || '#ffffff'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          updateElement(selectedElementId, {
                            data: {
                              ...element.data,
                              style: {
                                ...element.data?.style,
                                backgroundColor: e.target.value,
                              },
                            },
                          })
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
                          updateElement(selectedElementId, {
                            data: {
                              ...element.data,
                              imageUrl: e.target.value,
                            },
                          })
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
                                updateElement(selectedElementId, {
                                  data: {
                                    ...element.data,
                                    imageUrl,
                                  },
                                })
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
