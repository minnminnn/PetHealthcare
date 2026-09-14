'use client'

import { AccountLink } from '@/components/auth/AccountLink'
import { AccountTypeSelector } from '@/components/auth/AccountTypeSelector'
import { AuthShell } from '@/components/auth/AuthShell'
import { Divider } from '@/components/auth/Divider'
import { FormAlert } from '@/components/auth/FormAlert'
import { FormInput } from '@/components/auth/FormInput'
import { SocialButtons } from '@/components/auth/SocialButtons'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { authConfig } from '@/app/auth.config'
import { Heart, Stethoscope } from 'lucide-react'
import { useState } from 'react'

interface RegisterFormState {
  accountType: string
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
  errors: {
    accountType?: string
    fullName?: string
    email?: string
    phone?: string
    password?: string
    confirmPassword?: string
    agreeTerms?: string
    form?: string
  }
  isLoading: boolean
}

const accountTypes = [
  {
    id: 'pet-owner',
    label: 'Pet owner',
    description: 'Manage your pet\'s health records',
    icon: <Heart size={20} />,
  },
  {
    id: 'clinic',
    label: 'Clinic / Veterinarian',
    description: 'Manage clinic and patient records',
    icon: <Stethoscope size={20} />,
  },
]

export default function RegisterPage() {
  const [formState, setFormState] = useState<RegisterFormState>({
    accountType: 'pet-owner',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    errors: {},
    isLoading: false,
  })

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formState.accountType) {
      errors.accountType = 'Please select an account type'
    }

    if (!formState.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }

    if (!formState.email.trim()) {
      errors.email = 'Email is required'
    } else if (!authConfig.validation.email.test(formState.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formState.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!authConfig.validation.phone.test(formState.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }

    if (!formState.password) {
      errors.password = 'Password is required'
    } else if (formState.password.length < authConfig.validation.password.minLength) {
      errors.password = `Password must be at least ${authConfig.validation.password.minLength} characters`
    }

    if (!formState.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formState.password !== formState.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formState.agreeTerms) {
      errors.agreeTerms = 'You must agree to the terms'
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({
        ...prev,
        errors,
      }))
      return
    }

    setFormState((prev) => ({
      ...prev,
      isLoading: true,
      errors: {},
    }))

    // Simulate API call - replace with actual backend integration
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Handle success - replace with actual redirect
    console.log('Registration attempt:', {
      accountType: formState.accountType,
      fullName: formState.fullName,
      email: formState.email,
      phone: formState.phone,
      password: '[redacted]',
    })

    setFormState((prev) => ({
      ...prev,
      isLoading: false,
    }))
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      errors: {
        ...prev.errors,
        [name]: undefined,
      },
    }))
  }

  return (
    <AuthShell>
      <div>
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-semibold mb-3 tracking-tight text-[#20211F] dark:text-[#F1F1ED]">
          Create account
        </h1>
        <p className="text-base font-normal text-[#676964] dark:text-[#B7B8B2] mb-8">
          One account keeps all your care information together.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {formState.errors.form && (
            <FormAlert message={formState.errors.form} type="error" />
          )}

          {/* Account Type Selector */}
          <AccountTypeSelector
            value={formState.accountType}
            onChange={(value) =>
              setFormState((prev) => ({
                ...prev,
                accountType: value,
                errors: { ...prev.errors, accountType: undefined },
              }))
            }
            types={accountTypes}
          />

          <FormInput
            id="fullName"
            name="fullName"
            type="text"
            label="Full name"
            placeholder="John Doe"
            value={formState.fullName}
            onChange={handleInputChange}
            error={formState.errors.fullName}
            autoComplete="name"
            disabled={formState.isLoading}
          />

          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={formState.email}
            onChange={handleInputChange}
            error={formState.errors.email}
            autoComplete="email"
            disabled={formState.isLoading}
          />

          <FormInput
            id="phone"
            name="phone"
            type="tel"
            label="Phone number"
            placeholder="+84 123 456 789"
            value={formState.phone}
            onChange={handleInputChange}
            error={formState.errors.phone}
            autoComplete="tel"
            disabled={formState.isLoading}
          />

          <FormInput
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Create a strong password"
            value={formState.password}
            onChange={handleInputChange}
            error={formState.errors.password}
            autoComplete="new-password"
            showPasswordToggle
            disabled={formState.isLoading}
          />

          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="Confirm your password"
            value={formState.confirmPassword}
            onChange={handleInputChange}
            error={formState.errors.confirmPassword}
            autoComplete="new-password"
            showPasswordToggle
            disabled={formState.isLoading}
          />

          {/* Terms checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formState.agreeTerms}
              onChange={handleInputChange}
              className="mt-1 w-5 h-5 rounded border-[#D1D2CC] dark:border-white/14 text-[#D85F53] dark:text-[#EF7569] cursor-pointer"
              disabled={formState.isLoading}
            />
            <label
              htmlFor="agreeTerms"
              className="text-sm font-normal text-[#676964] dark:text-[#B7B8B2] cursor-pointer"
            >
              I agree to the{' '}
              <a
                href="#"
                className="underline text-[#D85F53] dark:text-[#EF7569] hover:text-[#B9473E] dark:hover:text-[#F18A80] transition-colors"
              >
                terms of service
              </a>{' '}
              and{' '}
              <a
                href="#"
                className="underline text-[#D85F53] dark:text-[#EF7569] hover:text-[#B9473E] dark:hover:text-[#F18A80] transition-colors"
              >
                privacy policy
              </a>
            </label>
          </div>
          {formState.errors.agreeTerms && (
            <p className="text-sm font-normal text-[#DC2626] dark:text-[#F87171] -mt-4">
              {formState.errors.agreeTerms}
            </p>
          )}

          <SubmitButton isLoading={formState.isLoading}>
            Create account
          </SubmitButton>
        </form>

        {/* Divider */}
        <Divider label="or" />

        {/* Social buttons */}
        <SocialButtons
          googleLabel="Sign up with Google"
          phoneLabel="Sign up with phone"
        />

        {/* Account switch */}
        <AccountLink
          href="/login"
          text="Already have an account?"
          linkText="Sign in"
        />
      </div>
    </AuthShell>
  )
}
