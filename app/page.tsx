import { FireCalculator } from "@/components/fire-calculator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Github, BookOpen, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">财务自由计算器</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-1 hidden sm:inline">主题</span>
          <ThemeToggle />
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
        规划您的财务自由之旅，了解何时可以实现财务独立并提前退休。
      </p>

      <div className="flex-grow">
        <FireCalculator />
      </div>

      {/* 关于我 */}
      <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-500 mb-2">关于我</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl italic">
              "我不相信'工作到老'，也不迷信'爆富逆袭'，只相信理性规划和长期主义——重新夺取人生的主动权！"
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Stickic-cyber"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500 transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="text-sm">Stickic-cyber</span>
            </a>

            <a
              href="https://www.xiaohongshu.com/user/profile/5fabbf970000000001003dfc?xsec_token=YBLvUJM2KfFHKUrllof62AADhVW3UlkgsxsAlPk720j0I=&xsec_source=app_share&xhsshare=CopyLink&appuid=5fabbf970000000001003dfc&apptime=1746329190&share_id=14c7ecc0707a422e91cec22b9cba7657"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">小红书: WMUL</span>
            </a>

            <a
              href="#"
              className="flex items-center gap-1 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">公众号搜: 人工智能QA</span>
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
          © {new Date().getFullYear()} FIRE计算器 | 财务自由，从理性规划开始
        </div>
      </footer>
    </main>
  )
}
