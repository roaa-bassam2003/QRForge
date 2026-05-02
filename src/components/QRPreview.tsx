'use client'

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { QRSettings } from '@/lib/types'

interface QRPreviewProps {
  settings: QRSettings
  onGenerated?: (canvas: HTMLCanvasElement) => void
}

export interface QRPreviewHandle {
  getCanvas: () => HTMLCanvasElement | null
  downloadPNG: (filename?: string) => void
  downloadSVG: (filename?: string) => void
  copyToClipboard: () => Promise<void>
}

const QRPreview = forwardRef<QRPreviewHandle, QRPreviewProps>(function QRPreview({ settings, onGenerated }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const barcodeRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const drawQR = useCallback(async () => {
    if (settings.type !== 'qr' || !settings.value.trim()) return
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const QRCode = (await import('qrcode')).default
      const { style, fgColor, bgColor, size, logoUrl, logoSize, errorCorrectionLevel } = settings

      // Draw base QR
      await QRCode.toCanvas(canvas, settings.value, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel,
      })

      if (style === 'dots' || style === 'rounded') {
        // Re-draw with custom module style
        const ctx = canvas.getContext('2d')!
        const moduleCount = getModuleCount(settings.value, errorCorrectionLevel)
        const margin = 2
        const moduleSize = (size - margin * 2 * (size / 33)) / moduleCount

        // Get QR matrix
        const qr = await QRCode.create(settings.value, { errorCorrectionLevel })
        const modules = qr.modules

        // Clear and redraw bg
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const scaledModuleSize = canvas.width / (modules.size + margin * 2)
        const offset = scaledModuleSize * margin

        ctx.fillStyle = fgColor

        for (let r = 0; r < modules.size; r++) {
          for (let c = 0; c < modules.size; c++) {
            if (modules.get(r, c)) {
              const x = offset + c * scaledModuleSize
              const y = offset + r * scaledModuleSize
              const s = scaledModuleSize

              if (style === 'dots') {
                ctx.beginPath()
                ctx.arc(x + s / 2, y + s / 2, s * 0.4, 0, Math.PI * 2)
                ctx.fill()
              } else if (style === 'rounded') {
                const radius = s * 0.3
                roundRect(ctx, x + 1, y + 1, s - 2, s - 2, radius)
                ctx.fill()
              }
            }
          }
        }
      }

      // Overlay logo
      if (logoUrl) {
        await overlayLogo(canvas, logoUrl, logoSize)
      }

      if (onGenerated) onGenerated(canvas)
    } catch (err) {
      console.error('QR generation error:', err)
    }
  }, [settings, onGenerated])

  const drawBarcode = useCallback(async () => {
    if (settings.type !== 'barcode' || !settings.value.trim()) return
    const svg = barcodeRef.current
    if (!svg) return

    try {
      const JsBarcode = (await import('jsbarcode')).default
      JsBarcode(svg, settings.value, {
        format: settings.barcodeFormat,
        width: 2,
        height: 80,
        displayValue: true,
        lineColor: settings.fgColor,
        background: settings.bgColor,
        font: 'Space Mono',
        fontSize: 14,
        textMargin: 6,
        margin: 16,
        valid: () => {},
      })
    } catch (err) {
      console.error('Barcode generation error:', err)
    }
  }, [settings])

  useEffect(() => {
    if (settings.type === 'qr') drawQR()
    else drawBarcode()
  }, [settings.type, drawQR, drawBarcode])

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,

    downloadPNG: (filename = 'qrforge-code') => {
      if (settings.type === 'qr') {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.toBlob(blob => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = `${filename}.png`
          document.body.appendChild(a); a.click()
          document.body.removeChild(a); URL.revokeObjectURL(url)
        }, 'image/png')
      } else {
        // Convert SVG barcode to PNG
        const svg = barcodeRef.current
        if (!svg) return
        const svgData = new XMLSerializer().serializeToString(svg)
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width * 2; canvas.height = img.height * 2
          const ctx = canvas.getContext('2d')!
          ctx.scale(2, 2); ctx.drawImage(img, 0, 0)
          canvas.toBlob(blob => {
            if (!blob) return
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `${filename}.png`
            document.body.appendChild(a); a.click()
            document.body.removeChild(a); URL.revokeObjectURL(url)
          }, 'image/png')
        }
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
      }
    },

    downloadSVG: (filename = 'qrforge-code') => {
      if (settings.type === 'qr') {
        // Convert canvas to SVG-wrapped image
        const canvas = canvasRef.current
        if (!canvas) return
        const dataURL = canvas.toDataURL('image/png')
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
  <image href="${dataURL}" width="${canvas.width}" height="${canvas.height}"/>
</svg>`
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `${filename}.svg`
        document.body.appendChild(a); a.click()
        document.body.removeChild(a); URL.revokeObjectURL(url)
      } else {
        const svg = barcodeRef.current
        if (!svg) return
        const svgData = new XMLSerializer().serializeToString(svg)
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `${filename}.svg`
        document.body.appendChild(a); a.click()
        document.body.removeChild(a); URL.revokeObjectURL(url)
      }
    },

    copyToClipboard: async () => {
      if (settings.type === 'qr') {
        const canvas = canvasRef.current
        if (!canvas) return
        const blob: Blob = await new Promise((res, rej) =>
          canvas.toBlob(b => b ? res(b) : rej(), 'image/png')
        )
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      } else {
        const svg = barcodeRef.current
        if (!svg) return
        const svgData = new XMLSerializer().serializeToString(svg)
        const img = new Image()
        await new Promise<void>(resolve => {
          img.onload = resolve
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
        })
        const canvas = document.createElement('canvas')
        canvas.width = img.width * 2; canvas.height = img.height * 2
        const ctx = canvas.getContext('2d')!
        ctx.scale(2, 2); ctx.drawImage(img, 0, 0)
        const blob: Blob = await new Promise((res, rej) =>
          canvas.toBlob(b => b ? res(b) : rej(), 'image/png')
        )
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      }
    },
  }))

  return (
    <div ref={containerRef} className="flex items-center justify-center w-full h-full">
      {settings.type === 'qr' ? (
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: settings.style === 'rounded' ? '12px' : '4px',
            imageRendering: 'pixelated',
          }}
        />
      ) : (
        <svg
          ref={barcodeRef}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      )}
    </div>
  )
})

export default QRPreview

// Helpers
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

async function overlayLogo(canvas: HTMLCanvasElement, logoUrl: string, logoSizePct: number) {
  return new Promise<void>(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const ctx = canvas.getContext('2d')!
      const logoW = canvas.width * (logoSizePct / 100)
      const logoH = (img.height / img.width) * logoW
      const x = (canvas.width - logoW) / 2
      const y = (canvas.height - logoH) / 2

      // White background behind logo
      const pad = 6
      ctx.fillStyle = '#FFFFFF'
      roundRect(ctx, x - pad, y - pad, logoW + pad * 2, logoH + pad * 2, 8)
      ctx.fill()
      ctx.drawImage(img, x, y, logoW, logoH)
      resolve()
    }
    img.onerror = () => resolve()
    img.src = logoUrl
  })
}

function getModuleCount(value: string, ecl: string): number {
  // Approximate - actual count depends on QR version
  const len = value.length
  if (len < 10) return 21
  if (len < 25) return 25
  if (len < 50) return 29
  return 33
}
