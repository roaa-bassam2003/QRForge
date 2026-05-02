import { QRSettings, BarcodeFormat } from './types'

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function validateInput(value: string, type: 'qr' | 'barcode', format?: BarcodeFormat): string | null {
  if (!value.trim()) return 'invalidInput'

  if (type === 'barcode') {
    if (format === 'EAN13' && !/^\d{12,13}$/.test(value)) {
      return 'invalidBarcode'
    }
    if (format === 'EAN8' && !/^\d{7,8}$/.test(value)) {
      return 'invalidBarcode'
    }
    if (format === 'UPC' && !/^\d{11,12}$/.test(value)) {
      return 'invalidBarcode'
    }
    if (format === 'ITF14' && !/^\d{13,14}$/.test(value)) {
      return 'invalidBarcode'
    }
  }

  return null
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to create blob'))
    }, 'image/png')
  })
}

export function settingsToSearchParams(settings: QRSettings): URLSearchParams {
  const params = new URLSearchParams()
  params.set('type', settings.type)
  params.set('value', settings.value)
  params.set('fg', settings.fgColor.replace('#', ''))
  params.set('bg', settings.bgColor.replace('#', ''))
  params.set('size', settings.size.toString())
  params.set('style', settings.style)
  if (settings.type === 'barcode') params.set('format', settings.barcodeFormat)
  return params
}

export function searchParamsToSettings(params: URLSearchParams, defaults: QRSettings): Partial<QRSettings> {
  const result: Partial<QRSettings> = {}
  if (params.get('type')) result.type = params.get('type') as any
  if (params.get('value')) result.value = params.get('value')!
  if (params.get('fg')) result.fgColor = `#${params.get('fg')}`
  if (params.get('bg')) result.bgColor = `#${params.get('bg')}`
  if (params.get('size')) result.size = parseInt(params.get('size')!)
  if (params.get('style')) result.style = params.get('style') as any
  if (params.get('format')) result.barcodeFormat = params.get('format') as any
  return result
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  const now = Date.now()
  const diff = now - ts
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString()
}

export function formatTimestampAr(ts: number): string {
  const d = new Date(ts)
  const now = Date.now()
  const diff = now - ts
  if (diff < 60000) return 'الآن'
  if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} دقيقة`
  if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} ساعة`
  return d.toLocaleDateString('ar')
}
