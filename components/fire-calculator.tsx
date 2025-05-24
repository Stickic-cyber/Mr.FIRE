"use client"

import { useState, useEffect, type ChangeEvent, useCallback } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { FireTypeSelector } from "./fire-type-selector"
import { FireResults } from "./fire-results"
import { AdvancedOptionsToggle } from "./advanced-options-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { type FireType, getFireTypeDefaults } from "@/lib/fire-types"
import { calculateFireResults } from "@/lib/fire-calculations"
import { StageSegmentedControl, type IncomeStage } from "./stage-segmented-control"

// Define stage-specific data structure
interface StageData {
  currentSavings: number
  annualIncome: number
  annualExpenses: number
  incomeGrowthRate: number
  partTimeIncome: number
  partTimeIncomeGrowthRate: number
  passiveIncome: number
  passiveIncomeGrowthRate: number
  pension: number
  pensionGrowthRate: number
  investmentAmount: number
  investmentReturn: number
}

export function FireCalculator() {
  // Basic inputs (shared across stages)
  const [currentAge, setCurrentAge] = useState<number>(30)
  const [targetRetirementAge, setTargetRetirementAge] = useState<number>(45)
  const [legalRetirementAge, setLegalRetirementAge] = useState<number>(65)
  const [inflationRate, setInflationRate] = useState<number>(3)

  // Advanced options
  const [advancedMode, setAdvancedMode] = useState<boolean>(false)
  const [incomeStage, setIncomeStage] = useState<IncomeStage>("pre-fire")

  // FIRE type
  const [selectedFireType, setSelectedFireType] = useState<FireType>("standard")

  // Stage-specific data (independent for each stage)
  const [stageData, setStageData] = useState<Record<IncomeStage, StageData>>({
    "pre-fire": {
      currentSavings: 100000,
      annualIncome: 100000,
      annualExpenses: 40000,
      incomeGrowthRate: 2,
      partTimeIncome: 0,
      partTimeIncomeGrowthRate: 1,
      passiveIncome: 0,
      passiveIncomeGrowthRate: 2,
      pension: 0,
      pensionGrowthRate: 3,
      investmentAmount: 0,
      investmentReturn: 7,
    },
    "post-fire-pre-legal": {
      currentSavings: 0, // Not used in this stage
      annualIncome: 0, // Not used in this stage
      annualExpenses: 40000,
      incomeGrowthRate: 0, // Not used in this stage
      partTimeIncome: 0,
      partTimeIncomeGrowthRate: 1,
      passiveIncome: 0,
      passiveIncomeGrowthRate: 2,
      pension: 0,
      pensionGrowthRate: 3,
      investmentAmount: 0,
      investmentReturn: 7,
    },
    "post-legal-retirement": {
      currentSavings: 0, // Not used in this stage
      annualIncome: 0, // Not used in this stage
      annualExpenses: 40000,
      incomeGrowthRate: 0, // Not used in this stage
      partTimeIncome: 0,
      partTimeIncomeGrowthRate: 1,
      passiveIncome: 0,
      passiveIncomeGrowthRate: 2,
      pension: 0,
      pensionGrowthRate: 3,
      investmentAmount: 0,
      investmentReturn: 7,
    },
  })

  // Results and validation
  const [calculationResults, setCalculationResults] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState<boolean>(false)

  // Get current stage data
  const currentStageData = stageData[incomeStage]

  // Update stage data
  const updateStageData = useCallback(
    (field: keyof StageData, value: number) => {
      setStageData((prev) => ({
        ...prev,
        [incomeStage]: {
          ...prev[incomeStage],
          [field]: value,
        },
      }))
    },
    [incomeStage],
  )

  // Update defaults when FIRE type changes
  useEffect(() => {
    const defaults = getFireTypeDefaults(selectedFireType)

    // Update all stages with new defaults
    setStageData((prev) => ({
      "pre-fire": {
        ...prev["pre-fire"],
        annualExpenses: defaults.annualExpenses,
        investmentReturn: defaults.investmentReturn,
        partTimeIncome: defaults.partTimeIncome,
        incomeGrowthRate: defaults.incomeGrowthRate,
        partTimeIncomeGrowthRate: defaults.partTimeIncomeGrowthRate,
        passiveIncome: defaults.passiveIncome,
        passiveIncomeGrowthRate: defaults.passiveIncomeGrowthRate,
        investmentAmount: defaults.investmentAmount,
        pension: defaults.pension,
        pensionGrowthRate: defaults.pensionGrowthRate,
      },
      "post-fire-pre-legal": {
        ...prev["post-fire-pre-legal"],
        annualExpenses: defaults.annualExpenses,
        investmentReturn: defaults.investmentReturn,
        partTimeIncome: defaults.partTimeIncome,
        partTimeIncomeGrowthRate: defaults.partTimeIncomeGrowthRate,
        passiveIncome: defaults.passiveIncomeGrowthRate,
        investmentAmount: defaults.investmentAmount,
        pension: defaults.pension,
        pensionGrowthRate: defaults.pensionGrowthRate,
      },
      "post-legal-retirement": {
        ...prev["post-legal-retirement"],
        annualExpenses: defaults.annualExpenses,
        investmentReturn: defaults.investmentReturn,
        partTimeIncome: defaults.partTimeIncome,
        partTimeIncomeGrowthRate: defaults.partTimeIncomeGrowthRate,
        passiveIncome: defaults.passiveIncomeGrowthRate,
        investmentAmount: defaults.investmentAmount,
        pension: defaults.pension,
        pensionGrowthRate: defaults.pensionGrowthRate,
      },
    }))
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

    if (advancedMode && (legalRetirementAge <= currentAge || legalRetirementAge > 100)) {
      newErrors.legalRetirementAge = "法定退休年龄必须大于当前年龄且不超过100"
    }

    // Validate current savings only for pre-fire stage
    if (!advancedMode || incomeStage === "pre-fire") {
      if (currentStageData.currentSavings < 0) {
        newErrors.currentSavings = "当前储蓄不能为负数"
      }
    }

    // Validate annual income only for pre-fire stage
    if (!advancedMode || incomeStage === "pre-fire") {
      if (currentStageData.annualIncome < 0) {
        newErrors.annualIncome = "年收入不能为负数"
      }
    }

    if (currentStageData.annualExpenses < 0) {
      newErrors.annualExpenses = "年支出不能为负数"
    }

    // Validate income growth rate only for pre-fire stage
    if (!advancedMode || incomeStage === "pre-fire") {
      if (currentStageData.incomeGrowthRate < -20 || currentStageData.incomeGrowthRate > 50) {
        newErrors.incomeGrowthRate = "收入增长率必须在-20%到50%之间"
      }
    }

    if (currentStageData.partTimeIncomeGrowthRate < -20 || currentStageData.partTimeIncomeGrowthRate > 50) {
      newErrors.partTimeIncomeGrowthRate = "兼职收入增长率必须在-20%到50%之间"
    }

    if (currentStageData.passiveIncomeGrowthRate < -20 || currentStageData.passiveIncomeGrowthRate > 50) {
      newErrors.passiveIncomeGrowthRate = "被动收入增长率必须在-20%到50%之间"
    }

    if (currentStageData.pensionGrowthRate < -20 || currentStageData.pensionGrowthRate > 50) {
      newErrors.pensionGrowthRate = "养老金增长率必须在-20%到50%之间"
    }

    if (currentStageData.investmentReturn < -20 || currentStageData.investmentReturn > 20) {
      newErrors.investmentReturn = "投资回报率必须在-20%到20%之间"
    }

    if (inflationRate < -5 || inflationRate > 15) {
      newErrors.inflationRate = "通货膨胀率必须在-5%到15%之间"
    }

    if (currentStageData.partTimeIncome < 0) {
      newErrors.partTimeIncome = "兼职收入不能为负数"
    }

    if (currentStageData.passiveIncome < 0) {
      newErrors.passiveIncome = "被动收入不能为负数"
    }

    if (currentStageData.investmentAmount < 0) {
      newErrors.investmentAmount = "投资金额不能为负数"
    }

    if (currentStageData.pension < 0) {
      newErrors.pension = "养老金不能为负数"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [currentAge, targetRetirementAge, legalRetirementAge, currentStageData, inflationRate, advancedMode, incomeStage])

  // Handle calculation
  const handleCalculate = useCallback(() => {
    if (!validateInputs()) {
      setShowResults(false)
      return
    }

    // Use pre-fire stage data for calculation (as it represents the starting point)
    const preFIREData = stageData["pre-fire"]
    const postFIREData = stageData["post-fire-pre-legal"]
    const postLegalData = stageData["post-legal-retirement"]

    const results = calculateFireResults({
      currentAge,
      targetRetirementAge,
      legalRetirementAge,
      currentSavings: preFIREData.currentSavings,
      annualIncome: preFIREData.annualIncome,
      annualExpenses: preFIREData.annualExpenses,
      annualSavings: preFIREData.annualIncome - preFIREData.annualExpenses,
      incomeGrowthRate: preFIREData.incomeGrowthRate,
      investmentReturn: preFIREData.investmentReturn,
      inflationRate,
      partTimeIncome: preFIREData.partTimeIncome,
      partTimeIncomeGrowthRate: preFIREData.partTimeIncomeGrowthRate,
      passiveIncome: preFIREData.passiveIncome,
      passiveIncomeGrowthRate: preFIREData.passiveIncomeGrowthRate,
      investmentAmount: preFIREData.investmentAmount,
      pension: postLegalData.pension,
      pensionGrowthRate: postLegalData.pensionGrowthRate,
      fireType: selectedFireType,
      advancedMode,
      incomeStage,
      stageData, // Pass all stage data for advanced calculations
    })

    setCalculationResults(results)
    setShowResults(true)
  }, [
    validateInputs,
    currentAge,
    targetRetirementAge,
    legalRetirementAge,
    stageData,
    inflationRate,
    selectedFireType,
    advancedMode,
    incomeStage,
  ])

  // Reset form
  const handleReset = useCallback(() => {
    setCurrentAge(30)
    setTargetRetirementAge(45)
    setLegalRetirementAge(65)
    setInflationRate(3)
    setAdvancedMode(false)
    setIncomeStage("pre-fire")
    setSelectedFireType("standard")

    // Reset all stage data
    setStageData({
      "pre-fire": {
        currentSavings: 100000,
        annualIncome: 100000,
        annualExpenses: 40000,
        incomeGrowthRate: 2,
        partTimeIncome: 0,
        partTimeIncomeGrowthRate: 1,
        passiveIncome: 0,
        passiveIncomeGrowthRate: 2,
        pension: 0,
        pensionGrowthRate: 3,
        investmentAmount: 0,
        investmentReturn: 7,
      },
      "post-fire-pre-legal": {
        currentSavings: 0,
        annualIncome: 0,
        annualExpenses: 40000,
        incomeGrowthRate: 0,
        partTimeIncome: 0,
        partTimeIncomeGrowthRate: 1,
        passiveIncome: 0,
        passiveIncomeGrowthRate: 2,
        pension: 0,
        pensionGrowthRate: 3,
        investmentAmount: 0,
        investmentReturn: 7,
      },
      "post-legal-retirement": {
        currentSavings: 0,
        annualIncome: 0,
        annualExpenses: 40000,
        incomeGrowthRate: 0,
        partTimeIncome: 0,
        partTimeIncomeGrowthRate: 1,
        passiveIncome: 0,
        passiveIncomeGrowthRate: 2,
        pension: 0,
        pensionGrowthRate: 3,
        investmentAmount: 0,
        investmentReturn: 7,
      },
    })

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
  const handleSliderChange = useCallback(
    (value: number[], field: keyof StageData) => {
      updateStageData(field, value[0])
    },
    [updateStageData],
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <div>
        <Card className="shadow-md h-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-primary">FIRE 计算器</CardTitle>
              <AdvancedOptionsToggle value={advancedMode} onValueChange={setAdvancedMode} />
            </div>
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

            {/* Advanced Mode: Legal Retirement Age */}
            {advancedMode && (
              <div className="space-y-2">
                <Label htmlFor="legalRetirementAge">法定退休年龄</Label>
                <Input
                  id="legalRetirementAge"
                  type="text"
                  inputMode="numeric"
                  value={legalRetirementAge}
                  onChange={(e) => handleNumberChange(e, setLegalRetirementAge)}
                  className={errors.legalRetirementAge ? "border-red-500" : ""}
                />
                {errors.legalRetirementAge && <p className="text-xs text-red-500">{errors.legalRetirementAge}</p>}
                <p className="text-xs text-muted-foreground">法定退休年龄是国家规定的正式退休年龄，通常为60-65岁</p>
              </div>
            )}

            {/* Advanced Mode: Stage Selector */}
            {advancedMode && (
              <div className="space-y-2">
                <Label>收入阶段选择</Label>
                <StageSegmentedControl value={incomeStage} onValueChange={setIncomeStage} />
              </div>
            )}

            {/* Current Savings - Only show in basic mode or pre-fire stage */}
            {(!advancedMode || incomeStage === "pre-fire") && (
              <div className="space-y-2">
                <Label htmlFor="currentSavings">当前储蓄</Label>
                <Input
                  id="currentSavings"
                  type="text"
                  inputMode="numeric"
                  value={currentStageData.currentSavings}
                  onChange={(e) => handleNumberChange(e, (value) => updateStageData("currentSavings", value))}
                  className={errors.currentSavings ? "border-red-500" : ""}
                />
                {errors.currentSavings && <p className="text-xs text-red-500">{errors.currentSavings}</p>}
              </div>
            )}

            {/* Stage-based Income Fields */}
            {(!advancedMode || incomeStage === "pre-fire") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">年收入（FIRE后归零）</Label>
                  <Input
                    id="annualIncome"
                    type="text"
                    inputMode="numeric"
                    value={currentStageData.annualIncome}
                    onChange={(e) => handleNumberChange(e, (value) => updateStageData("annualIncome", value))}
                    className={errors.annualIncome ? "border-red-500" : ""}
                  />
                  {errors.annualIncome && <p className="text-xs text-red-500">{errors.annualIncome}</p>}
                  <p className="text-xs text-muted-foreground">
                    年收入是您每年的税后收入，{advancedMode ? "FIRE后此项收入将变为0" : "退休后此项收入将变为0"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualExpenses">年支出</Label>
                  <Input
                    id="annualExpenses"
                    type="text"
                    inputMode="numeric"
                    value={currentStageData.annualExpenses}
                    onChange={(e) => handleNumberChange(e, (value) => updateStageData("annualExpenses", value))}
                    className={errors.annualExpenses ? "border-red-500" : ""}
                  />
                  {errors.annualExpenses && <p className="text-xs text-red-500">{errors.annualExpenses}</p>}
                </div>
              </div>
            )}

            {advancedMode && incomeStage === "post-fire-pre-legal" && (
              <div className="space-y-2">
                <Label htmlFor="annualExpenses">年支出</Label>
                <Input
                  id="annualExpenses"
                  type="text"
                  inputMode="numeric"
                  value={currentStageData.annualExpenses}
                  onChange={(e) => handleNumberChange(e, (value) => updateStageData("annualExpenses", value))}
                  className={errors.annualExpenses ? "border-red-500" : ""}
                />
                {errors.annualExpenses && <p className="text-xs text-red-500">{errors.annualExpenses}</p>}
                <p className="text-xs text-muted-foreground">
                  年支出是您每年的生活开销，在此阶段主要依靠投资收益和其他收入
                </p>
              </div>
            )}

            {advancedMode && incomeStage === "post-legal-retirement" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="annualExpenses">年支出</Label>
                  <Input
                    id="annualExpenses"
                    type="text"
                    inputMode="numeric"
                    value={currentStageData.annualExpenses}
                    onChange={(e) => handleNumberChange(e, (value) => updateStageData("annualExpenses", value))}
                    className={errors.annualExpenses ? "border-red-500" : ""}
                  />
                  {errors.annualExpenses && <p className="text-xs text-red-500">{errors.annualExpenses}</p>}
                  <p className="text-xs text-muted-foreground">年支出是您每年的生活开销，在此阶段可以获得养老金补充</p>
                </div>

                {/* Pension Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pension">养老金</Label>
                    <Input
                      id="pension"
                      type="text"
                      inputMode="numeric"
                      value={currentStageData.pension}
                      onChange={(e) => handleNumberChange(e, (value) => updateStageData("pension", value))}
                      className={errors.pension ? "border-red-500" : ""}
                    />
                    {errors.pension && <p className="text-xs text-red-500">{errors.pension}</p>}
                    <p className="text-xs text-muted-foreground">
                      养老金是您在法定退休年龄后可以获得的政府或企业养老金
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pensionGrowthRate">养老金年增长率 (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="pensionGrowthRate"
                        min={-20}
                        max={50}
                        step={0.1}
                        value={[currentStageData.pensionGrowthRate]}
                        onValueChange={(value) => handleSliderChange(value, "pensionGrowthRate")}
                        className={`flex-1 ${errors.pensionGrowthRate ? "border-red-500" : ""}`}
                      />
                      <div className="relative w-20">
                        <Input
                          type="text"
                          value={formatPercentage(currentStageData.pensionGrowthRate)}
                          onChange={(e) =>
                            handlePercentageChange(e, (value) => updateStageData("pensionGrowthRate", value), -20, 50)
                          }
                          className="pr-6 text-right"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
                      </div>
                    </div>
                    {errors.pensionGrowthRate && <p className="text-xs text-red-500">{errors.pensionGrowthRate}</p>}
                    <p className="text-xs text-muted-foreground">养老金增长率通常与通胀率相关，默认为3%</p>
                  </div>
                </div>
              </>
            )}

            {/* Income Growth Rate - Only show in pre-fire stage */}
            {(!advancedMode || incomeStage === "pre-fire") && selectedFireType !== "coast" && (
              <div className="space-y-2">
                <Label htmlFor="incomeGrowthRate">工作收入年增长率 (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="incomeGrowthRate"
                    min={-20}
                    max={50}
                    step={0.1}
                    value={[currentStageData.incomeGrowthRate]}
                    onValueChange={(value) => handleSliderChange(value, "incomeGrowthRate")}
                    className={`flex-1 ${errors.incomeGrowthRate ? "border-red-500" : ""}`}
                  />
                  <div className="relative w-20">
                    <Input
                      type="text"
                      value={formatPercentage(currentStageData.incomeGrowthRate)}
                      onChange={(e) =>
                        handlePercentageChange(e, (value) => updateStageData("incomeGrowthRate", value), -20, 50)
                      }
                      className="pr-6 text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
                  </div>
                </div>
                {errors.incomeGrowthRate && <p className="text-xs text-red-500">{errors.incomeGrowthRate}</p>}
                <p className="text-xs text-muted-foreground">
                  工作收入增长率反映您的薪资涨幅，{advancedMode ? "仅在FIRE前阶段有效" : "通常与通胀率和职业发展相关"}
                </p>
              </div>
            )}

            {/* Part-time income field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partTimeIncome">兼职收入</Label>
                <Input
                  id="partTimeIncome"
                  type="text"
                  inputMode="numeric"
                  value={currentStageData.partTimeIncome}
                  onChange={(e) => handleNumberChange(e, (value) => updateStageData("partTimeIncome", value))}
                  className={errors.partTimeIncome ? "border-red-500" : ""}
                />
                {errors.partTimeIncome && <p className="text-xs text-red-500">{errors.partTimeIncome}</p>}
                <p className="text-xs text-muted-foreground">
                  兼职收入是您通过兼职工作获得的额外收入，{advancedMode ? "在所有阶段都可继续" : "退休后仍可继续"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partTimeIncomeGrowthRate">兼职收入年增长率 (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="partTimeIncomeGrowthRate"
                    min={-20}
                    max={50}
                    step={0.1}
                    value={[currentStageData.partTimeIncomeGrowthRate]}
                    onValueChange={(value) => handleSliderChange(value, "partTimeIncomeGrowthRate")}
                    className={`flex-1 ${errors.partTimeIncomeGrowthRate ? "border-red-500" : ""}`}
                  />
                  <div className="relative w-20">
                    <Input
                      type="text"
                      value={formatPercentage(currentStageData.partTimeIncomeGrowthRate)}
                      onChange={(e) =>
                        handlePercentageChange(
                          e,
                          (value) => updateStageData("partTimeIncomeGrowthRate", value),
                          -20,
                          50,
                        )
                      }
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

            {/* Passive Income Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passiveIncome">其他被动年收入</Label>
                <Input
                  id="passiveIncome"
                  type="text"
                  inputMode="numeric"
                  value={currentStageData.passiveIncome}
                  onChange={(e) => handleNumberChange(e, (value) => updateStageData("passiveIncome", value))}
                  className={errors.passiveIncome ? "border-red-500" : ""}
                />
                {errors.passiveIncome && <p className="text-xs text-red-500">{errors.passiveIncome}</p>}
                <p className="text-xs text-muted-foreground">
                  被动收入包括租金、版权费、分红等无需主动工作即可获得的收入
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passiveIncomeGrowthRate">被动收入年增长率 (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="passiveIncomeGrowthRate"
                    min={-20}
                    max={50}
                    step={0.1}
                    value={[currentStageData.passiveIncomeGrowthRate]}
                    onValueChange={(value) => handleSliderChange(value, "passiveIncomeGrowthRate")}
                    className={`flex-1 ${errors.passiveIncomeGrowthRate ? "border-red-500" : ""}`}
                  />
                  <div className="relative w-20">
                    <Input
                      type="text"
                      value={formatPercentage(currentStageData.passiveIncomeGrowthRate)}
                      onChange={(e) =>
                        handlePercentageChange(e, (value) => updateStageData("passiveIncomeGrowthRate", value), -20, 50)
                      }
                      className="pr-6 text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
                  </div>
                </div>
                {errors.passiveIncomeGrowthRate && (
                  <p className="text-xs text-red-500">{errors.passiveIncomeGrowthRate}</p>
                )}
              </div>
            </div>

            {/* Pension Section - Only show in post-legal-retirement stage */}

            {/* Investment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="investmentAmount">投资金额</Label>
                <Input
                  id="investmentAmount"
                  type="text"
                  inputMode="numeric"
                  value={currentStageData.investmentAmount}
                  onChange={(e) => handleNumberChange(e, (value) => updateStageData("investmentAmount", value))}
                  className={errors.investmentAmount ? "border-red-500" : ""}
                  placeholder="0 = 不投资"
                />
                {errors.investmentAmount && <p className="text-xs text-red-500">{errors.investmentAmount}</p>}
                <p className="text-xs text-muted-foreground">投资金额指您计划用于投资的具体金额，0表示不进行任何投资</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentReturn">预期年投资回报率 (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="investmentReturn"
                    min={-20}
                    max={20}
                    step={0.1}
                    value={[currentStageData.investmentReturn]}
                    onValueChange={(value) => handleSliderChange(value, "investmentReturn")}
                    className={`flex-1 ${errors.investmentReturn ? "border-red-500" : ""}`}
                  />
                  <div className="relative w-20">
                    <Input
                      type="text"
                      value={formatPercentage(currentStageData.investmentReturn)}
                      onChange={(e) =>
                        handlePercentageChange(e, (value) => updateStageData("investmentReturn", value), -20, 20)
                      }
                      className="pr-6 text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
                  </div>
                </div>
                {errors.investmentReturn && <p className="text-xs text-red-500">{errors.investmentReturn}</p>}
              </div>
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
                  onValueChange={(value) => setInflationRate(value[0])}
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
              <p className="text-xs text-muted-foreground">通胀率影响未来的购买力，历史平均通胀率约为2-3%</p>
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
