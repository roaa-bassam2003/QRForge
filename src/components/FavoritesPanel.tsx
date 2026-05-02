'use client'

import { useState } from 'react'
import { FavoriteStyle } from '@/lib/types'
import { translations, TranslationKey } from '@/lib/i18n'
import { Star, Trash2, Check } from 'lucide-react'

interface FavoritesPanelProps {
  favorites: FavoriteStyle[]
  onApply: (fav: FavoriteStyle) => void
  onDelete: (id: string) => void
  onSave: (name: string) => void
  lang: 'en' | 'ar'
}

const t = (lang: 'en' | 'ar', key: TranslationKey) => translations[lang][key]

export default function FavoritesPanel({ favorites, onApply, onDelete, onSave, lang }: FavoritesPanelProps) {
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim())
    setName('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Save current style */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--accent-soft)', border: '1px solid', borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)' }}>
        <p className="text-xs font-display font-700 mb-2" style={{ color: 'var(--accent)' }}>
          {t(lang, 'saveFavorite')}
        </p>
        <div className="flex gap-2">
          <input
            className="input-base flex-1"
            style={{ padding: '8px 12px', fontSize: '13px' }}
            placeholder={t(lang, 'favoriteName')}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          />
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {saved ? <Check size={14} /> : t(lang, 'saveStyle')}
          </button>
        </div>
      </div>

      {/* Saved favorites */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3" style={{ color: 'var(--text-muted)' }}>
          <Star size={28} strokeWidth={1.5} />
          <p className="text-sm font-display font-600">{t(lang, 'noFavorites')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map(fav => (
            <div
              key={fav.id}
              className="history-item group"
              onClick={() => onApply(fav)}
            >
              {/* Color preview */}
              <div className="flex gap-1 flex-shrink-0">
                <div
                  className="w-5 h-10 rounded-l-lg"
                  style={{ background: (fav.settings.fgColor as string) || '#000' }}
                />
                <div
                  className="w-5 h-10 rounded-r-lg"
                  style={{ background: (fav.settings.bgColor as string) || '#fff', border: '1px solid var(--border)' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-display font-700">{fav.name}</p>
                <p className="text-[11px] mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>
                  {fav.settings.style || 'squares'} · {fav.settings.size || 256}px
                </p>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); onApply(fav) }}
                  className="px-3 py-1.5 rounded-md text-xs font-display font-600 transition-colors"
                  style={{ color: 'var(--accent)', background: 'var(--accent-soft)' }}
                >
                  {t(lang, 'applyStyle')}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(fav.id) }}
                  className="p-1.5 rounded-md transition-colors hover:bg-red-50 hover:text-red-500"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
