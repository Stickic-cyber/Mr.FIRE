export type FireType = "standard" | "fat" | "lean" | "barista" | "coast"

export interface FireTypeInfo {
  label: string
  shortDesc: string
  longDesc: string
  annualExpenses: number
  savingsRate: number
  partTimeIncome: number
  incomeGrowthRate: number
  partTimeIncomeGrowthRate: number
  passiveIncome: number
  passiveIncomeGrowthRate: number
  investmentAmount: number
  investmentReturn: number
  withdrawalRate: number
  pension: number
  pensionGrowthRate: number
}

export const fireTypeInfo: Record<FireType, FireTypeInfo> = {
  standard: {
    label: "标准 FIRE",
    shortDesc: "传统财务自由模式",
    longDesc: "标准FIRE是最常见的财务自由模式，通过积累25倍年支出的资产，实现4%安全提取率的财务自由。",
    annualExpenses: 40000,
    savingsRate: 40,
    partTimeIncome: 0,
    incomeGrowthRate: 2,
    partTimeIncomeGrowthRate: 1,
    passiveIncome: 0,
    passiveIncomeGrowthRate: 2,
    investmentAmount: 0,
    investmentReturn: 7,
    withdrawalRate: 4,
    pension: 0,
    pensionGrowthRate: 3,
  },
  fat: {
    label: "Fat FIRE",
    shortDesc: "高支出型财务自由",
    longDesc: "Fat FIRE适合追求更高生活品质的人群，年支出较高，但需要积累更多资产才能实现财务自由。",
    annualExpenses: 500000,
    savingsRate: 30,
    partTimeIncome: 0,
    incomeGrowthRate: 2,
    partTimeIncomeGrowthRate: 1,
    passiveIncome: 0,
    passiveIncomeGrowthRate: 2,
    investmentAmount: 0,
    investmentReturn: 7,
    withdrawalRate: 3.5,
    pension: 0,
    pensionGrowthRate: 3,
  },
  lean: {
    label: "Lean FIRE",
    shortDesc: "低支出型财务自由",
    longDesc: "Lean FIRE适合生活简朴的人群，通过控制支出，可以更快实现财务自由，但生活品质相对较低。",
    annualExpenses: 150000,
    savingsRate: 60,
    partTimeIncome: 0,
    incomeGrowthRate: 0,
    partTimeIncomeGrowthRate: 0,
    passiveIncome: 0,
    passiveIncomeGrowthRate: 1,
    investmentAmount: 0,
    investmentReturn: 5,
    withdrawalRate: 4,
    pension: 0,
    pensionGrowthRate: 3,
  },
  barista: {
    label: "Barista FIRE",
    shortDesc: "半退休型财务自由",
    longDesc: "Barista FIRE是一种折中方案，通过兼职工作补充收入，可以提前实现部分财务自由。",
    annualExpenses: 250000,
    savingsRate: 40,
    partTimeIncome: 120000,
    incomeGrowthRate: 1,
    partTimeIncomeGrowthRate: 1,
    passiveIncome: 0,
    passiveIncomeGrowthRate: 1,
    investmentAmount: 0,
    investmentReturn: 5,
    withdrawalRate: 4.5,
    pension: 0,
    pensionGrowthRate: 3,
  },
  coast: {
    label: "Coast FIRE",
    shortDesc: "惯性型财务自由",
    longDesc:
      "Coast FIRE是指已经积累了足够的资产，即使不再进行额外储蓄，现有资产也会通过复利增长到退休所需金额。您可以继续工作并消费所有收入。",
    annualExpenses: 40000,
    savingsRate: 0,
    partTimeIncome: 0,
    incomeGrowthRate: 0,
    partTimeIncomeGrowthRate: 0,
    passiveIncome: 0,
    passiveIncomeGrowthRate: 0,
    investmentAmount: 0,
    investmentReturn: 6.5,
    withdrawalRate: 4,
    pension: 0,
    pensionGrowthRate: 3,
  },
}

export function getFireTypeDefaults(type: FireType): {
  annualExpenses: number
  investmentReturn: number
  partTimeIncome: number
  incomeGrowthRate: number
  partTimeIncomeGrowthRate: number
  passiveIncome: number
  passiveIncomeGrowthRate: number
  investmentAmount: number
  pension: number
  pensionGrowthRate: number
} {
  const info = fireTypeInfo[type]
  return {
    annualExpenses: info.annualExpenses,
    investmentReturn: info.investmentReturn,
    partTimeIncome: info.partTimeIncome,
    incomeGrowthRate: info.incomeGrowthRate,
    partTimeIncomeGrowthRate: info.partTimeIncomeGrowthRate,
    passiveIncome: info.passiveIncome,
    passiveIncomeGrowthRate: info.passiveIncomeGrowthRate,
    investmentAmount: info.investmentAmount,
    pension: info.pension,
    pensionGrowthRate: info.pensionGrowthRate,
  }
}
