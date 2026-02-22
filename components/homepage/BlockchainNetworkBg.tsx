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

export function BlockchainNetworkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let nodes: Node[] = []
    const NODE_COUNT = 38
    const CONNECTION_DIST = 160

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
            const alpha = (1 - dist / CONNECTION_DIST) * 0.25
            ctx.beginPath()
            ctx.strokeStyle = `rgba(16,185,129,${alpha})`
            ctx.lineWidth = 0.8
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + n.phase)
        const alpha = 0.4 + 0.4 * pulse

        // Outer glow ring
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 4)
        grad.addColorStop(0, `rgba(16,185,129,${alpha * 0.6})`)
        grad.addColorStop(1, 'rgba(16,185,129,0)')
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16,185,129,${alpha})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
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
