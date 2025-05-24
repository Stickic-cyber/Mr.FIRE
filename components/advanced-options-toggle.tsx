"use client"

import { Settings, SettingsIcon } from "lucide-react"
import { useState, useEffect } from "react"

interface AdvancedOptionsToggleProps {
  value: boolean
  onValueChange: (value: boolean) => void
}

export function AdvancedOptionsToggle({ value, onValueChange }: AdvancedOptionsToggleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleAdvanced = () => {
    onValueChange(!value)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">高级选项</span>
      <div
        className={`relative flex h-8 w-16 cursor-pointer items-center rounded-full p-1 shadow-inner transition-colors duration-300 ${
          value ? "bg-primary/20" : "bg-gray-200 dark:bg-gray-700"
        }`}
        onClick={toggleAdvanced}
        role="button"
        tabIndex={0}
        aria-label="切换高级选项"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleAdvanced()
          }
        }}
      >
        {/* 基础模式图标 */}
        <SettingsIcon
          className={`absolute left-1.5 h-5 w-5 transition-opacity duration-500 ${
            value ? "opacity-40 text-primary" : "opacity-100 text-gray-500"
          }`}
        />

        {/* 高级模式图标 */}
        <Settings
          className={`absolute right-1.5 h-5 w-5 transition-opacity duration-500 ${
            value ? "opacity-100 text-primary" : "opacity-40 text-blue-500"
          }`}
        />

        {/* 滑块 */}
        <div
          className={`h-6 w-6 transform rounded-full shadow-md transition-all duration-300 ease-in-out ${
            value ? "translate-x-8 bg-primary" : "translate-x-0 bg-white"
          }`}
        />
      </div>
    </div>
  )
}
