import { FireCalculator } from "@/components/fire-calculator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Github, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">财务自由计算器</h1>
        <ThemeToggle />
      </div>
      <p className="text-muted-foreground mb-10 max-w-2xl">
        规划您的财务自由之旅，了解何时可以实现财务独立并提前退休。
        选择不同的FIRE类型，输入您的财务数据，计算您的财务自由目标。
      </p>

      <div className="flex-grow">
        <FireCalculator />
      </div>

      <footer className="mt-16 pt-8 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">关于我</h3>
            <p className="text-muted-foreground mb-4 italic">
              "我不相信'工作到老'，也不迷信'爆富逆袭'，只相信理性规划和长期主义——重新夺取人生的主动权！"
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">关注我</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Github className="h-4 w-4 mr-2" />
                <Link
                  href="https://github.com/Stickic-cyber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub: Stickic-cyber
                </Link>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 12L12 16L16 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Link
                  href="https://www.xiaohongshu.com/user/profile/5fabbf970000000001003dfc?xsec_token=YBLvUJM2KfFHKUrllof62AADhVW3UlkgsxsAlPk720j0I=&xsec_source=app_share&xhsshare=CopyLink&appuid=5fabbf970000000001003dfc&apptime=1746329190&share_id=14c7ecc0707a422e91cec22b9cba7657"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  小红书: WMUL
                </Link>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    x="4"
                    y="2"
                    width="16"
                    height="20"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 6H16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 10H16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 14H12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-muted-foreground">公众号搜: 人工智能QA</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">友情链接</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                <Link
                  href="http://app.gjzwfw.gov.cn/jmopen/webapp/html5/yldycs/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  国家养老金计算器
                </Link>
              </div>
              <p className="text-xs text-muted-foreground ml-6">官方养老金测算工具，帮您了解退休后的基本保障</p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FIRE计算器 | 财务自由，从理性规划开始</p>
        </div>
      </footer>
    </main>
  )
}
