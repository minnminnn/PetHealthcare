"use client";

import { Heart, Stethoscope } from "lucide-react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { AccountLink } from "@/components/auth/AccountLink";
import { AccountTypeSelector } from "@/components/auth/AccountTypeSelector";
import { AuthShell } from "@/components/auth/AuthShell";
import { Divider } from "@/components/auth/Divider";
import { FormAlert } from "@/components/auth/FormAlert";
import { FormInput } from "@/components/auth/FormInput";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { registrationSchema } from "@/lib/auth/validation";

interface RegisterFormState {
  accountType: "pet-owner" | "clinic";
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  errors: Partial<
    Record<
      | "accountType"
      | "fullName"
      | "email"
      | "phone"
      | "password"
      | "confirmPassword"
      | "agreeTerms"
      | "form",
      string
    >
  >;
  isLoading: boolean;
}

interface RegistrationResponse {
  ok?: boolean;
  code?: string;
  requiresReview?: boolean;
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale() as "vi" | "en";
  const [formState, setFormState] = useState<RegisterFormState>({
    accountType: "pet-owner",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    errors: {},
    isLoading: false,
  });

  const accountTypes = [
    {
      id: "pet-owner",
      label: t("register.asOwner"),
      description: t("register.ownerDescription"),
      icon: <Heart size={20} />,
    },
    {
      id: "clinic",
      label: t("register.asClinic"),
      description: t("register.clinicDescription"),
      icon: <Stethoscope size={20} />,
    },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = registrationSchema.safeParse({
      accountType: formState.accountType,
      fullName: formState.fullName,
      email: formState.email,
      phone: formState.phone,
      password: formState.password,
      confirmPassword: formState.confirmPassword,
      agreeTerms: formState.agreeTerms,
      locale,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setFormState((previous) => ({
        ...previous,
        errors: {
          accountType: fieldErrors.accountType
            ? t("errors.accountType")
            : undefined,
          fullName: fieldErrors.fullName ? t("errors.fullName") : undefined,
          email: fieldErrors.email ? t("errors.validEmail") : undefined,
          phone: fieldErrors.phone ? t("errors.validPhone") : undefined,
          password: fieldErrors.password
            ? t("errors.strongPassword")
            : undefined,
          confirmPassword: fieldErrors.confirmPassword
            ? t("errors.passwordMismatch")
            : undefined,
          agreeTerms: fieldErrors.agreeTerms ? t("errors.terms") : undefined,
        },
      }));
      return;
    }

    setFormState((previous) => ({
      ...previous,
      isLoading: true,
      errors: {},
    }));

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as RegistrationResponse;

      if (!response.ok) {
        setFormState((previous) => ({
          ...previous,
          isLoading: false,
          errors: {
            form:
              result.code === "ACCOUNT_EXISTS"
                ? t("errors.accountExists")
                : t("errors.registrationFailed"),
          },
        }));
        return;
      }

      const signInResult = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (!signInResult || signInResult.error) {
        setFormState((previous) => ({
          ...previous,
          isLoading: false,
          errors: { form: t("register.createdSignIn") },
        }));
        return;
      }

      const destination = result.requiresReview
        ? `/${locale}/dashboard/owner?clinicRequest=pending`
        : `/${locale}/dashboard/owner`;
      window.location.assign(destination);
    } catch {
      setFormState((previous) => ({
        ...previous,
        isLoading: false,
        errors: { form: t("errors.unavailable") },
      }));
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: `/${locale}/dashboard/owner` });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormState((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
      errors: { ...previous.errors, [name]: undefined, form: undefined },
    }));
  };

  return (
    <AuthShell
      tagline={t("register.tagline")}
      imageAlt={t("imageAlt")}
      contentClassName="max-w-2xl"
    >
      <div>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-[#20211F] dark:text-[#F1F1ED] sm:text-4xl">
          {t("register.title")}
        </h1>
        <p className="mb-7 max-w-xl text-base font-normal text-[#676964] dark:text-[#B7B8B2]">
          {t("register.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {formState.errors.form && (
            <FormAlert message={formState.errors.form} type="error" />
          )}

          <div>
            <AccountTypeSelector
              value={formState.accountType}
              onChange={(value) =>
                setFormState((previous) => ({
                  ...previous,
                  accountType: value as RegisterFormState["accountType"],
                  errors: {
                    ...previous.errors,
                    accountType: undefined,
                    form: undefined,
                  },
                }))
              }
              types={accountTypes}
              disabled={formState.isLoading}
            />
            {formState.errors.accountType && (
              <p className="mt-2 text-sm text-[#DC2626] dark:text-[#F87171]">
                {formState.errors.accountType}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              id="fullName"
              name="fullName"
              type="text"
              label={t("register.name")}
              placeholder={t("register.namePlaceholder")}
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
              label={t("register.email")}
              placeholder="you@example.com"
              value={formState.email}
              onChange={handleInputChange}
              error={formState.errors.email}
              autoComplete="email"
              inputMode="email"
              disabled={formState.isLoading}
            />
          </div>

          <FormInput
            id="phone"
            name="phone"
            type="tel"
            label={t("register.phone")}
            placeholder="+84 123 456 789"
            value={formState.phone}
            onChange={handleInputChange}
            error={formState.errors.phone}
            autoComplete="tel"
            inputMode="tel"
            disabled={formState.isLoading}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              id="password"
              name="password"
              type="password"
              label={t("register.password")}
              placeholder={t("register.passwordPlaceholder")}
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
              label={t("register.confirmPassword")}
              placeholder={t("register.confirmPlaceholder")}
              value={formState.confirmPassword}
              onChange={handleInputChange}
              error={formState.errors.confirmPassword}
              autoComplete="new-password"
              showPasswordToggle
              disabled={formState.isLoading}
            />
          </div>

          <div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formState.agreeTerms}
                onChange={handleInputChange}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-[#D1D2CC] accent-[#D85F53] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D85F53] disabled:cursor-not-allowed dark:border-white/14 dark:accent-[#EF7569]"
                disabled={formState.isLoading}
              />
              <label
                htmlFor="agreeTerms"
                className="cursor-pointer text-sm leading-5 text-[#676964] dark:text-[#B7B8B2]"
              >
                {t("register.termsPrefix")}{" "}
                <span className="font-medium text-[#20211F] dark:text-[#F1F1ED]">
                  {t("register.terms")}
                </span>{" "}
                {t("register.and")}{" "}
                <span className="font-medium text-[#20211F] dark:text-[#F1F1ED]">
                  {t("register.privacy")}
                </span>
              </label>
            </div>
            {formState.errors.agreeTerms && (
              <p className="mt-2 text-sm text-[#DC2626] dark:text-[#F87171]">
                {formState.errors.agreeTerms}
              </p>
            )}
          </div>

          <SubmitButton
            isLoading={formState.isLoading}
            loadingLabel={t("register.creating")}
          >
            {t("register.submit")}
          </SubmitButton>
        </form>

        <Divider label={t("or")} />

        <SocialButtons
          googleLabel={t("register.withGoogle")}
          onGoogleClick={handleGoogleSignIn}
          disabled={formState.isLoading}
        />

        <AccountLink
          href="/login"
          text={t("register.hasAccount")}
          linkText={t("register.login")}
        />
      </div>
    </AuthShell>
  );
}
