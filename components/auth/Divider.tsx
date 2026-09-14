export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-[#D1D2CC] dark:bg-white/14" />
      <span className="text-sm font-medium text-[#676964] dark:text-[#B7B8B2]">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#D1D2CC] dark:bg-white/14" />
    </div>
  )
}
