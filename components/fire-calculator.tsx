"use client"

import { useState, useEffect, type ChangeEvent, useCallback } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { FireTypeSelector } from "./fire-type-selector"
import { FireResults } from "./fire-results"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { type FireType, getFireTypeDefaults } from "@/lib/fire-types"
import { calculateFireResults } from "@/lib/fire-calculations"

export function FireCalculator() {
  // Basic inputs
  const [currentAge, setCurrentAge] = useState<number>(30)
  const [targetRetirementAge, setTargetRetirementAge] = useState<number>(45)
  const [currentSavings, setCurrentSavings] = useState<number>(100000)
  const [annualIncome, setAnnualIncome] = useState<number>(100000)
  const [annualExpenses, setAnnualExpenses] = useState<number>(40000)
  // Rate inputs
  const [incomeGrowthRate, setIncomeGrowthRate] = useState<number>(2)
  const [investmentReturn, setInvestmentReturn] = useState<number>(7)
  const [inflationRate, setInflationRate] = useState<number>(3)
  const [partTimeIncome, setPartTimeIncome] = useState<number>(0)
  const [partTimeIncomeGrowthRate, setPartTimeIncomeGrowthRate] = useState<number>(1)

  // FIRE type
  const [selectedFireType, setSelectedFireType] = useState<FireType>("standard")

  // Results and validation
  const [calculationResults, setCalculationResults] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState<boolean>(false)

  // Update defaults when FIRE type changes
  useEffect(() => {
    const defaults = getFireTypeDefaults(selectedFireType)
    setAnnualExpenses(defaults.annualExpenses)
    setInvestmentReturn(defaults.investmentReturn)
    setPartTimeIncome(defaults.partTimeIncome)
    setIncomeGrowthRate(defaults.incomeGrowthRate)
    setPartTimeIncomeGrowthRate(defaults.partTimeIncomeGrowthRate)
  }, [selectedFireType])

  // Handle number input changes with leading zero removal
  const handleNumberChange = useCallback((e: ChangeEvent<HTMLInputElement>, setter: (value: number) => void) => {
    const value = e.target.value

    // Remove leading zeros (except for "0" itself or decimal values like "0.x")
    let cleanedValue = value
    if (value.length > 1 && value.startsWith("0") && !value.startsWith("0.")) {
      cleanedValue = value.replace(/^0+/, "")
    }

    // Update the input value if it's a valid number or empty
    if (cleanedValue === "" || !isNaN(Number(cleanedValue))) {
      e.target.value = cleanedValue
      setter(cleanedValue === "" ? 0 : Number(cleanedValue))
    }
  }, [])

  // Optimized percentage input handler
  const handlePercentageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, setter: (value: number) => void, min: number, max: number) => {
      let value = e.target.value

      // Handle special case for negative sign alone
      if (value === "-") {
        e.target.value = value
        return // Don't update state yet, wait for more input
      }

      // Remove % symbol if present
      if (value.includes("%")) {
        value = value.replace(/%/g, "")
      }

      // Check if the value is a valid number
      if (value === "" || !isNaN(Number(value))) {
        const numValue = value === "" ? 0 : Number(value)

        // Apply min/max constraints
        if (numValue >= min && numValue <= max) {
          setter(numValue)
        }
      }
    },
    [],
  )

  // Format percentage value for display
  const formatPercentage = useCallback((value: number): string => {
    // Use a more efficient way to format the percentage
    return value.toFixed(1)
  }, [])

  // Validate inputs - optimized to reduce unnecessary work
  const validateInputs = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (currentAge < 0 || currentAge > 100) {
      newErrors.currentAge = "年龄必须在0-100之间"
    }

    if (targetRetirementAge <= currentAge || targetRetirementAge > 100) {
      newErrors.targetRetirementAge = "退休年龄必须大于当前年龄且不超过100"
    }

    if (currentSavings < 0) {
      newErrors.currentSavings = "当前储蓄不能为负数"
    }

    if (annualIncome < 0) {
      newErrors.annualIncome = "年收入不能为负数"
    }

    if (annualExpenses < 0) {
      newErrors.annualExpenses = "年支出不能为负数"
    }

    if (incomeGrowthRate < -20 || incomeGrowthRate > 50) {
      newErrors.incomeGrowthRate = "收入增长率必须在-20%到50%之间"
    }

    if (partTimeIncomeGrowthRate < -20 || partTimeIncomeGrowthRate > 50) {
      newErrors.partTimeIncomeGrowthRate = "兼职收入增长率必须在-20%到50%之间"
    }

    if (investmentReturn < -20 || investmentReturn > 20) {
      newErrors.investmentReturn = "投资回报率必须在-20%到20%之间"
    }

    if (inflationRate < -5 || inflationRate > 15) {
      newErrors.inflationRate = "通货膨胀率必须在-5%到15%之间"
    }

    if (partTimeIncome < 0) {
      newErrors.partTimeIncome = "兼职收入不能为负数"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [
    currentAge,
    targetRetirementAge,
    currentSavings,
    annualIncome,
    annualExpenses,
    incomeGrowthRate,
    partTimeIncomeGrowthRate,
    investmentReturn,
    inflationRate,
    partTimeIncome,
  ])

  // Handle calculation
  const handleCalculate = useCallback(() => {
    if (!validateInputs()) {
      setShowResults(false)
      return
    }

    const results = calculateFireResults({
      currentAge,
      targetRetirementAge,
      currentSavings,
      annualIncome,
      annualExpenses,
      annualSavings: annualIncome - annualExpenses,
      incomeGrowthRate,
      investmentReturn,
      inflationRate,
      partTimeIncome,
      partTimeIncomeGrowthRate,
      fireType: selectedFireType,
    })

    setCalculationResults(results)
    setShowResults(true)
  }, [
    validateInputs,
    currentAge,
    targetRetirementAge,
    currentSavings,
    annualIncome,
    annualExpenses,
    incomeGrowthRate,
    investmentReturn,
    inflationRate,
    partTimeIncome,
    partTimeIncomeGrowthRate,
    selectedFireType,
  ])

  // Reset form
  const handleReset = useCallback(() => {
    setCurrentAge(30)
    setTargetRetirementAge(45)
    setCurrentSavings(100000)
    setAnnualIncome(100000)
    setAnnualExpenses(40000)
    setIncomeGrowthRate(2)
    setInvestmentReturn(7)
    setInflationRate(3)
    setPartTimeIncome(0)
    setPartTimeIncomeGrowthRate(1)
    setSelectedFireType("standard")
    setErrors({})
    setShowResults(false)
  }, [])

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      maximumFractionDigits: 0,
    }).format(value)
  }, [])

  // Optimized slider value change handler
  const handleSliderChange = useCallback((value: number[], setter: (value: number) => void) => {
    // Debounce slider updates for negative values to prevent excessive re-renders
    setter(value[0])
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <div>
        <Card className="shadow-md h-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">FIRE 计算器</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* FIRE Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="fireType">FIRE 类型选择</Label>
              <FireTypeSelector value={selectedFireType} onValueChange={setSelectedFireType} />
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentAge">当前年龄</Label>
                <Input
                  id="currentAge"
                  type="text"
                  inputMode="numeric"
                  value={currentAge}
                  onChange={(e) => handleNumberChange(e, setCurrentAge)}
                  className={errors.currentAge ? "border-red-500" : ""}
                />
                {errors.currentAge && <p className="text-xs text-red-500">{errors.currentAge}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRetirementAge">目标退休年龄</Label>
                <Input
                  id="targetRetirementAge"
                  type="text"
                  inputMode="numeric"
                  value={targetRetirementAge}
                  onChange={(e) => handleNumberChange(e, setTargetRetirementAge)}
                  className={errors.targetRetirementAge ? "border-red-500" : ""}
                />
                {errors.targetRetirementAge && <p className="text-xs text-red-500">{errors.targetRetirementAge}</p>}
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-2">
              <Label htmlFor="currentSavings">当前储蓄</Label>
              <Input
                id="currentSavings"
                type="text"
                inputMode="numeric"
                value={currentSavings}
                onChange={(e) => handleNumberChange(e, setCurrentSavings)}
                className={errors.currentSavings ? "border-red-500" : ""}
              />
              {errors.currentSavings && <p className="text-xs text-red-500">{errors.currentSavings}</p>}
              <p className="text-xs text-muted-foreground">{formatCurrency(currentSavings)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualIncome">年收入（退休后归零）</Label>
                <Input
                  id="annualIncome"
                  type="text"
                  inputMode="numeric"
                  value={annualIncome}
                  onChange={(e) => handleNumberChange(e, setAnnualIncome)}
                  className={errors.annualIncome ? "border-red-500" : ""}
                />
                {errors.annualIncome && <p className="text-xs text-red-500">{errors.annualIncome}</p>}
                <p className="text-xs text-muted-foreground">{formatCurrency(annualIncome)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualExpenses">年支出</Label>
                <Input
                  id="annualExpenses"
                  type="text"
                  inputMode="numeric"
                  value={annualExpenses}
                  onChange={(e) => handleNumberChange(e, setAnnualExpenses)}
                  className={errors.annualExpenses ? "border-red-500" : ""}
                />
                {errors.annualExpenses && <p className="text-xs text-red-500">{errors.annualExpenses}</p>}
                <p className="text-xs text-muted-foreground">{formatCurrency(annualExpenses)}</p>
              </div>
            </div>

            {/* Part-time income field - now shown for all FIRE types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partTimeIncome">兼职收入</Label>
                <Input
                  id="partTimeIncome"
                  type="text"
                  inputMode="numeric"
                  value={partTimeIncome}
                  onChange={(e) => handleNumberChange(e, setPartTimeIncome)}
                  className={errors.partTimeIncome ? "border-red-500" : ""}
                />
                {errors.partTimeIncome && <p className="text-xs text-red-500">{errors.partTimeIncome}</p>}
                <p className="text-xs text-muted-foreground">{formatCurrency(partTimeIncome)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partTimeIncomeGrowthRate">兼职收入年增长率 (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="partTimeIncomeGrowthRate"
                    min={-20}
                    max={50}
                    step={0.1}
                    value={[partTimeIncomeGrowthRate]}
                    onValueChange={(value) => handleSliderChange(value, setPartTimeIncomeGrowthRate)}
                    className={`flex-1 ${errors.partTimeIncomeGrowthRate ? "border-red-500" : ""}`}
                  />
                  <div className="relative w-20">
                    <Input
                      type="text"
                      value={formatPercentage(partTimeIncomeGrowthRate)}
                      onChange={(e) => handlePercentageChange(e, setPartTimeIncomeGrowthRate, -20, 50)}
                      className="pr-6 text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
                  </div>
                </div>
                {errors.partTimeIncomeGrowthRate && (
                  <p className="text-xs text-red-500">{errors.partTimeIncomeGrowthRate}</p>
                )}
              </div>
            </div>

            {/* Rate Inputs with both slider and direct input - Optimized for negative values */}
            {selectedFireType !== "coast" && (
              <div className="space-y-2">
                <Label htmlFor="incomeGrowthRate">工作收入年增长率 (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="incomeGrowthRate"
                    min={-20}
                    max={50}
                    step={0.1}
                    value={[incomeGrowthRate]}
                    onValueChange={(value) => handleSliderChange(value, setIncomeGrowthRate)}
                    className={`flex-1 ${errors.incomeGrowthRate ? "border-red-500" : ""}`}
                  />
                  <div className="relative w-20">
                    <Input
                      type="text"
                      value={formatPercentage(incomeGrowthRate)}
                      onChange={(e) => handlePercentageChange(e, setIncomeGrowthRate, -20, 50)}
                      className="pr-6 text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
                  </div>
                </div>
                {errors.incomeGrowthRate && <p className="text-xs text-red-500">{errors.incomeGrowthRate}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="investmentReturn">预期年投资回报率 (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="investmentReturn"
                  min={-20}
                  max={20}
                  step={0.1}
                  value={[investmentReturn]}
                  onValueChange={(value) => handleSliderChange(value, setInvestmentReturn)}
                  className={`flex-1 ${errors.investmentReturn ? "border-red-500" : ""}`}
                />
                <div className="relative w-20">
                  <Input
                    type="text"
                    value={formatPercentage(investmentReturn)}
                    onChange={(e) => handlePercentageChange(e, setInvestmentReturn, -20, 20)}
                    className="pr-6 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
                </div>
              </div>
              {errors.investmentReturn && <p className="text-xs text-red-500">{errors.investmentReturn}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inflationRate">预期通货膨胀率 (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="inflationRate"
                  min={-5}
                  max={15}
                  step={0.1}
                  value={[inflationRate]}
                  onValueChange={(value) => handleSliderChange(value, setInflationRate)}
                  className={`flex-1 ${errors.inflationRate ? "border-red-500" : ""}`}
                />
                <div className="relative w-20">
                  <Input
                    type="text"
                    value={formatPercentage(inflationRate)}
                    onChange={(e) => handlePercentageChange(e, setInflationRate, -5, 15)}
                    className="pr-6 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
                </div>
              </div>
              {errors.inflationRate && <p className="text-xs text-red-500">{errors.inflationRate}</p>}
            </div>

            {/* Error Alert */}
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>请修正表单中的错误后再计算</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
            <Button onClick={handleCalculate}>计算</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Results */}
      <div>{showResults && calculationResults && <FireResults results={calculationResults} />}</div>
    </div>
  )
}
