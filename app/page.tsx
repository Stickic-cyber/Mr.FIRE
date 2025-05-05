import { FireCalculator } from "@/components/fire-calculator"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">财务自由计算器</h1>
        <ThemeToggle />
      </div>
      <p className="text-muted-foreground mb-10 max-w-2xl">
        规划您的财务自由之旅，了解何时可以实现财务独立并提前退休。
        选择不同的FIRE类型，输入您的财务数据，计算您的财务自由目标。
      </p>

      <FireCalculator />

      <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} FIRE计算器 | 财务自由，从理性规划开始</p>
      </footer>
    </main>
  )
}
