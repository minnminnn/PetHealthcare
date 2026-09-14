interface FormAlertProps {
  message: string
  type?: 'error' | 'success'
}

export function FormAlert({
  message,
  type = 'error',
}: FormAlertProps) {
  const bgColor =
    type === 'error'
      ? 'bg-[#FEE2E2] dark:bg-[rgba(248,113,113,0.14)]'
      : 'bg-[#DCFCE7] dark:bg-[rgba(74,222,128,0.14)]'

  const textColor =
    type === 'error'
      ? 'text-[#DC2626] dark:text-[#F87171]'
      : 'text-[#16A34A] dark:text-[#4ADE80]'

  return (
    <div
      className={`${bgColor} ${textColor} px-4 py-3 rounded-[10px] text-sm font-normal mb-4`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  )
}
