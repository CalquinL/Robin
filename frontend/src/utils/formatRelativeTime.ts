export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Hace unos segundos'

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`

  const diffInDays = Math.floor(diffInHours / 24)
  return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
}
