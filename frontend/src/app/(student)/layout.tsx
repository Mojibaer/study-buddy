import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MobileTabBar } from '@/components/layout/MobileTabBar'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {/* Bottom padding (mobile) so content clears the fixed tab bar. */}
      <div className="pb-16 sm:pb-0">{children}</div>
      <MobileTabBar />
    </ProtectedRoute>
  )
}
