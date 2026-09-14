# PetCare Authentication UI Brief

Build production-ready login and signup pages for the existing PetCare web app. The result should feel calm, editorial, trustworthy, and contemporary. It must visually match the current homepage without falling into generic healthcare styling.

## Product and stack

- Framework: Next.js App Router with TypeScript
- Styling: Tailwind CSS
- Components: reuse the project's existing shadcn/ui primitives where appropriate
- Icons: Lucide React only
- Authentication: preserve or prepare clean handlers for the existing Auth.js setup
- Locales: Vietnamese and English through the existing `next-intl` structure
- Routes: `/[locale]/login` and `/[locale]/register`
- Use existing localized strings in `messages/vi.json` and `messages/en.json`; add only strings that are genuinely missing

## Visual direction

The design language is warm modernism: soft off-white canvas, graphite typography, dark editorial surfaces, and a restrained coral accent. It should feel like a considered consumer product, not a hospital portal.

Avoid:

- blue or green medical clichés
- gradients
- glassmorphism
- excessive shadows
- pill-shaped containers everywhere
- decorative blobs or floating icon clouds
- oversized marketing headlines
- stock dashboard patterns inside the form
- emojis

## Typography

Use Inter from the official variable font already included in the project.

```css
font-family: "InterVariable", Inter, ui-sans-serif, system-ui, sans-serif;
```

- Page title: 36px desktop, 30px mobile, weight 600, line-height 1.05, tracking `-0.035em`
- Supporting copy: 16px, weight 400, line-height 1.6
- Labels: 14px, weight 600
- Inputs and buttons: 15px, weight 500 to 650
- Small utility text: 13px, weight 450, line-height 1.45
- Use sentence case throughout
- Do not use all caps for normal UI labels

## Color tokens

### Light mode

```css
--page: #F3F3F0;
--surface: #FFFFFF;
--surface-subtle: #E7E7E2;
--ink: #20211F;
--ink-muted: #676964;
--border: #D1D2CC;
--accent: #D85F53;
--accent-hover: #B9473E;
--accent-soft: #FFE4DF;
--on-accent: #1A1B19;
--danger: #DC2626;
```

### Dark mode

```css
--page: #171816;
--surface: #242523;
--surface-subtle: #292A28;
--ink: #F1F1ED;
--ink-muted: #B7B8B2;
--border: rgba(255, 255, 255, 0.14);
--accent: #EF7569;
--accent-hover: #F18A80;
--accent-soft: rgba(239, 117, 105, 0.14);
--on-accent: #1A1B19;
--danger: #F87171;
```

Coral is the only brand accent. Use red only for errors and destructive feedback.

## Page composition

Use a responsive two-column layout on desktop and a single-column layout on mobile.

### Desktop, 1024px and wider

- Full viewport height with a maximum content width of 1440px
- Left side: 44% visual/editorial panel
- Right side: 56% form area
- Outer page padding: 16px to 24px
- Both panels use a 16px corner radius
- Keep the form itself narrow, between 420px and 460px
- Vertically center the form while keeping enough room for errors without layout jumps

### Visual panel

- Use `/images/petcare-consultation.webp` as the full-bleed image
- Apply a subtle dark overlay only when required for text contrast
- Place the PetCare mark at the top-left
- Add one short, human line near the bottom, such as: `Chăm sóc rõ ràng, từ lần khám đầu tiên.`
- Keep the image panel quiet. No feature list, testimonial carousel, floating cards, or badges
- A small `Back to home` link may sit beside the mark

### Form panel

- Use the off-white page color rather than a card floating on another background
- Show the PetCare mark above the form on mobile only
- Keep title, description, form, alternative sign-in, and account switch link in one clear vertical flow
- Vertical rhythm: 32px between major groups, 20px between fields, 8px between label and input

## Login page

Use this hierarchy:

1. Title: `Đăng nhập` / `Sign in`
2. Supporting line: concise and reassuring, not promotional
3. Email input
4. Password input with show/hide control
5. `Quên mật khẩu?` / `Forgot password?` aligned with the password label
6. Primary submit button
7. Divider labelled `hoặc` / `or`
8. Google sign-in button
9. Phone sign-in button if the existing auth flow supports it
10. Account switch link to signup

Do not add a remember-me checkbox unless the backend already supports it.

## Signup page

Use this hierarchy:

1. Title: `Tạo tài khoản` / `Create account`
2. Supporting line explaining that one account keeps care information together
3. Account type selector
4. Full name
5. Email
6. Phone number
7. Password
8. Confirm password
9. Terms acknowledgement
10. Primary submit button
11. Account switch link to login

### Account type selector

Provide two large, accessible radio-card options:

- `Chủ thú cưng` / `Pet owner`
- `Phòng khám / Bác sĩ thú y` / `Clinic / Veterinarian`

Use simple Lucide icons and a short description. The selected option gets a coral border and soft coral background. Keep corners at 12px, not pill-shaped.

On small screens, stack the options. On wider form layouts, show them in two columns.

## Component specifications

### Inputs

- Height: 48px
- Border radius: 10px
- Border: 1px solid the theme border
- Background: white in light mode, graphite surface in dark mode
- Horizontal padding: 14px
- Placeholder uses muted ink and remains readable
- Hover: slightly darker border
- Focus: coral border plus a 3px translucent coral ring
- Error: red border, red focus ring, and one concise message below
- Disabled: reduced contrast and `not-allowed` cursor
- Preserve space for validation feedback where practical

### Primary button

- Height: 48px
- Width: 100%
- Radius: 10px
- Background: coral
- Text: near-black for sufficient contrast with the selected coral
- Hover: darker coral and translate up by 1px
- Active: return to the baseline
- Loading: keep the label width stable and show a small spinner
- Disabled: no hover movement

### Social buttons

- Height: 48px
- White or graphite surface
- 1px border
- Platform icon on the left, label visually centered
- No heavy shadow

### Links

- Default: graphite with an underline offset
- Hover/focus: coral
- Never rely on color alone to indicate interactivity

### Feedback

- Inline field errors for field-level problems
- One compact alert above the submit button for form-level errors
- Success states should confirm the outcome and next action
- Avoid toast notifications for validation errors

## Interaction and motion

- Motion should be subtle and functional
- Page entrance: form fades in and moves upward by 8px over 300ms
- Input, button, and selector transitions: 150ms to 200ms
- Use `ease-out` for entrances and standard easing for color changes
- Respect `prefers-reduced-motion`
- Do not use scroll animation, parallax, springy form controls, or continuous motion

## Responsive behavior

- Below 1024px, remove the visual panel and center the form in the viewport
- Mobile horizontal padding: 20px
- Mobile top and bottom padding: 32px
- Form width: 100%, maximum 460px
- Keep every touch target at least 44px high
- Avoid horizontal overflow at 320px width
- When the keyboard opens, the page must remain scrollable and the active field must stay reachable

## Accessibility

- Meet WCAG AA contrast
- Use real `<label>` elements connected to every field
- Use `autocomplete` values such as `email`, `current-password`, `new-password`, `name`, and `tel`
- Set `aria-invalid` and `aria-describedby` for invalid fields
- Ensure account type cards work with keyboard and screen readers
- Keep focus indicators visible in both themes
- Announce async errors through an `aria-live="polite"` region
- Password visibility buttons need explicit localized accessible labels
- Do not disable paste in password fields

## Implementation guardrails

- Reuse the existing locale-aware `Link` helper from `@/lib/navigation`
- Reuse the existing font at `/fonts/inter-variable.woff2`
- Reuse the current navbar brand mark or extract it into a shared component
- Preserve the current light/dark behavior based on `prefers-color-scheme`
- Keep auth logic separate from visual form components
- Use a shared `AuthShell` for both pages and shared field/button primitives where helpful
- Do not rewrite global design tokens or unrelated pages
- Do not invent backend endpoints or claim social auth works unless it is already configured
- Include loading, validation, server error, and disabled states in the implementation

## Acceptance checklist

- Login and signup look native to the redesigned PetCare homepage
- Inter is the only product typeface
- Vietnamese text fits without clipping or awkward wrapping
- Both pages work at 320px, 768px, 1024px, and 1440px widths
- Light and dark themes are complete
- Keyboard navigation follows a logical order
- Validation messages do not cause severe layout shift
- Primary actions are obvious without excessive decoration
- No gradients, glass effects, blue medical palette, or generic floating cards
- Existing routing, localization, and authentication integrations remain intact
