import './Loading.css'

export function Loading({ label = 'Cargando...' }: { label?: string }) {
  return <p className="loading-state">{label}</p>
}
