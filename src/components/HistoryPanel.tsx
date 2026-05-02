'use client'

import { HistoryItem } from '@/lib/types'
import { translations, TranslationKey } from '@/lib/i18n'
import { Trash2, Clock, RotateCcw } from 'lucide-react'
import { formatTimestamp, formatTimestampAr } from '@/lib/utils'

interface HistoryPanelProps {
  history: HistoryItem[]
  onLoad: (item: HistoryItem) => void
  onDelete: (id: string) => void
  onClear: () => void
  lang: 'en' | 'ar'
}

const t = (lang: 'en' | 'ar', key: TranslationKey) => translations[lang][key]

export default function HistoryPanel({ history, onLoad, onDelete, onClear, lang }: HistoryPanelProps) {
  const fmt = lang === 'ar' ? formatTimestampAr : formatTimestamp

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3" style={{ color: 'var(--text-muted)' }}>
        <Clock size={32} strokeWidth={1.5} />
        <p className="text-sm font-display font-600">{t(lang, 'noHistory')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {history.length} items
        </span>
        <button
          onClick={onClear}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-input)' }}
        >
          <Trash2 size={11} />
          {t(lang, 'clearAll')}
        </button>
      </div>

      {history.map(item => (
        <div
          key={item.id}
          className="history-item group"
          onClick={() => onLoad(item)}
        >
          {/* Thumbnail */}
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-display font-800"
            style={{
              background: item.settings.bgColor || '#fff',
              color: item.settings.fgColor || '#000',
              fontSize: '10px',
              border: '1px solid var(--border)',
            }}
          >
            {item.settings.type === 'qr' ? 'QR' : 'BC'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-display font-600 truncate">{item.settings.value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {fmt(item.timestamp)} · {item.settings.type.toUpperCase()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={e => { e.stopPropagation(); onLoad(item) }}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: 'var(--accent)', background: 'var(--accent-soft)' }}
              title={t(lang, 'applyStyle')}
            >
              <RotateCcw size={12} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(item.id) }}
              className="p-1.5 rounded-md transition-colors hover:bg-red-50 hover:text-red-500"
              style={{ color: 'var(--text-muted)' }}
              title={t(lang, 'deleteItem')}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
