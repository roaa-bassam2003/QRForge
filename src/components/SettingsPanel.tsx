'use client'

import { useRef } from 'react'
import { QRSettings, QRStyle, BarcodeFormat } from '@/lib/types'
import { translations, TranslationKey } from '@/lib/i18n'
import { ImageIcon, X } from 'lucide-react'

interface SettingsPanelProps {
  settings: QRSettings
  onChange: (updates: Partial<QRSettings>) => void
  lang: 'en' | 'ar'
}

const t = (lang: 'en' | 'ar', key: TranslationKey) => translations[lang][key]

const BARCODE_FORMATS: { value: BarcodeFormat; label: string }[] = [
  { value: 'CODE128', label: 'CODE128 (Universal)' },
  { value: 'CODE39', label: 'CODE39' },
  { value: 'EAN13', label: 'EAN-13 (13 digits)' },
  { value: 'EAN8', label: 'EAN-8 (8 digits)' },
  { value: 'UPC', label: 'UPC-A (12 digits)' },
  { value: 'ITF14', label: 'ITF-14 (14 digits)' },
]

const STYLES: { value: QRStyle; label: TranslationKey }[] = [
  { value: 'squares', label: 'squares' },
  { value: 'dots', label: 'dots' },
  { value: 'rounded', label: 'rounded' },
]

const EC_LEVELS = [
  { value: 'L', label: 'errorCorrectionLow' },
  { value: 'M', label: 'errorCorrectionMedium' },
  { value: 'Q', label: 'errorCorrectionQuartile' },
  { value: 'H', label: 'errorCorrectionHigh' },
] as const

export default function SettingsPanel({ settings, onChange, lang }: SettingsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => onChange({ logoUrl: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      {/* Colors */}
      <section>
        <h3 className="font-display font-700 text-sm mb-3 opacity-50 uppercase tracking-wider">
          {t(lang, 'colors')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t(lang, 'foreground')}
            </label>
            <div className="flex items-center gap-2">
              <div className="color-swatch">
                <input
                  type="color"
                  value={settings.fgColor}
                  onChange={e => onChange({ fgColor: e.target.value })}
                />
              </div>
              <input
                className="input-base flex-1"
                style={{ padding: '7px 10px', fontSize: '12px' }}
                value={settings.fgColor}
                onChange={e => {
                  const v = e.target.value
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange({ fgColor: v })
                }}
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {t(lang, 'background')}
            </label>
            <div className="flex items-center gap-2">
              <div className="color-swatch">
                <input
                  type="color"
                  value={settings.bgColor}
                  onChange={e => onChange({ bgColor: e.target.value })}
                />
              </div>
              <input
                className="input-base flex-1"
                style={{ padding: '7px 10px', fontSize: '12px' }}
                value={settings.bgColor}
                onChange={e => {
                  const v = e.target.value
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange({ bgColor: v })
                }}
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Size */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-display font-700 text-sm opacity-50 uppercase tracking-wider">
            {t(lang, 'size')}
          </h3>
          <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
            {settings.size}px
          </span>
        </div>
        <input
          type="range"
          min={128}
          max={512}
          step={16}
          value={settings.size}
          onChange={e => onChange({ size: parseInt(e.target.value) })}
          className="w-full"
        />
      </section>

      {/* Style (QR only) */}
      {settings.type === 'qr' && (
        <section>
          <h3 className="font-display font-700 text-sm mb-3 opacity-50 uppercase tracking-wider">
            {t(lang, 'style')}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => onChange({ style: s.value })}
                className={`py-2 px-3 rounded-lg text-xs font-display font-600 border transition-all ${
                  settings.style === s.value
                    ? 'border-accent text-white'
                    : 'border-transparent'
                }`}
                style={{
                  background: settings.style === s.value ? 'var(--accent)' : 'var(--bg-input)',
                  borderColor: settings.style === s.value ? 'var(--accent)' : 'var(--border)',
                  color: settings.style === s.value ? 'white' : 'var(--text)',
                }}
              >
                {t(lang, s.label)}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Error Correction (QR only) */}
      {settings.type === 'qr' && (
        <section>
          <h3 className="font-display font-700 text-sm mb-3 opacity-50 uppercase tracking-wider">
            {t(lang, 'errorLevel')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {EC_LEVELS.map(ec => (
              <button
                key={ec.value}
                onClick={() => onChange({ errorCorrectionLevel: ec.value })}
                className="py-2 px-3 rounded-lg text-xs font-display font-600 text-start transition-all"
                style={{
                  background: settings.errorCorrectionLevel === ec.value ? 'var(--accent-soft)' : 'var(--bg-input)',
                  border: `1.5px solid ${settings.errorCorrectionLevel === ec.value ? 'var(--accent)' : 'var(--border)'}`,
                  color: settings.errorCorrectionLevel === ec.value ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                <span className="font-800">{ec.value}</span>
                <span className="block text-[10px] mt-0.5 opacity-75">
                  {t(lang, ec.label as TranslationKey).split('(')[1]?.replace(')', '') || ''}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Logo (QR only) */}
      {settings.type === 'qr' && (
        <section>
          <h3 className="font-display font-700 text-sm mb-3 opacity-50 uppercase tracking-wider">
            {t(lang, 'logo')}
          </h3>
          {settings.logoUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-md" />
                <span className="flex-1 text-xs" style={{ color: 'var(--text-muted)' }}>Logo uploaded</span>
                <button
                  onClick={() => { onChange({ logoUrl: null }); if (fileRef.current) fileRef.current.value = '' }}
                  className="p-1.5 rounded-md transition-colors hover:bg-red-50 hover:text-red-500"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t(lang, 'logoSize')}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{settings.logoSize}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={35}
                  value={settings.logoSize}
                  onChange={e => onChange({ logoSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:border-accent"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <ImageIcon size={20} />
              <span className="text-xs font-display font-600">{t(lang, 'uploadLogo')}</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </section>
      )}

      {/* Barcode Format */}
      {settings.type === 'barcode' && (
        <section>
          <h3 className="font-display font-700 text-sm mb-3 opacity-50 uppercase tracking-wider">
            {t(lang, 'barcodeFormat')}
          </h3>
          <select
            className="input-base"
            value={settings.barcodeFormat}
            onChange={e => onChange({ barcodeFormat: e.target.value as BarcodeFormat })}
          >
            {BARCODE_FORMATS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </section>
      )}
    </div>
  )
}
