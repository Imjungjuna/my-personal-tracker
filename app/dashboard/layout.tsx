export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {children}
    </div>
  )
}
