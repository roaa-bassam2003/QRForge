'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { useAppState } from '@/hooks/useAppState'
import { translations } from '@/lib/i18n'
import { validateInput, settingsToSearchParams } from '@/lib/utils'
import QRPreview, { QRPreviewHandle } from '@/components/QRPreview'
import SettingsPanel from '@/components/SettingsPanel'
import HistoryPanel from '@/components/HistoryPanel'
import FavoritesPanel from '@/components/FavoritesPanel'
import Toast from '@/components/Toast'
import {
  Download, Copy, Moon, Sun, Globe2, QrCode,
  BarChart3, Share2, Check, AlertCircle, History, Star, Sliders
} from 'lucide-react'

export default function Home() {
  const state = useAppState()
  const {
    settings, updateSettings, history, addToHistory, loadFromHistory,
    deleteHistory, clearHistory, favorites, saveFavorite, applyFavorite,
    deleteFavorite, isDark, toggleTheme, language, toggleLanguage,
    toast, showToast, error, setError, activeTab, setActiveTab,
  } = state

  const previewRef = useRef<QRPreviewHandle>(null)
  const [inputValue, setInputValue] = useState(settings.value)
  const [justCopied, setJustCopied] = useState(false)
  const [justShared, setJustShared] = useState(false)

  const t = (key: keyof typeof translations.en) => translations[language][key]

  // Sync input value to settings with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const err = validateInput(inputValue, settings.type, settings.barcodeFormat)
      if (err) {
        setError(t(err as any))
      } else {
        setError(null)
        updateSettings({ value: inputValue })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue, settings.type, settings.barcodeFormat])

  const handleDownloadPNG = useCallback(() => {
    previewRef.current?.downloadPNG('qrforge-code')
    addToHistory()
    showToast('Downloaded PNG!')
  }, [addToHistory, showToast])

  const handleDownloadSVG = useCallback(() => {
    previewRef.current?.downloadSVG('qrforge-code')
    addToHistory()
    showToast('Downloaded SVG!')
  }, [addToHistory, showToast])

  const handleCopy = useCallback(async () => {
    try {
      await previewRef.current?.copyToClipboard()
      setJustCopied(true)
      showToast(t('copied'))
      setTimeout(() => setJustCopied(false), 2000)
    } catch {
      showToast('Copy failed — try downloading instead')
    }
  }, [showToast, t])

  const handleShare = useCallback(() => {
    const params = settingsToSearchParams(settings)
    const url = `${window.location.origin}?${params.toString()}`
    navigator.clipboard.writeText(url).then(() => {
      setJustShared(true)
      showToast(t('linkCopied'))
      setTimeout(() => setJustShared(false), 2000)
    })
  }, [settings, showToast, t])

  const hasError = !!error && inputValue.trim() !== ''

  const tabs = [
    { id: 'customize' as const, icon: Sliders, label: t('customize') },
    { id: 'history' as const, icon: History, label: t('history'), count: history.length },
    { id: 'favorites' as const, icon: Star, label: t('favorites'), count: favorites.length },
  ]

  return (
    <main className="min-h-screen noise relative" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent)' }}
              >
                <QrCode size={16} color="white" strokeWidth={2.5} />
              </div>
              <h1
                className="text-2xl font-display gradient-text"
                style={{ fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800 }}
              >
                QRForge
              </h1>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>
              {t('tagline')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12px' }}
              title={t('language')}
            >
              <Globe2 size={14} />
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <button
              onClick={toggleTheme}
              className="btn-secondary"
              style={{ padding: '8px' }}
              title={isDark ? t('lightMode') : t('darkMode')}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* Left: Preview + Input */}
          <div className="space-y-4">

            {/* Input card */}
            <div className="card p-5">
              {/* Type switch */}
              <div
                className="flex gap-1 p-1 rounded-xl mb-4 w-fit"
                style={{ background: 'var(--bg-input)' }}
              >
                <button
                  className={`tab ${settings.type === 'qr' ? 'active' : ''}`}
                  onClick={() => updateSettings({ type: 'qr' })}
                >
                  <QrCode size={13} className="inline-block me-1.5" />
                  {t('qrCode')}
                </button>
                <button
                  className={`tab ${settings.type === 'barcode' ? 'active' : ''}`}
                  onClick={() => updateSettings({ type: 'barcode' })}
                >
                  <BarChart3 size={13} className="inline-block me-1.5" />
                  {t('barcode')}
                </button>
              </div>

              {/* Text input */}
              <div>
                <label className="block text-xs mb-2 font-display font-600" style={{ color: 'var(--text-muted)' }}>
                  {t('inputLabel')}
                </label>
                <div className="relative">
                  <textarea
                    className={`input-base resize-none ${hasError ? 'border-red-400 focus:border-red-400' : ''}`}
                    style={{ minHeight: '80px', paddingRight: hasError ? '40px' : '14px' }}
                    placeholder={t('inputPlaceholder')}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                  />
                  {hasError && (
                    <div className="absolute top-3 end-3" style={{ color: '#EF4444' }}>
                      <AlertCircle size={16} />
                    </div>
                  )}
                </div>
                {hasError && (
                  <p className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: '#EF4444' }}>
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Preview card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-display font-700 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {t('preview')}
                </span>
                <div className="flex items-center gap-1.5">
                  {/* Size indicator */}
                  <span
                    className="badge"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
                  >
                    {settings.size}×{settings.size}px
                  </span>
                </div>
              </div>

              <div
                className="preview-container"
                style={{
                  minHeight: '280px',
                  background: settings.bgColor,
                  border: '1px solid var(--border)',
                }}
              >
                {!hasError && settings.value.trim() ? (
                  <div className="animate-scale-in">
                    <QRPreview ref={previewRef} settings={settings} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8" style={{ color: 'var(--text-muted)' }}>
                    <QrCode size={40} strokeWidth={1} />
                    <span className="text-sm font-display">Enter text to generate</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button onClick={handleDownloadPNG} className="btn-primary justify-center" style={{ padding: '10px' }}>
                  <Download size={14} />
                  {t('downloadPNG')}
                </button>
                <button onClick={handleDownloadSVG} className="btn-secondary justify-center" style={{ padding: '10px' }}>
                  <Download size={14} />
                  {t('downloadSVG')}
                </button>
                <button onClick={handleCopy} className="btn-secondary justify-center" style={{ padding: '10px' }}>
                  {justCopied ? <Check size={14} /> : <Copy size={14} />}
                  {justCopied ? t('copied') : t('copy')}
                </button>
                <button onClick={handleShare} className="btn-secondary justify-center" style={{ padding: '10px' }}>
                  {justShared ? <Check size={14} /> : <Share2 size={14} />}
                  {t('share')}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Settings/History/Favorites */}
          <div className="card flex flex-col overflow-hidden" style={{ height: 'fit-content', minHeight: '500px' }}>
            {/* Tabs */}
            <div
              className="flex border-b p-1 gap-0.5"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-input)' }}
            >
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-display font-600 transition-all ${
                    activeTab === tab.id ? 'shadow-sm' : ''
                  }`}
                  style={{
                    background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
                  }}
                >
                  <tab.icon size={12} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className="rounded-full text-[10px] font-800 px-1.5 py-0.5"
                      style={{ background: 'var(--accent)', color: 'white', minWidth: '18px', textAlign: 'center' }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="p-5 flex-1 overflow-y-auto">
              {activeTab === 'customize' && (
                <div className="animate-fade-in">
                  <SettingsPanel settings={settings} onChange={updateSettings} lang={language} />
                </div>
              )}
              {activeTab === 'history' && (
                <div className="animate-fade-in">
                  <HistoryPanel
                    history={history}
                    onLoad={item => { loadFromHistory(item); setInputValue(item.settings.value) }}
                    onDelete={deleteHistory}
                    onClear={clearHistory}
                    lang={language}
                  />
                </div>
              )}
              {activeTab === 'favorites' && (
                <div className="animate-fade-in">
                  <FavoritesPanel
                    favorites={favorites}
                    onApply={applyFavorite}
                    onDelete={deleteFavorite}
                    onSave={saveFavorite}
                    lang={language}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          <p>
            Built with{' '}
            <span style={{ color: 'var(--accent)' }}>♥</span>{' '}
            Roaa Bassam
          </p>
        </footer>
      </div>

      <Toast message={toast} />
    </main>
  )
}
