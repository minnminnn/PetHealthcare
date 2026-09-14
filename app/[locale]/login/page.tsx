'use client'

import { AccountLink } from '@/components/auth/AccountLink'
import { AuthShell } from '@/components/auth/AuthShell'
import { Divider } from '@/components/auth/Divider'
import { FormAlert } from '@/components/auth/FormAlert'
import { FormInput } from '@/components/auth/FormInput'
import { SocialButtons } from '@/components/auth/SocialButtons'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { authConfig } from '@/app/auth.config'
import { useState } from 'react'

interface LoginFormState {
  email: string
  password: string
  errors: {
    email?: string
    password?: string
    form?: string
  }
  isLoading: boolean
}

export default function LoginPage() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    errors: {},
    isLoading: false,
  })

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formState.email.trim()) {
      errors.email = 'Email is required'
    } else if (!authConfig.validation.email.test(formState.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formState.password) {
      errors.password = 'Password is required'
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
    console.log('Login attempt:', {
      email: formState.email,
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
    const { name, value } = e.target
    setFormState((prev) => ({
      ...prev,
      [name]: value,
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
          Sign in
        </h1>
        <p className="text-base font-normal text-[#676964] dark:text-[#B7B8B2] mb-8">
          Welcome back. Enter your details to access your account.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {formState.errors.form && (
            <FormAlert message={formState.errors.form} type="error" />
          )}

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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#20211F] dark:text-[#F1F1ED]"
              >
                Password
              </label>
              <a
                href="#"
                className="text-sm text-[#D85F53] dark:text-[#EF7569] hover:text-[#B9473E] dark:hover:text-[#F18A80] transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <FormInput
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formState.password}
              onChange={handleInputChange}
              error={formState.errors.password}
              autoComplete="current-password"
              showPasswordToggle
              disabled={formState.isLoading}
            />
          </div>

          <SubmitButton isLoading={formState.isLoading}>
            Sign in
          </SubmitButton>
        </form>

        {/* Divider */}
        <Divider label="or" />

        {/* Social buttons */}
        <SocialButtons
          googleLabel="Sign in with Google"
          phoneLabel="Sign in with phone"
        />

        {/* Account switch */}
        <AccountLink
          href="/register"
          text="Don't have an account?"
          linkText="Create one"
        />
      </div>
    </AuthShell>
  )
}
