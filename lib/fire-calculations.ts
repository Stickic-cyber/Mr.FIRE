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

  // Calculate asset growth until FIRE target is reached
  // No upper limit on years as requested
  while (currentAssetsValue < fireNumber) {
    yearsToFire++
    fireYear++

    // Calculate yearly income (considering income growth)
    const yearlyIncome = annualIncome * Math.pow(1 + incomeGrowthRate / 100, yearsToFire)

    // Calculate yearly expense (considering inflation)
    const yearlyExpense = annualExpenses * Math.pow(1 + inflationRate / 100, yearsToFire)

    // Calculate yearly savings (income minus expenses)
    let yearlySavings = yearlyIncome - yearlyExpense

    // Special FIRE type logic
    if (calculationLogic === "barista") {
      // Barista FIRE: consider part-time income
      const yearlyPartTimeIncome = partTimeIncome * Math.pow(1 + incomeGrowthRate / 100, yearsToFire)
      yearlySavings += yearlyPartTimeIncome
    } else if (calculationLogic === "coast") {
      // Coast FIRE: no additional savings, rely on existing assets growth
      yearlySavings = 0
    }

    // Calculate asset growth (considering compound interest)
    currentAssetsValue = currentAssetsValue * (1 + investmentReturn / 100) + yearlySavings

    // Adjust FIRE target for inflation
    const inflatedFireTarget = fireNumber * Math.pow(1 + inflationRate / 100, yearsToFire)

    projectionData.push({
      year: fireYear,
      assets: Math.round(currentAssetsValue),
      fireTarget: Math.round(inflatedFireTarget),
      annualExpense: Math.round(yearlyExpense),
    })
  }

  // Calculate inflation-adjusted FIRE number
  const adjustedFireNumber = fireNumber * Math.pow(1 + inflationRate / 100, yearsToFire)

  // Calculate progress percentage
  const progressPercentage = Math.min(100, (currentSavings / fireNumber) * 100)

  // Calculate savings rate
  const savingsRate = annualIncome > 0 ? ((annualIncome - annualExpenses) / annualIncome) * 100 : 0

  // Calculate future annual expense (considering inflation)
  const futureAnnualExpense = annualExpenses * Math.pow(1 + inflationRate / 100, yearsToFire)

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
