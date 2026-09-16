import { z } from "zod";

export const accountTypes = ["pet-owner", "clinic"] as const;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  const compact = value.replace(/[\s().-]/g, "");

  if (/^0\d{9}$/.test(compact)) {
    return `+84${compact.slice(1)}`;
  }

  if (/^84\d{9}$/.test(compact)) {
    return `+${compact}`;
  }

  return compact;
}

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform(normalizeEmail),
  password: z.string().min(1).max(72),
});

export const registrationSchema = z
  .object({
    accountType: z.enum(accountTypes),
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254).transform(normalizeEmail),
    phone: z
      .string()
      .transform(normalizePhone)
      .refine((phone) => /^\+84\d{9}$/.test(phone)),
    password: z
      .string()
      .min(8)
      .max(72)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/\d/),
    confirmPassword: z.string(),
    agreeTerms: z.literal(true),
    locale: z.enum(["vi", "en"]).default("vi"),
  })
  .superRefine(({ password, confirmPassword }, context) => {
    if (password !== confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export type RegistrationInput = z.input<typeof registrationSchema>;
