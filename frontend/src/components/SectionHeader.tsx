interface SectionHeaderProps {
  label: string
  count: number
}

export function SectionHeader({ label, count }: SectionHeaderProps) {
  return (
    <div className="py-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        {label} · {count}
      </span>
    </div>
  )
}
