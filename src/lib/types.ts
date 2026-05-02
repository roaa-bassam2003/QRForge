export type CodeType = 'qr' | 'barcode'
export type BarcodeFormat = 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39' | 'ITF14'
export type QRStyle = 'squares' | 'dots' | 'rounded'
export type Language = 'en' | 'ar'

export interface QRSettings {
  type: CodeType
  value: string
  fgColor: string
  bgColor: string
  size: number
  style: QRStyle
  logoUrl: string | null
  logoSize: number
  barcodeFormat: BarcodeFormat
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
}

export interface HistoryItem {
  id: string
  settings: QRSettings
  timestamp: number
  thumbnail?: string
}

export interface FavoriteStyle {
  id: string
  name: string
  settings: Partial<QRSettings>
}

export const DEFAULT_SETTINGS: QRSettings = {
  type: 'qr',
  value: 'https://example.com',
  fgColor: '#1A1916',
  bgColor: '#FFFFFF',
  size: 256,
  style: 'squares',
  logoUrl: null,
  logoSize: 20,
  barcodeFormat: 'CODE128',
  errorCorrectionLevel: 'M',
}
