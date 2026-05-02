'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string | null
}

export default function Toast({ message }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [message])

  if (!message || !visible) return null

  return (
    <div className="toast animate-slide-up">
      {message}
    </div>
  )
}
