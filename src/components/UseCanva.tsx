import { MouseEvent, useCallback, useEffect, useRef, useState } from "react"
import styles from "../css/UseCanva.module.css"

enum ToolList {
  mouse = "Mouse",
  pencil = "Lapiz",
  eraser = "Goma de Borrar",
  line = "Linea",
  rect = "Rectangulo"
}

const btnStyle = "px-2 border rounded bg-cyan-500 hover:bg-cyan-600"

function UseCanva() {

  const canvaRef = useRef<HTMLCanvasElement>(null)
  const canvaGhostRef = useRef<HTMLCanvasElement>(null)

  const [toolSelected, setToolSelected] = useState<ToolList>(ToolList.mouse)
  const [clientHoldingFrom, setClientHoldingFrom] = useState({
    x: 0,
    y: 0
  })
  const [clientHolding, setClientHolding] = useState(false)
  const [canvaSettings, setCanvaSettings] = useState({
    size: 5,
    color: "#000",
    hover: false
  })

  const [clientPos, setClientPos] = useState({
    x: 0,
    y: 0
  })

  const [canvaXY, setCanvaXY] = useState({
    x: 0,
    y: 0
  })

  function getDrawMouse(): boolean {
    if (toolSelected === ToolList.mouse) return false
  
    return canvaSettings.hover
  }

  const drawPoint = useCallback((x: number, y: number, eraser: boolean = false) => {
    if (canvaRef.current) {
      const canva = canvaRef.current.getContext("2d") as CanvasRenderingContext2D
      const { size, color } = canvaSettings
      canva.fillStyle = eraser ? "#fff" : color
      canva.fillRect(x, y, size, size)
    }
  }, [canvaSettings])

  const drawLine = useCallback((x: number, y: number) => {
    if (canvaRef.current) {
      const canva = canvaRef.current.getContext("2d") as CanvasRenderingContext2D
      const { size, color } = canvaSettings

      canva.beginPath()
      canva.moveTo(clientHoldingFrom.x, clientHoldingFrom.y)
      canva.lineTo(x + size, y + size/2)
      canva.strokeStyle = color
      canva.lineWidth = size
      canva.stroke()
    }
  }, [canvaSettings, clientHoldingFrom])

  const drawRect = useCallback(() => {
    if (canvaRef.current) {
      const canva = canvaRef.current?.getContext("2d") as CanvasRenderingContext2D
      const { color } = canvaSettings
      
      canva.fillStyle = color

      const width = canvaXY.x - clientHoldingFrom.x
      const heigth = canvaXY.y - clientHoldingFrom.y

      canva.fillRect(clientHoldingFrom.x, clientHoldingFrom.y, width, heigth)
    }
  }, [canvaSettings, clientHoldingFrom, canvaXY])

  const drawGhostline = useCallback(() => {
    if (canvaGhostRef.current) {
      const canva = canvaGhostRef.current?.getContext("2d") as CanvasRenderingContext2D | any
      const { size, color } = canvaSettings
      canva.reset()

      canva.beginPath()
      canva.moveTo(clientHoldingFrom.x, clientHoldingFrom.y)
      canva.lineTo(canvaXY.x + size, canvaXY.y + size/2)
      canva.strokeStyle = color
      canva.lineWidth = size
      canva.stroke()
    }
  }, [canvaSettings, clientHoldingFrom, canvaXY])

  const drawGhostRect = useCallback(() => {
    if (canvaGhostRef.current) {
      const canva = canvaGhostRef.current?.getContext("2d") as CanvasRenderingContext2D | any
      const { color } = canvaSettings
      canva.reset()
      
      canva.fillStyle = color

      const width = canvaXY.x - clientHoldingFrom.x
      const heigth = canvaXY.y - clientHoldingFrom.y

      canva.fillRect(clientHoldingFrom.x, clientHoldingFrom.y, width, heigth)
    }
  }, [canvaSettings, clientHoldingFrom, canvaXY])

  function resetCanva() {
    if (canvaRef.current) {
      const canva = canvaRef.current.getContext("2d") as any
      canva.reset()
    }
  }

  function resetGhostCanva() {
    if (canvaGhostRef.current) {
      const canva = canvaGhostRef.current.getContext("2d") as any
      canva.reset()
    }
  }

  const handleChangeCanva = useCallback(() => {
    const { x, y } = canvaXY
    if (clientHolding) {
      
      if (toolSelected === ToolList.pencil) {
        drawPoint(x, y)
      }

      if (toolSelected === ToolList.eraser) {
        drawPoint(x, y, true)
      }

      if (toolSelected === ToolList.line) {
        drawGhostline()
      }

      if (toolSelected === ToolList.rect) {
        drawGhostRect()
      }
    }

    if (!clientHolding && clientHoldingFrom.x !== 0) {
      if (toolSelected === ToolList.line) {
        drawLine(x, y)
      }
      
      
      if (toolSelected === ToolList.rect) {
        drawRect()
      }
      
      setClientHoldingFrom({
        x: 0,
        y: 0
      })
    }
  }, [canvaXY, clientHolding, toolSelected, drawPoint, clientHoldingFrom, drawLine, drawGhostline, drawGhostRect, drawRect])

  useEffect(() => {
    handleChangeCanva()
  }, [handleChangeCanva])

  function getCanvaSize(clientX: number, clientY: number) {
    let leftCanva = 0
    let topCanva = 0

    const canvaSize = canvaRef.current?.getBoundingClientRect()
    leftCanva = canvaSize?.left as number
    topCanva = canvaSize?.top as number

    const offsetSize = canvaSettings.size / 2

    return {
      x: (clientX - leftCanva) - offsetSize,
      y: (clientY - topCanva) - offsetSize,
      offset: offsetSize
    }
  }

  function handleMouseMove(ev: MouseEvent) {
    const { x, y, offset } = getCanvaSize(ev.clientX, ev.clientY)

    setCanvaXY({
      x,
      y
    })

    setClientPos({
      x: ev.clientX - offset,
      y: ev.clientY - offset
    })
  }

  function handleMouseLeave() {
    setCanvaSettings(prev => ({...prev, hover: false}))
    setClientHolding(false)
  }

  function handleMouseEnter() {
    setCanvaSettings(prev => ({...prev, hover: true}))
  }

  function handleMouseDown(ev: MouseEvent) {
    setClientHolding(true)
    
    if (toolSelected === ToolList.line || toolSelected === ToolList.rect) {
      const { x, y } = getCanvaSize(ev.clientX, ev.clientY)
      setClientHoldingFrom({
        x,
        y
      })
    }
  }

  function handleMouseUp() {
    setClientHolding(false)
    resetGhostCanva()
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="relative">
        <canvas 
          ref={canvaRef} 
          width={800} 
          height={600} 
          className="border rounded bg-white"
          onMouseMove={handleMouseMove}
          onPointerDown={handleMouseDown}
          onPointerUp={handleMouseUp}
          onPointerEnter={handleMouseEnter}
          onPointerLeave={handleMouseLeave}
        />
        <canvas
          ref={canvaGhostRef}
          width={800}
          height={600}
          className={styles.ghost}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-black flex flex-col gap-1">
          <span className="text-white">X:</span>
          <input type="number" value={canvaXY.x} onChange={(ev) => setCanvaXY(prev => ({...prev, x: ev.target.valueAsNumber}))}/>
          <span className="text-white">Y:</span>
          <input type="number" value={canvaXY.y} onChange={(ev) => setCanvaXY(prev => ({...prev, y: ev.target.valueAsNumber}))}/>

          <button className={btnStyle} onClick={resetCanva}>Reset</button>
        </div>

        <div className="flex flex-col gap-1">
          <h5>Tools {toolSelected}</h5>
          <button 
            className={btnStyle}
            onClick={() => setToolSelected(ToolList.mouse)}
          >
            Mouse
          </button>
          <button
            className={btnStyle}
            onClick={() => setToolSelected(ToolList.pencil)}
          >
            Lapiz
          </button>
          <button
            className={btnStyle}
            onClick={() => setToolSelected(ToolList.eraser)}
          >
            Goma
          </button>
          <button
            className={btnStyle}
            onClick={() => setToolSelected(ToolList.line)}
          >
            Linea
          </button>
          <button
            className={btnStyle}
            onClick={() => setToolSelected(ToolList.rect)}
          >
            Rectangulo
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <h5>Opciones:</h5>
          <label htmlFor="mouseSize">Tamaño ({canvaSettings.size})</label>
          <input 
            type="range" 
            min={1}
            max={50}
            value={canvaSettings.size}
            onChange={(ev) => setCanvaSettings(prev => ({...prev, size: ev.target.valueAsNumber}))}
          />
          <label htmlFor="color">Color</label>
          <input 
            type="color"
            id="color"
            value={canvaSettings.color}
            onChange={(ev) => setCanvaSettings(prev => ({...prev, color: ev.target.value}))} 
          />
        </div>

        <div 
          className={styles.tool}
          style={{
            left: clientPos.x,
            top: clientPos.y,
            width: canvaSettings.size + "px",
            height: canvaSettings.size + "px",
            display: getDrawMouse() ? "inline" : "none"
          }}
        />
      </div>

      </div>
      
  )
}

export default UseCanva
