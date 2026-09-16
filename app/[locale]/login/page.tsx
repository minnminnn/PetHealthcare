"use client";

import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { AccountLink } from "@/components/auth/AccountLink";
import { AuthShell } from "@/components/auth/AuthShell";
import { Divider } from "@/components/auth/Divider";
import { FormAlert } from "@/components/auth/FormAlert";
import { FormInput } from "@/components/auth/FormInput";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { loginSchema } from "@/lib/auth/validation";

interface LoginFormState {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
    form?: string;
  };
  isLoading: boolean;
}

function getSafeDestination(locale: string) {
  const callbackUrl = new URLSearchParams(window.location.search).get(
    "callbackUrl",
  );

  if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  return `/${locale}/dashboard/owner`;
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
    errors: {},
    isLoading: false,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = loginSchema.safeParse({
      email: formState.email,
      password: formState.password,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setFormState((previous) => ({
        ...previous,
        errors: {
          email: fieldErrors.email ? t("errors.validEmail") : undefined,
          password: fieldErrors.password
            ? t("errors.passwordRequired")
            : undefined,
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
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setFormState((previous) => ({
          ...previous,
          isLoading: false,
          errors: { form: t("errors.invalidCredentials") },
        }));
        return;
      }

      window.location.assign(getSafeDestination(locale));
    } catch {
      setFormState((previous) => ({
        ...previous,
        isLoading: false,
        errors: { form: t("errors.unavailable") },
      }));
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: getSafeDestination(locale) });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((previous) => ({
      ...previous,
      [name]: value,
      errors: { ...previous.errors, [name]: undefined, form: undefined },
    }));
  };

  return (
    <AuthShell tagline={t("login.tagline")} imageAlt={t("imageAlt")}>
      <div>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-[#20211F] dark:text-[#F1F1ED] sm:text-4xl">
          {t("login.title")}
        </h1>
        <p className="mb-8 text-base font-normal text-[#676964] dark:text-[#B7B8B2]">
          {t("login.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {formState.errors.form && (
            <FormAlert message={formState.errors.form} type="error" />
          )}

          <FormInput
            id="email"
            name="email"
            type="email"
            label={t("login.email")}
            placeholder="you@example.com"
            value={formState.email}
            onChange={handleInputChange}
            error={formState.errors.email}
            autoComplete="email"
            inputMode="email"
            disabled={formState.isLoading}
          />

          <FormInput
            id="password"
            name="password"
            type="password"
            label={t("login.password")}
            placeholder={t("login.passwordPlaceholder")}
            value={formState.password}
            onChange={handleInputChange}
            error={formState.errors.password}
            autoComplete="current-password"
            showPasswordToggle
            disabled={formState.isLoading}
          />

          <SubmitButton
            isLoading={formState.isLoading}
            loadingLabel={t("login.signingIn")}
          >
            {t("login.submit")}
          </SubmitButton>
        </form>

        <Divider label={t("or")} />

        <SocialButtons
          googleLabel={t("login.withGoogle")}
          onGoogleClick={handleGoogleSignIn}
          disabled={formState.isLoading}
        />

        <AccountLink
          href="/register"
          text={t("login.noAccount")}
          linkText={t("login.register")}
        />
      </div>
    </AuthShell>
  );
}
