"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useState, useEffect } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // 使用useEffect确保只在客户端渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  // 添加一个类来控制初始加载时的过渡
  useEffect(() => {
    // 初始加载时禁用过渡
    document.documentElement.classList.add("no-transition")

    // 短暂延迟后启用过渡
    const timer = setTimeout(() => {
      document.documentElement.classList.remove("no-transition")
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
