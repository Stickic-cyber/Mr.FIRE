"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { fireTypeInfo } from "@/lib/fire-types"

interface FireResultsProps {
  results: {
    requiredFireAsset: number
    adjustedFireAsset: number
    yearsToFire: number
    fireYear: number
    progressPercentage: number
    savingsRate: number
    futureAnnualExpense: number
    fireType: string
    projectionData: Array<{
      year: number
      assets: number
      fireTarget: number
      annualExpense: number
    }>
  }
  annualSpending: number
  currentAssets: number
}

export function FireResults({ results, annualSpending, currentAssets }: FireResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // 格式化图表数据
  const chartData = results.projectionData.map((item) => ({
    year: item.year,
    assets: item.assets,
    fireTarget: item.fireTarget,
    annualExpense: item.annualExpense,
  }))

  // 获取当前FIRE类型信息
  const fireTypeData = fireTypeInfo[results.fireType as keyof typeof fireTypeInfo] || fireTypeInfo.standard

  return (
    <Card className="border-green-200 dark:border-green-900 shadow-md h-full">
      <CardContent className="pt-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-700 dark:text-green-500">计算结果</h2>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
            {fireTypeData.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">所需财务自由资产（当前价值）</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-500">
              {formatCurrency(results.requiredFireAsset)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">年支出的25倍</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">调整后的财务自由资产（未来价值）</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-500">
              {formatCurrency(results.adjustedFireAsset)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">考虑通货膨胀后的价值</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">预计达到财务自由所需年数</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-500">{results.yearsToFire} 年</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">预计达到财务自由的年份</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-500">{results.fireYear} 年</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">年储蓄率</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-500">{Math.round(results.savingsRate)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">储蓄占税后收入的百分比</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">未来年支出（含通胀）</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-500">
              {formatCurrency(results.futureAnnualExpense)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">退休时的年支出</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">财务自由目标进度</h3>
          <div className="space-y-1">
            <Progress
              value={results.progressPercentage}
              className="h-2 bg-gray-100 dark:bg-gray-800"
              indicatorClassName="bg-green-600 dark:bg-green-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{formatCurrency(currentAssets)}</span>
              <span>{formatCurrency(results.requiredFireAsset)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">资产增长与财务自由目标对比</h3>
          <div className="h-[300px] w-full mt-2">
            <ChartContainer
              config={{
                assets: {
                  label: "您的资产",
                  color: "hsl(142, 76%, 36%)",
                },
                fireTarget: {
                  label: "财务自由目标（含通胀）",
                  color: "hsl(0, 84%, 60%)",
                },
                annualExpense: {
                  label: "年支出（含通胀）",
                  color: "hsl(43, 96%, 56%)",
                },
              }}
            >
              <LineChart
                data={chartData}
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
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
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
            </ChartContainer>
          </div>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900">
          <h3 className="font-medium text-green-800 dark:text-green-400 mb-2">结果解读 - {fireTypeData.label}</h3>
          <p className="text-sm text-green-700 dark:text-green-500 mb-2">{fireTypeData.longDesc}</p>
          <p className="text-sm text-green-700 dark:text-green-500">
            根据您的财务状况，您需要 {formatCurrency(results.requiredFireAsset)} 才能实现财务自由。
            考虑到通货膨胀因素，在 {results.fireYear} 年时，您需要积累 {formatCurrency(results.adjustedFireAsset)}。
            按照您当前的储蓄率({Math.round(results.savingsRate)}%)和投资回报预期，您可能在 {results.yearsToFire}{" "}
            年后达到这一目标。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
