import Link from 'next/link'

interface AccountLinkProps {
  href: string
  text: string
  linkText: string
}

export function AccountLink({ href, text, linkText }: AccountLinkProps) {
  return (
    <p className="text-center text-sm font-normal text-[#676964] dark:text-[#B7B8B2] mt-6">
      {text}{' '}
      <Link
        href={href}
        className="underline text-[#D85F53] dark:text-[#EF7569] hover:text-[#B9473E] dark:hover:text-[#F18A80] transition-colors"
      >
        {linkText}
      </Link>
    </p>
  )
}
