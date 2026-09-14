import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { Role } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

interface CreateContextOptions {
  headers: Headers;
  req?: NextRequest;
}

export const createTRPCContext = async (opts: CreateContextOptions) => {
  const session = await auth();
  return {
    db,
    session,
    headers: opts.headers,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// ─────────────────────────────────────────────────────────────
// tRPC Init
// ─────────────────────────────────────────────────────────────

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (process.env.NODE_ENV === "development") {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();
  const end = Date.now();
  console.log(`[tRPC] ${path} - ${end - start}ms`);

  return result;
});

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const isClinicOrAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const role = ctx.session.user.role as Role;
  if (role !== Role.CLINIC_ADMIN && role !== Role.SYSTEM_ADMIN && role !== Role.VET) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This action requires a clinic or admin role",
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const isSystemAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if ((ctx.session.user.role as Role) !== Role.SYSTEM_ADMIN) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "System admin access required",
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// ─────────────────────────────────────────────────────────────
// Procedure Builders (exported)
// ─────────────────────────────────────────────────────────────

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/** Public — no auth required */
export const publicProcedure = t.procedure.use(timingMiddleware);

/** Requires any authenticated session */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(isAuthenticated);

/** Requires CLINIC_ADMIN | VET | SYSTEM_ADMIN */
export const clinicProcedure = t.procedure
  .use(timingMiddleware)
  .use(isClinicOrAdmin);

/** Requires SYSTEM_ADMIN */
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(isSystemAdmin);
