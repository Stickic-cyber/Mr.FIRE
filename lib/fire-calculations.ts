import { fireTypeInfo } from "./fire-types"

interface FireCalculationParams {
  currentAge: number
  targetRetirementAge: number
  currentSavings: number
  annualIncome: number
  annualExpenses: number
  annualSavings: number
  incomeGrowthRate: number
  investmentReturn: number
  inflationRate: number
  partTimeIncome: number
  partTimeIncomeGrowthRate: number
  fireType: string
}

export function calculateFireResults(params: FireCalculationParams) {
  const {
    currentAge,
    targetRetirementAge,
    currentSavings,
    annualIncome,
    annualExpenses,
    annualSavings,
    incomeGrowthRate,
    investmentReturn,
    inflationRate,
    partTimeIncome,
    partTimeIncomeGrowthRate,
    fireType,
  } = params

  // Get the withdrawal rate based on FIRE type
  const withdrawalRate = fireTypeInfo[fireType as keyof typeof fireTypeInfo]?.withdrawalRate || 4

  // Calculate FIRE number based on withdrawal rate
  const fireNumber = annualExpenses * (100 / withdrawalRate)

  // Calculate target retirement year
  const currentYear = new Date().getFullYear()
  const targetRetirementYear = currentYear + (targetRetirementAge - currentAge)

  // Calculate years to FIRE
  let yearsToFire = 0
  let currentAssetsValue = currentSavings
  let fireYear = currentYear
  const projectionData = []

  // Add starting point to projection data
  projectionData.push({
    year: fireYear,
    assets: currentAssetsValue,
    fireTarget: fireNumber,
    annualExpense: annualExpenses,
  })

  // Adjust calculation logic based on FIRE type
  let calculationLogic = "standard"
  if (fireType === "barista") {
    calculationLogic = "barista"
  } else if (fireType === "coast") {
    calculationLogic = "coast"
  }

  // Optimize calculations for negative rates
  const calculateGrowthFactor = (rate: number, years: number) => {
    // Use a more efficient calculation for negative rates
    if (rate >= 0) {
      return Math.pow(1 + rate / 100, years)
    } else {
      // For negative rates, use a more stable calculation
      return 1 / Math.pow(1 - rate / 100, years)
    }
  }

  // Set a reasonable maximum number of years to prevent infinite loops
  const MAX_YEARS = 200

  // Calculate asset growth until FIRE target is reached or max years reached
  while (currentAssetsValue < fireNumber && yearsToFire < MAX_YEARS) {
    yearsToFire++
    fireYear++

    // Check if we've reached retirement age
    const isRetired = fireYear >= targetRetirementYear

    // Calculate yearly income (considering income growth)
    // If retired, main income becomes zero
    const yearlyIncome = isRetired ? 0 : annualIncome * calculateGrowthFactor(incomeGrowthRate, yearsToFire)

    // Calculate yearly expense (considering inflation)
    const yearlyExpense = annualExpenses * calculateGrowthFactor(inflationRate, yearsToFire)

    // Calculate part-time income with its own growth rate
    // This applies both before and after retirement
    const yearlyPartTimeIncome = partTimeIncome * calculateGrowthFactor(partTimeIncomeGrowthRate, yearsToFire)

    // Calculate yearly savings (income minus expenses plus part-time income)
    let yearlySavings = yearlyIncome - yearlyExpense + yearlyPartTimeIncome

    // Special case for Coast FIRE
    if (calculationLogic === "coast") {
      // Coast FIRE: no additional savings, rely on existing assets growth
      yearlySavings = 0
    }

    // Calculate asset growth (considering compound interest)
    // Use a more stable calculation for negative investment returns
    if (investmentReturn >= 0) {
      currentAssetsValue = currentAssetsValue * (1 + investmentReturn / 100) + yearlySavings
    } else {
      currentAssetsValue = currentAssetsValue / (1 - investmentReturn / 100) + yearlySavings
    }

    // Adjust FIRE target for inflation
    const inflatedFireTarget = fireNumber * calculateGrowthFactor(inflationRate, yearsToFire)

    // Only add data points at reasonable intervals to reduce memory usage
    if (yearsToFire % 1 === 0 || yearsToFire === 1) {
      projectionData.push({
        year: fireYear,
        assets: Math.round(currentAssetsValue),
        fireTarget: Math.round(inflatedFireTarget),
        annualExpense: Math.round(yearlyExpense),
      })
    }
  }

  // If max years reached, set to max years
  if (yearsToFire >= MAX_YEARS) {
    yearsToFire = MAX_YEARS
    fireYear = currentYear + MAX_YEARS
  }

  // Calculate inflation-adjusted FIRE number
  const adjustedFireNumber = fireNumber * calculateGrowthFactor(inflationRate, yearsToFire)

  // Calculate progress percentage
  const progressPercentage = Math.min(100, (currentSavings / fireNumber) * 100)

  // Calculate savings rate
  const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0

  // Calculate future annual expense (considering inflation)
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
  }
}
