import * as React from 'react'

export interface OrganiserChipProps {
  name: string
  pfpUrl?: string
  actionSlot?: React.ReactNode
}

export function OrganiserChip({ name, pfpUrl, actionSlot }: OrganiserChipProps) {
  const [imageFailed, setImageFailed] = React.useState(false)

  // Compute clean display name initials fallback string
  const initials = React.useMemo(() => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }, [name])

  return (
    <div className="inline-flex items-center justify-between gap-4 bg-surface border border-border rounded-full p-1.5 pr-4 max-w-sm">
      <div className="flex items-center gap-2.5">
        {/* Avatar Container */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-accent/10 border border-border flex items-center justify-center flex-shrink-0 select-none">
          {pfpUrl && !imageFailed ? (
            <img
              src={pfpUrl}
              alt={name}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-accent tracking-wider font-mono">
              {initials}
            </span>
          )}
        </div>

        {/* Text Stack */}
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-text-secondary leading-none mb-0.5">Organized by</span>
          <span className="text-sm font-semibold text-text-primary truncate max-w-[140px]" title={name}>
            {name}
          </span>
        </div>
      </div>

      {/* Extensible Component Slot Integration */}
      {actionSlot && <div className="flex-shrink-0">{actionSlot}</div>}
    </div>
  )
}
