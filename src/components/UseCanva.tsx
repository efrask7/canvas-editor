import { MouseEvent, useCallback, useEffect, useRef, useState } from "react"
import styles from "../css/UseCanva.module.css"

enum ToolList {
  mouse = "Mouse",
  pencil = "Lapiz",
  eraser = "Goma de Borrar"
}

const btnStyle = "px-2 border rounded bg-cyan-500 hover:bg-cyan-600"

function UseCanva() {

  const canvaRef = useRef<HTMLCanvasElement>(null)

  const [toolSelected, setToolSelected] = useState<ToolList>(ToolList.mouse)
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

  function drawOnCanva(x: number, y: number) {
    if (canvaRef.current) {
      const canva = canvaRef.current.getContext("2d") as CanvasRenderingContext2D
      canva.moveTo(0, 0)
      canva.lineTo(x, y)
      canva.stroke()
    }
  }

  const drawPoint = useCallback((x: number, y: number, eraser: boolean = false) => {
    if (canvaRef.current) {
      const canva = canvaRef.current.getContext("2d") as CanvasRenderingContext2D
      const { size, color } = canvaSettings
      canva.fillStyle = eraser ? "#fff" : color
      canva.fillRect(x, y, size, size)
    }
  }, [canvaSettings])

  function resetCanva() {
    if (canvaRef.current) {
      const canva = canvaRef.current.getContext("2d") as any
      canva.reset()
    }
  }

  const [canvaXY, setCanvaXY] = useState({
    x: 0,
    y: 0
  })

  const handleChangeCanva = useCallback(() => {
    if (clientHolding) {
      const { x, y } = canvaXY
      
      if (toolSelected === ToolList.pencil) {
        drawPoint(x, y)
      }

      if (toolSelected === ToolList.eraser) {
        drawPoint(x, y, true)
      }
    }
  }, [canvaXY, clientHolding, toolSelected, drawPoint])

  useEffect(() => {
    handleChangeCanva()
  }, [handleChangeCanva])

  function handleMouseMove(ev: MouseEvent) {
    let leftCanva = 0
    let topCanva = 0

    const clientSize = canvaRef.current?.getBoundingClientRect()
    leftCanva = clientSize?.left as number
    topCanva = clientSize?.top as number

    const offsetSize = canvaSettings.size / 2

    const clientX = (ev.clientX - leftCanva) - offsetSize
    const clientY = (ev.clientY - topCanva) - offsetSize

    setCanvaXY({
      x: clientX,
      y: clientY
    })

    setClientPos({
      x: ev.clientX - canvaSettings.size/2,
      y: ev.clientY - canvaSettings.size/2
    })
  }

  return (
    <div className="flex flex-col gap-2 items-center">
      <div>
        <canvas 
          ref={canvaRef} 
          width={800} 
          height={600} 
          className="border rounded bg-white"
          onMouseMove={handleMouseMove}
          onPointerDown={() => setClientHolding(true)}
          onPointerUp={() => setClientHolding(false)}
          onPointerEnter={() => setCanvaSettings(prev => ({...prev, hover: true}))}
          onPointerLeave={() => setCanvaSettings(prev => ({...prev, hover: false}))}
        />
      </div>
      
      <div className="text-black">
        <span className="text-white">X</span>
        <input type="number" value={canvaXY.x} onChange={(ev) => setCanvaXY(prev => ({...prev, x: ev.target.valueAsNumber}))}/>
        <span className="text-white">Y</span>
        <input type="number" value={canvaXY.y} onChange={(ev) => setCanvaXY(prev => ({...prev, y: ev.target.valueAsNumber}))}/>
        <button
          onClick={() => drawOnCanva(canvaXY.x, canvaXY.y)}
          className="text-white"
        >XY</button>

        <button className={btnStyle} onClick={resetCanva}>Reset</button>
      </div>

      <div>
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
      </div>
      <div>
        <h5>Opts</h5>
        <label htmlFor="mouseSize">Tamaño</label>
        <input 
          type="number" 
          value={canvaSettings.size}
          onChange={(ev) => setCanvaSettings(prev => ({...prev, size: ev.target.valueAsNumber}))}
          className="text-black"
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
          display: canvaSettings.hover ? "inline" : "none"
        }}
      />
    </div>
  )
}

export default UseCanva
