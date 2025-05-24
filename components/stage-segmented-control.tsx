"use client"

import { useState, useEffect } from "react"

export type IncomeStage = "pre-fire" | "post-fire-pre-legal" | "post-legal-retirement"

interface StageSegmentedControlProps {
  value: IncomeStage
  onValueChange: (value: IncomeStage) => void
}

const stages: { key: IncomeStage; label: string; shortLabel: string; description: string }[] = [
  {
    key: "pre-fire",
    label: "FIRE前收入阶段",
    shortLabel: "FIRE前",
    description: "在此阶段，您有正常的工作收入和收入增长",
  },
  {
    key: "post-fire-pre-legal",
    label: "FIRE后，法定退休前阶段",
    shortLabel: "FIRE后",
    description: "在此阶段，您已停止工作，主要依靠投资收益和兼职收入",
  },
  {
    key: "post-legal-retirement",
    label: "法定退休后阶段",
    shortLabel: "退休后",
    description: "在此阶段，您可以获得养老金，同时保持其他收入来源",
  },
]

export function StageSegmentedControl({ value, onValueChange }: StageSegmentedControlProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentStage = stages.find((stage) => stage.key === value)

  return (
    <div className="space-y-4">
      {/* Segmented Control */}
      <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-3 gap-1">
          {stages.map((stage, index) => (
            <button
              key={stage.key}
              onClick={() => onValueChange(stage.key)}
              className={`relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                stage.key === value
                  ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    stage.key === value ? "bg-primary" : "bg-gray-400 dark:bg-gray-600"
                  }`}
                />
                <span className="hidden sm:inline">{stage.label}</span>
                <span className="sm:hidden">{stage.shortLabel}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current stage description */}
      <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
        <p className="text-sm text-primary font-medium">当前阶段：{currentStage?.label}</p>
        <p className="text-xs text-primary/80 mt-1">{currentStage?.description}</p>
      </div>
    </div>
  )
}
