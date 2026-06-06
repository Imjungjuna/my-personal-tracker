import { Sidebar } from '@/components/dashboard/Sidebar'
import { BottomTabBar } from '@/components/dashboard/BottomTabBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {children}
      </div>
      <BottomTabBar />
    </div>
  )
}
