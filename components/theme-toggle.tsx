"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 防止主题切换时的闪烁
  const [isChanging, setIsChanging] = useState(false)

  // 确保组件只在客户端渲染，避免服务器端和客户端渲染不一致
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    // 添加防闪烁处理
    setIsChanging(true)

    // 设置新主题
    setTheme(theme === "dark" ? "light" : "dark")

    // 短暂禁用过渡效果，然后重新启用
    setTimeout(() => {
      setIsChanging(false)
    }, 50)
  }

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <div
      className={`relative flex h-8 w-16 cursor-pointer items-center rounded-full bg-gray-200 p-1 shadow-inner dark:bg-gray-700 ${
        isChanging ? "no-transition" : ""
      }`}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      aria-label="切换主题"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          toggleTheme()
        }
      }}
    >
      {/* 太阳图标 - 浅色主题 */}
      <Sun
        className={`absolute left-1.5 h-5 w-5 text-yellow-500 transition-opacity duration-500 ${
          isDark ? "opacity-40" : "opacity-100"
        }`}
      />

      {/* 月亮图标 - 深色主题 */}
      <Moon
        className={`absolute right-1.5 h-5 w-5 text-blue-400 transition-opacity duration-500 ${
          isDark ? "opacity-100" : "opacity-40"
        }`}
      />

      {/* 滑块 */}
      <div
        className={`h-6 w-6 transform rounded-full bg-white shadow-md theme-toggle-slider ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      />
    </div>
  )
}
