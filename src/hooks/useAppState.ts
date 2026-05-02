'use client'

import { useState, useEffect, useCallback } from 'react'
import { QRSettings, HistoryItem, FavoriteStyle, Language, DEFAULT_SETTINGS } from '@/lib/types'
import { generateId } from '@/lib/utils'

const HISTORY_KEY = 'qrforge-history'
const FAVORITES_KEY = 'qrforge-favorites'
const THEME_KEY = 'qrforge-theme'
const LANG_KEY = 'qrforge-lang'

export function useAppState() {
  const [settings, setSettings] = useState<QRSettings>(DEFAULT_SETTINGS)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [favorites, setFavorites] = useState<FavoriteStyle[]>([])
  const [isDark, setIsDark] = useState(false)
  const [language, setLanguage] = useState<Language>('en')
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'customize' | 'history' | 'favorites'>('customize')

  // Load from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY)
      if (savedHistory) setHistory(JSON.parse(savedHistory))

      const savedFavorites = localStorage.getItem(FAVORITES_KEY)
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites))

      const savedTheme = localStorage.getItem(THEME_KEY) || 'light'
      if (savedTheme === 'dark') {
        setIsDark(true)
        document.documentElement.classList.add('dark')
      }

      const savedLang = (localStorage.getItem(LANG_KEY) || 'en') as Language
      setLanguage(savedLang)
      document.documentElement.setAttribute('lang', savedLang)
      document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr')
    } catch (e) {}
  }, [])

  const updateSettings = useCallback((updates: Partial<QRSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
    setError(null)
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const addToHistory = useCallback((thumbnail?: string) => {
    setSettings(current => {
      const item: HistoryItem = {
        id: generateId(),
        settings: { ...current },
        timestamp: Date.now(),
        thumbnail,
      }
      setHistory(prev => {
        const next = [item, ...prev].slice(0, 20)
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch (e) {}
        return next
      })
      return current
    })
  }, [])

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setSettings(item.settings)
    setError(null)
  }, [])

  const deleteHistory = useCallback((id: string) => {
    setHistory(prev => {
      const next = prev.filter(h => h.id !== id)
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch (e) {}
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    try { localStorage.removeItem(HISTORY_KEY) } catch (e) {}
  }, [])

  const saveFavorite = useCallback((name: string) => {
    setSettings(current => {
      const fav: FavoriteStyle = {
        id: generateId(),
        name,
        settings: {
          fgColor: current.fgColor,
          bgColor: current.bgColor,
          style: current.style,
          size: current.size,
          logoSize: current.logoSize,
        },
      }
      setFavorites(prev => {
        const next = [fav, ...prev].slice(0, 10)
        try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)) } catch (e) {}
        return next
      })
      return current
    })
  }, [])

  const applyFavorite = useCallback((fav: FavoriteStyle) => {
    setSettings(prev => ({ ...prev, ...fav.settings }))
  }, [])

  const deleteFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.filter(f => f.id !== id)
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)) } catch (e) {}
      return next
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem(THEME_KEY, 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem(THEME_KEY, 'light')
      }
      return next
    })
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next: Language = prev === 'en' ? 'ar' : 'en'
      localStorage.setItem(LANG_KEY, next)
      document.documentElement.setAttribute('lang', next)
      document.documentElement.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr')
      return next
    })
  }, [])

  return {
    settings,
    updateSettings,
    history,
    addToHistory,
    loadFromHistory,
    deleteHistory,
    clearHistory,
    favorites,
    saveFavorite,
    applyFavorite,
    deleteFavorite,
    isDark,
    toggleTheme,
    language,
    toggleLanguage,
    toast,
    showToast,
    error,
    setError,
    activeTab,
    setActiveTab,
  }
}
