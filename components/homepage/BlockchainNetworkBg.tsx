'use client'

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  phase: number
}

const NODE_COUNT = 25       // reduced from 38 → 300 connection checks/frame vs 703
const CONNECTION_DIST = 155
const FRAME_MS = 1000 / 24  // throttle to 24fps (~41.6ms) to free the main thread

export function BlockchainNetworkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let nodes: Node[] = []
    let lastFrame = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const initNodes = () => {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.5,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (time: number) => {
      animId = requestAnimationFrame(draw)

      // Throttle: skip frame if not enough time has elapsed
      if (time - lastFrame < FRAME_MS) return
      lastFrame = time

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = time * 0.001

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      })

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.22
            ctx.beginPath()
            ctx.strokeStyle = `rgba(16,185,129,${alpha})`
            ctx.lineWidth = 0.8
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes — simple circles only (no createRadialGradient per node)
      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + n.phase)
        const alpha = 0.4 + 0.4 * pulse

        // Soft glow: single low-opacity larger circle
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16,185,129,${alpha * 0.12})`
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16,185,129,${alpha})`
        ctx.fill()
      })
    }

    resize()
    initNodes()
    animId = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => {
      resize()
      initNodes()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  )
}
