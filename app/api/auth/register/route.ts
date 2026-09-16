import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { registrationSchema } from "@/lib/auth/validation";
import { db } from "@/server/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "INVALID_REGISTRATION",
        message: "Invalid registration details.",
      },
      { status: 400 },
    );
  }

  const { accountType, fullName, email, phone, password, locale } = parsed.data;

  try {
    const existingUser = await db.user.findFirst({
      where: { OR: [{ email }, { phone }] },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { code: "ACCOUNT_EXISTS", message: "An account already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const requiresReview = accountType === "clinic";

    await db.user.create({
      data: {
        name: fullName,
        email,
        phone,
        passwordHash,
        locale,
        role: Role.OWNER,
        requestedRole: requiresReview ? Role.CLINIC_ADMIN : null,
        termsAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, requiresReview }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { code: "ACCOUNT_EXISTS", message: "An account already exists." },
        { status: 409 },
      );
    }

    console.error("Registration failed", error);
    return NextResponse.json(
      { code: "REGISTRATION_FAILED", message: "Unable to create account." },
      { status: 500 },
    );
  }
}
