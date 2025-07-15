import { ChatGPT } from "@/components/svg";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

export default function Header() {
  return (
    <header className="h-16 bg-secondary shadow">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center px-4">
        {/* 网站名称 */}
        <div className="flex items-center">
          <ChatGPT className="mr-2" />
          <span className="text-lg font-semibold">易经占卜</span>
        </div>

        {/* 菜单项 */}
        <nav className="mx-6 flex flex-1 justify-center">
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-primary">
                AI占卜算卦
              </Link>
            </li>
            <li>
              <Link href="/bazi" className="hover:text-primary">
                生辰八字
              </Link>
            </li>
          </ul>
        </nav>

        {/* 右侧区域 */}
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <div className="h-8 w-8 rounded-full bg-gray-400"></div>
        </div>
      </div>
    </header>
  );
}
