"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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
    projectionData: Array<{
      year: number
      assets: number
      fireTarget: number
      annualExpense: number
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
      <CardContent className="space-y-6" ref={resultsRef}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <p className="text-xs text-muted-foreground">目标退休年份: {results.targetRetirementYear} 年</p>
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

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">财务自由目标进度</h3>
          <div className="space-y-1">
            <Progress value={results.progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>{Math.round(results.progressPercentage)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">资产增长与财务自由目标对比</h3>
          <div className="h-[300px] w-full">
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
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => {
                      if (value === "assets") return "您的资产"
                      if (value === "fireTarget") return "财务自由目标（含通胀）"
                      if (value === "annualExpense") return "年支出（含通胀）"
                      return value
                    }}
                  />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis
                    tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={60}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
                  />
                  <Line
                    type="monotone"
                    dataKey="assets"
                    name="assets"
                    stroke="var(--color-assets)"
                    strokeWidth={2}
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
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="annualExpense"
                    name="annualExpense"
                    stroke="var(--color-annualExpense)"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="font-medium text-primary mb-2">{fireTypeData.label} 结果解读</h3>
          <p className="text-sm text-primary/80 mb-2">{fireTypeData.longDesc}</p>
          <p className="text-sm text-primary/80">
            根据您的财务状况，您需要 {formatCurrency(results.fireNumber)} 才能实现财务自由。 考虑到通货膨胀因素，在{" "}
            {results.fireYear} 年时，您需要积累 {formatCurrency(results.adjustedFireNumber)}。 按照您当前的储蓄率(
            {Math.round(results.savingsRate)}%)和投资回报预期，您可能在 {results.yearsToFire} 年后达到这一目标。
          </p>
        </div>

        {/* Watermark */}
        <div className="text-center text-xs text-muted-foreground mt-4 opacity-70">
          fire.stickic.top | FIRE财务自由计算器
        </div>
      </CardContent>
    </Card>
  )
}
