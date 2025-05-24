import { fireTypeInfo } from "./fire-types"

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

interface FireCalculationParams {
  currentAge: number
  targetRetirementAge: number
  legalRetirementAge?: number
  currentSavings: number
  annualIncome: number
  annualExpenses: number
  annualSavings: number
  incomeGrowthRate: number
  investmentReturn: number
  inflationRate: number
  partTimeIncome: number
  partTimeIncomeGrowthRate: number
  passiveIncome: number
  passiveIncomeGrowthRate: number
  investmentAmount: number
  pension: number
  pensionGrowthRate: number
  fireType: string
  advancedMode: boolean
  incomeStage?: string
  stageData?: Record<string, StageData>
}

export function calculateFireResults(params: FireCalculationParams) {
  const {
    currentAge,
    targetRetirementAge,
    legalRetirementAge = 65,
    currentSavings,
    annualIncome,
    annualExpenses,
    incomeGrowthRate,
    investmentReturn,
    inflationRate,
    partTimeIncome,
    partTimeIncomeGrowthRate,
    passiveIncome,
    passiveIncomeGrowthRate,
    investmentAmount,
    pension,
    pensionGrowthRate,
    fireType,
    advancedMode,
    stageData,
  } = params

  // Get the withdrawal rate based on FIRE type
  const withdrawalRate = fireTypeInfo[fireType as keyof typeof fireTypeInfo]?.withdrawalRate || 4

  // Calculate FIRE number based on withdrawal rate
  const fireNumber = annualExpenses * (100 / withdrawalRate)

  // Calculate target retirement year and legal retirement year
  const currentYear = new Date().getFullYear()
  const targetRetirementYear = currentYear + (targetRetirementAge - currentAge)
  const legalRetirementYear = currentYear + (legalRetirementAge - currentAge)

  // Optimize calculations for negative rates
  const calculateGrowthFactor = (rate: number, years: number) => {
    if (rate >= 0) {
      return Math.pow(1 + rate / 100, years)
    } else {
      return 1 / Math.pow(1 - rate / 100, years)
    }
  }

  // Calculate comprehensive projection data up to age 100
  const maxAge = 100
  const totalYears = maxAge - currentAge
  const projectionData = []

  let currentAssetsValue = currentSavings
  let fireYear = currentYear
  let yearsToFire = 0
  let fireAchieved = false

  // Add starting point to projection data
  projectionData.push({
    year: currentYear,
    age: currentAge,
    assets: currentAssetsValue,
    fireTarget: fireNumber,
    annualExpense: annualExpenses,
    stage: "pre-fire",
    yearlyIncome: annualIncome,
    yearlyExpense: annualExpenses,
    yearlySavings: annualIncome - annualExpenses,
  })

  // Calculate year by year up to age 100
  for (let yearIndex = 1; yearIndex <= totalYears; yearIndex++) {
    const currentYearInLoop = currentYear + yearIndex
    const currentAgeInLoop = currentAge + yearIndex

    // Determine current stage based on timeline
    let currentStage = "pre-fire"
    if (advancedMode) {
      if (currentYearInLoop >= legalRetirementYear) {
        currentStage = "post-legal-retirement"
      } else if (currentYearInLoop >= targetRetirementYear) {
        currentStage = "post-fire-pre-legal"
      }
    } else {
      if (currentYearInLoop >= targetRetirementYear) {
        currentStage = "post-fire-pre-legal"
      }
    }

    // Get stage-specific data
    let stageSpecificData = {
      annualIncome,
      annualExpenses,
      incomeGrowthRate,
      partTimeIncome,
      partTimeIncomeGrowthRate,
      passiveIncome,
      passiveIncomeGrowthRate,
      pension,
      pensionGrowthRate,
      investmentAmount,
      investmentReturn,
    }

    if (advancedMode && stageData) {
      if (currentStage === "pre-fire" && stageData["pre-fire"]) {
        stageSpecificData = { ...stageSpecificData, ...stageData["pre-fire"] }
      } else if (currentStage === "post-fire-pre-legal" && stageData["post-fire-pre-legal"]) {
        stageSpecificData = { ...stageSpecificData, ...stageData["post-fire-pre-legal"] }
      } else if (currentStage === "post-legal-retirement" && stageData["post-legal-retirement"]) {
        stageSpecificData = { ...stageSpecificData, ...stageData["post-legal-retirement"] }
      }
    }

    // Calculate yearly income based on current stage
    let yearlyIncome = 0
    if (currentStage === "pre-fire") {
      // Stage 1: Pre-FIRE - normal income with growth
      yearlyIncome =
        stageSpecificData.annualIncome * calculateGrowthFactor(stageSpecificData.incomeGrowthRate, yearIndex)
    } else if (currentStage === "post-fire-pre-legal") {
      // Stage 2: Post-FIRE, Pre-Legal Retirement - no main income
      yearlyIncome = 0
    } else if (currentStage === "post-legal-retirement") {
      // Stage 3: Post-Legal Retirement - pension income
      const yearsFromLegalRetirement = currentYearInLoop - legalRetirementYear
      yearlyIncome =
        stageSpecificData.pension *
        calculateGrowthFactor(stageSpecificData.pensionGrowthRate, Math.max(0, yearsFromLegalRetirement))
    }

    // Calculate yearly expense (considering inflation and stage-specific expenses)
    const yearlyExpense = stageSpecificData.annualExpenses * calculateGrowthFactor(inflationRate, yearIndex)

    // Calculate part-time income with stage-specific growth rate
    const yearlyPartTimeIncome =
      stageSpecificData.partTimeIncome * calculateGrowthFactor(stageSpecificData.partTimeIncomeGrowthRate, yearIndex)

    // Calculate passive income with stage-specific growth rate
    const yearlyPassiveIncome =
      stageSpecificData.passiveIncome * calculateGrowthFactor(stageSpecificData.passiveIncomeGrowthRate, yearIndex)

    // Calculate yearly savings
    let yearlySavings = yearlyIncome - yearlyExpense + yearlyPartTimeIncome + yearlyPassiveIncome

    // Special case for Coast FIRE
    if (fireType === "coast") {
      // Coast FIRE: no additional savings from work income, but keep other income sources
      yearlySavings = yearlyPartTimeIncome + yearlyPassiveIncome - yearlyExpense
      if (currentStage === "post-legal-retirement") {
        yearlySavings += yearlyIncome // Add pension income
      }
    }

    // Calculate investment returns using stage-specific data
    let investmentReturns = 0
    if (stageSpecificData.investmentAmount > 0) {
      const actualInvestmentAmount = Math.min(stageSpecificData.investmentAmount, currentAssetsValue)
      investmentReturns = actualInvestmentAmount * (stageSpecificData.investmentReturn / 100)
    } else {
      // If no specific investment amount, assume all assets are invested
      investmentReturns = currentAssetsValue * (stageSpecificData.investmentReturn / 100)
    }

    // Update assets
    currentAssetsValue = Math.max(0, currentAssetsValue + investmentReturns + yearlySavings)

    // Check if FIRE target is achieved for the first time
    if (!fireAchieved && currentAssetsValue >= fireNumber) {
      fireAchieved = true
      yearsToFire = yearIndex
      fireYear = currentYearInLoop
    }

    // Adjust FIRE target for inflation
    const inflatedFireTarget = fireNumber * calculateGrowthFactor(inflationRate, yearIndex)

    // Add data point for this year
    projectionData.push({
      year: currentYearInLoop,
      age: currentAgeInLoop,
      assets: Math.round(currentAssetsValue),
      fireTarget: Math.round(inflatedFireTarget),
      annualExpense: Math.round(yearlyExpense),
      stage: currentStage,
      yearlyIncome: Math.round(yearlyIncome),
      yearlyExpense: Math.round(yearlyExpense),
      yearlySavings: Math.round(yearlySavings),
      investmentReturns: Math.round(investmentReturns),
      partTimeIncome: Math.round(yearlyPartTimeIncome),
      passiveIncome: Math.round(yearlyPassiveIncome),
    })
  }

  // If FIRE was never achieved, set to maximum years
  if (!fireAchieved) {
    yearsToFire = totalYears
    fireYear = currentYear + totalYears
  }

  // Calculate inflation-adjusted FIRE number
  const adjustedFireNumber = fireNumber * calculateGrowthFactor(inflationRate, yearsToFire)

  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.max(0, (currentSavings / fireNumber) * 100))

  // Calculate savings rate (based on pre-fire stage)
  const preFIREData = advancedMode && stageData ? stageData["pre-fire"] : { annualIncome, annualExpenses }
  const savingsRate =
    preFIREData.annualIncome > 0
      ? ((preFIREData.annualIncome - preFIREData.annualExpenses) / preFIREData.annualIncome) * 100
      : 0

  // Calculate future annual expense
  const futureAnnualExpense = annualExpenses * calculateGrowthFactor(inflationRate, yearsToFire)

  return {
    fireNumber,
    adjustedFireNumber,
    yearsToFire,
    fireYear,
    progressPercentage,
    projectionData,
    savingsRate,
    futureAnnualExpense,
    fireType,
    targetRetirementYear,
    legalRetirementYear,
  }
}
