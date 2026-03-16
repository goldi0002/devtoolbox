import { useState, useEffect } from 'react'

export default function ClientOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{fallback}</> 

  return <>{children}</>
}