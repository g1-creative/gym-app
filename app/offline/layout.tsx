// Prevent static generation for offline page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

