"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { fireTypeInfo } from "@/lib/fire-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useRef } from "react"
import { exportToImage } from "@/lib/export-utils"

interface FireResultsProps {
  results: {
    fireNumber: number
    adjustedFireNumber: number
    yearsToFire: number
    fireYear: number
    progressPercentage: number
    savingsRate: number
    futureAnnualExpense: number
    fireType: string
    targetRetirementYear: number
    legalRetirementYear: number
    projectionData: Array<{
      year: number
      age?: number
      assets: number
      fireTarget: number
      annualExpense: number
      stage?: string
      yearlyIncome?: number
      yearlyExpense?: number
      yearlySavings?: number
      investmentReturns?: number
      partTimeIncome?: number
      passiveIncome?: number
    }>
  }
}

export function FireResults({ results }: FireResultsProps) {
  const resultsRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Get current FIRE type info
  const fireTypeData = fireTypeInfo[results.fireType as keyof typeof fireTypeInfo] || fireTypeInfo.standard

  // Check if user can retire on time
  const canRetireOnTime = results.targetRetirementYear >= results.fireYear

  // Handle export to image
  const handleExport = async () => {
    if (resultsRef.current) {
      try {
        await exportToImage(resultsRef.current, "FIRE计算结果")
      } catch (error) {
        console.error("导出失败:", error)
        alert("导出图片失败，请稍后再试")
      }
    }
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{`年份: ${label} (${data.age}岁)`}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{`阶段: ${
            data.stage === "pre-fire"
              ? "FIRE前"
              : data.stage === "post-fire-pre-legal"
                ? "FIRE后法定退休前"
                : "法定退休后"
          }`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
          {data.yearlyIncome !== undefined && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400">年度详情:</p>
              <p className="text-xs">{`收入: ${formatCurrency(data.yearlyIncome || 0)}`}</p>
              <p className="text-xs">{`支出: ${formatCurrency(data.yearlyExpense || 0)}`}</p>
              <p className="text-xs">{`储蓄: ${formatCurrency(data.yearlySavings || 0)}`}</p>
              <p className="text-xs">{`投资收益: ${formatCurrency(data.investmentReturns || 0)}`}</p>
              {data.partTimeIncome > 0 && (
                <p className="text-xs">{`兼职收入: ${formatCurrency(data.partTimeIncome)}`}</p>
              )}
              {data.passiveIncome > 0 && <p className="text-xs">{`被动收入: ${formatCurrency(data.passiveIncome)}`}</p>}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Define specific colors for reference lines
  const referenceLineColors = {
    fireAchieved: "#FF6B00", // FIRE达成
    targetRetirement: "#2E8B57", // 目标退休
    legalRetirement: "#4682B4", // 法定退休
  }

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-primary">计算结果</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            {fireTypeData.label}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleExport} title="导出为图片">
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4" ref={resultsRef}>
        {/* Retirement Status Alert */}
        <div
          className={`p-3 rounded-lg border ${canRetireOnTime ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900" : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900"}`}
        >
          <p
            className={`text-sm font-medium ${canRetireOnTime ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}
          >
            {canRetireOnTime
              ? "您可以按时退休！"
              : `当前计划不足以让您按时退休...（晚${results.fireYear - results.targetRetirementYear}年）`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">所需财务自由资产（当前价值）</h3>
            <p className="text-2xl font-bold text-primary">{formatCurrency(results.fireNumber)}</p>
            <p className="text-xs text-muted-foreground">
              年支出的{Math.round(100 / fireTypeData.withdrawalRate)}倍（{fireTypeData.withdrawalRate}%提取率）
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">调整后的财务自由资产（未来价值）</h3>
            <p className="text-2xl font-bold text-primary">{formatCurrency(results.adjustedFireNumber)}</p>
            <p className="text-xs text-muted-foreground">考虑通货膨胀后的价值</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">预计达到财务自由所需年数</h3>
            <p className="text-2xl font-bold text-primary">{results.yearsToFire} 年</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">预计达到财务自由的年份</h3>
            <p className="text-2xl font-bold text-primary">{results.fireYear} 年</p>
            <p className="text-xs text-muted-foreground">
              目标退休年份: {results.targetRetirementYear} 年
              {results.targetRetirementYear < results.fireYear ? " (提前退休)" : ""}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">年储蓄率</h3>
            <p className="text-2xl font-bold text-primary">{Math.round(results.savingsRate)}%</p>
            <p className="text-xs text-muted-foreground">储蓄占税后收入的百分比</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">未来年支出（含通胀）</h3>
            <p className="text-2xl font-bold text-primary">{formatCurrency(results.futureAnnualExpense)}</p>
            <p className="text-xs text-muted-foreground">退休时的年支出</p>
          </div>
        </div>

        {/* Dynamic Progress Bar with positioned indicator */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">财务自由目标进度</h3>
          <div className="space-y-2">
            <div className="relative">
              <Progress value={Math.round(results.progressPercentage)} className="h-4" />
              {/* Dynamic progress indicator */}
              <div
                className="absolute top-5 transform -translate-x-1/2 transition-all duration-300"
                style={{
                  left: `${Math.min(Math.max(results.progressPercentage, 5), 95)}%`,
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-primary"></div>
                  <div className="text-sm font-medium text-primary bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border">
                    {Math.round(results.progressPercentage)}%
                  </div>
                  <div className="text-xs text-muted-foreground">当前进度</div>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-8">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Chart Section with optimized spacing */}
        <div className="space-y-2">
          <div className="h-[350px] w-full">
            <ChartContainer
              config={{
                assets: {
                  label: "您的资产",
                  color: "hsl(var(--chart-1))",
                },
                fireTarget: {
                  label: "财务自由目标（含通胀）",
                  color: "hsl(var(--chart-2))",
                },
                annualExpense: {
                  label: "年支出（含通胀）",
                  color: "hsl(43, 96%, 56%)",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={results.projectionData}
                  margin={{
                    top: 15,
                    right: 15,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <Legend
                    verticalAlign="top"
                    height={24}
                    formatter={(value) => {
                      if (value === "assets") return "您的资产"
                      if (value === "fireTarget") return "财务自由目标（含通胀）"
                      if (value === "annualExpense") return "年支出（含通胀）"
                      return value
                    }}
                  />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval="preserveStartEnd"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={75}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip content={<CustomTooltip />} />

                  {/* Reference lines with specific colors */}
                  <ReferenceLine
                    x={results.targetRetirementYear}
                    stroke={referenceLineColors.targetRetirement}
                    strokeDasharray="8 4"
                    strokeWidth={2}
                  />
                  <ReferenceLine
                    x={results.legalRetirementYear}
                    stroke={referenceLineColors.legalRetirement}
                    strokeDasharray="6 3"
                    strokeWidth={2}
                  />
                  {results.fireYear <= results.projectionData[results.projectionData.length - 1]?.year && (
                    <ReferenceLine
                      x={results.fireYear}
                      stroke={referenceLineColors.fireAchieved}
                      strokeDasharray="4 2"
                      strokeWidth={2}
                    />
                  )}

                  <Line
                    type="monotone"
                    dataKey="assets"
                    name="assets"
                    stroke="var(--color-assets)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fireTarget"
                    name="fireTarget"
                    stroke="var(--color-fireTarget)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="annualExpense"
                    name="annualExpense"
                    stroke="var(--color-annualExpense)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <h3 className="text-sm font-medium text-muted-foreground mt-2 text-center">资产增长轨迹</h3>

          {/* Reference Line Legend - positioned closer to chart */}
          <div className="flex flex-wrap justify-center gap-4 text-sm p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-0.5"
                style={{
                  background: `repeating-linear-gradient(to right, ${referenceLineColors.targetRetirement} 0, ${referenceLineColors.targetRetirement} 8px, transparent 8px, transparent 12px)`,
                }}
              ></div>
              <span style={{ color: referenceLineColors.targetRetirement }}>目标退休</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-0.5"
                style={{
                  background: `repeating-linear-gradient(to right, ${referenceLineColors.legalRetirement} 0, ${referenceLineColors.legalRetirement} 6px, transparent 6px, transparent 9px)`,
                }}
              ></div>
              <span style={{ color: referenceLineColors.legalRetirement }}>法定退休</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-0.5"
                style={{
                  background: `repeating-linear-gradient(to right, ${referenceLineColors.fireAchieved} 0, ${referenceLineColors.fireAchieved} 4px, transparent 4px, transparent 6px)`,
                }}
              ></div>
              <span style={{ color: referenceLineColors.fireAchieved }}>FIRE达成</span>
            </div>
          </div>
        </div>

        {/* Results interpretation section with reduced top margin */}
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="font-medium text-primary mb-2">{fireTypeData.label} 结果解读</h3>
          <p className="text-sm text-primary/80 mb-2">{fireTypeData.longDesc}</p>
          <p className="text-xs text-primary/80">
            根据您的财务状况，您需要 {formatCurrency(results.fireNumber)} 才能实现财务自由。 考虑到通货膨胀因素，在{" "}
            {results.fireYear} 年时，您需要积累 {formatCurrency(results.adjustedFireNumber)}。 按照您当前的储蓄率(
            {Math.round(results.savingsRate)}%)和投资回报预期，您可能在 {results.yearsToFire} 年后达到这一目标。
            {results.targetRetirementYear < results.fireYear
              ? ` 需要注意的是，您计划在 ${results.targetRetirementYear} 年退休，但此时您的资产还不足以支持完全退休。您可能需要考虑增加当前储蓄、提高投资回报率或依靠退休后的兼职收入来弥补差距。`
              : ` 您计划在 ${results.targetRetirementYear} 年退休，届时您的资产将足以支持您的退休生活。`}
            图表显示了您的资产轨迹直到100岁，包括各个阶段的收入变化和养老金的影响。
          </p>
        </div>

        {/* Watermark */}
        <div className="text-center text-xs text-muted-foreground mt-3 opacity-70">
          fire.stickic.top | FIRE财务自由计算器
        </div>
      </CardContent>
    </Card>
  )
}
