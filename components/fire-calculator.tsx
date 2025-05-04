"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { FireResults } from "@/components/fire-results"
import { FireTypeSelector } from "@/components/fire-type-selector"
import { type FireType, getFireTypeDefaults } from "@/lib/fire-types"

export function FireCalculator() {
  const [currentAge, setCurrentAge] = useState<number>(30)
  const [targetRetirementAge, setTargetRetirementAge] = useState<number>(45)
  const [currentAssets, setCurrentAssets] = useState<number>(100000)
  const [annualIncome, setAnnualIncome] = useState<number>(70000)
  const [annualSpending, setAnnualSpending] = useState<number>(40000)
  const [investmentReturn, setInvestmentReturn] = useState<number>(3)
  const [inflationRate, setInflationRate] = useState<number>(2.2)
  const [partTimeIncome, setPartTimeIncome] = useState<number>(0)
  const [incomeGrowthRate, setIncomeGrowthRate] = useState<number>(0)
  const [selectedFireType, setSelectedFireType] = useState<FireType>("standard")

  const [calculationResults, setCalculationResults] = useState<any>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  // 检测屏幕尺寸，用于响应式布局
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // 当FIRE类型改变时更新默认值
  useEffect(() => {
    const defaults = getFireTypeDefaults(selectedFireType)
    setAnnualSpending(defaults.annualSpending)
    setInvestmentReturn(defaults.investmentReturn)
    setPartTimeIncome(defaults.partTimeIncome)
    setIncomeGrowthRate(defaults.incomeGrowthRate)
  }, [selectedFireType])

  // 初始计算
  useEffect(() => {
    handleCalculate()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleCalculate = () => {
    // 计算FIRE数据
    const requiredFireAsset = annualSpending * 25
    const annualSavings = annualIncome - annualSpending

    // 计算达到FIRE所需年数
    let yearsToFire = 0
    let currentAssetsValue = currentAssets
    let fireYear = new Date().getFullYear()
    const projectionData = []

    // 添加起始点到预测数据
    projectionData.push({
      year: fireYear,
      assets: currentAssetsValue,
      fireTarget: requiredFireAsset,
      annualExpense: annualSpending,
    })

    // 根据FIRE类型调整计算逻辑
    let calculationLogic = "standard"
    if (selectedFireType === "barista") {
      calculationLogic = "barista"
    } else if (selectedFireType === "coast") {
      calculationLogic = "coast"
    }

    // 计算资产增长直到达到FIRE目标
    while (currentAssetsValue < requiredFireAsset && yearsToFire < 100) {
      yearsToFire++
      fireYear++

      // 计算当年收入（考虑收入增长）
      const yearlyIncome = annualIncome * Math.pow(1 + incomeGrowthRate / 100, yearsToFire)

      // 计算当年支出（考虑通货膨胀）
      const yearlyExpense = annualSpending * Math.pow(1 + inflationRate / 100, yearsToFire)

      // 计算当年储蓄
      let yearlySavings = yearlyIncome - yearlyExpense

      // 特殊FIRE类型的逻辑
      if (calculationLogic === "barista") {
        // Barista FIRE: 考虑兼职收入
        const yearlyPartTimeIncome = partTimeIncome * Math.pow(1 + incomeGrowthRate / 100, yearsToFire)
        yearlySavings += yearlyPartTimeIncome
      } else if (calculationLogic === "coast") {
        // Coast FIRE: 不再额外储蓄，只靠现有资产增长
        yearlySavings = 0
      }

      // 计算资产增长（考虑复利）
      currentAssetsValue = currentAssetsValue * (1 + investmentReturn / 100) + yearlySavings

      // 根据通胀调整FIRE目标
      const inflatedFireTarget = requiredFireAsset * Math.pow(1 + inflationRate / 100, yearsToFire)

      projectionData.push({
        year: fireYear,
        assets: Math.round(currentAssetsValue),
        fireTarget: Math.round(inflatedFireTarget),
        annualExpense: Math.round(yearlyExpense),
      })
    }

    // 计算通胀调整后的FIRE资产
    const adjustedFireAsset = requiredFireAsset * Math.pow(1 + inflationRate / 100, yearsToFire)

    // 计算进度百分比
    const progressPercentage = Math.min(100, (currentAssets / requiredFireAsset) * 100)

    // 计算储蓄率
    const savingsRate = annualIncome > 0 ? ((annualIncome - annualSpending) / annualIncome) * 100 : 0

    // 计算未来年支出（考虑通货膨胀）
    const futureAnnualExpense = annualSpending * Math.pow(1 + inflationRate / 100, yearsToFire)

    const results = {
      requiredFireAsset,
      adjustedFireAsset,
      yearsToFire,
      fireYear,
      progressPercentage,
      projectionData,
      savingsRate,
      futureAnnualExpense,
      fireType: selectedFireType,
    }

    setCalculationResults(results)
  }

  // 当FIRE类型或相关输入改变时重新计算
  useEffect(() => {
    handleCalculate()
  }, [selectedFireType, partTimeIncome, incomeGrowthRate])

  return (
    <div className={`${isMobile ? "flex flex-col space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}`}>
      {/* 左侧输入表单 */}
      <div className="lg:pr-4">
        <Card className="border-green-200 dark:border-green-900 shadow-md h-full">
          <CardContent className="pt-6">
            <div className="grid gap-6">
              {/* FIRE类型选择器 */}
              <div className="space-y-2">
                <Label htmlFor="fireType">FIRE 类型选择</Label>
                <FireTypeSelector value={selectedFireType} onValueChange={setSelectedFireType} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentAge">当前年龄</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="border-green-200 dark:border-green-900 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetRetirementAge">目标退休年龄</Label>
                  <Input
                    id="targetRetirementAge"
                    type="number"
                    value={targetRetirementAge}
                    onChange={(e) => setTargetRetirementAge(Number(e.target.value))}
                    className="border-green-200 dark:border-green-900 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAssets">当前总资产</Label>
                <Input
                  id="currentAssets"
                  type="number"
                  value={currentAssets}
                  onChange={(e) => setCurrentAssets(Number(e.target.value))}
                  className="border-green-200 dark:border-green-900 focus:border-green-500 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(currentAssets)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">税后年收入</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                    className="border-green-200 dark:border-green-900 focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(annualIncome)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualSpending">年支出</Label>
                  <Input
                    id="annualSpending"
                    type="number"
                    value={annualSpending}
                    onChange={(e) => setAnnualSpending(Number(e.target.value))}
                    className="border-green-200 dark:border-green-900 focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(annualSpending)}</p>
                </div>
              </div>

              {/* 根据FIRE类型显示额外字段 */}
              {selectedFireType === "barista" && (
                <div className="space-y-2">
                  <Label htmlFor="partTimeIncome">兼职年收入</Label>
                  <Input
                    id="partTimeIncome"
                    type="number"
                    value={partTimeIncome}
                    onChange={(e) => setPartTimeIncome(Number(e.target.value))}
                    className="border-green-200 dark:border-green-900 focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(partTimeIncome)}</p>
                </div>
              )}

              {selectedFireType !== "coast" && (
                <div className="space-y-2">
                  <Label htmlFor="incomeGrowthRate">收入年增长率 (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="incomeGrowthRate"
                      min={0}
                      max={10}
                      step={0.1}
                      value={[incomeGrowthRate]}
                      onValueChange={(value) => setIncomeGrowthRate(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-medium">{incomeGrowthRate}%</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="investmentReturn">预期年投资回报率 (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="investmentReturn"
                    min={0}
                    max={20}
                    step={0.1}
                    value={[investmentReturn]}
                    onValueChange={(value) => setInvestmentReturn(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-medium">{investmentReturn}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inflationRate">预期通货膨胀率 (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="inflationRate"
                    min={0}
                    max={10}
                    step={0.1}
                    value={[inflationRate]}
                    onValueChange={(value) => setInflationRate(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-medium">{inflationRate}%</span>
                </div>
              </div>

              <Button
                onClick={handleCalculate}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
              >
                计算财务自由数据
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧计算结果 */}
      <div className="lg:pl-4">
        {calculationResults && (
          <FireResults results={calculationResults} annualSpending={annualSpending} currentAssets={currentAssets} />
        )}
      </div>
    </div>
  )
}
