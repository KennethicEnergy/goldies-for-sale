import { NextRequest, NextResponse } from "next/server";

import { fetchUsersFromApi, postUserToApi } from "@/lib/test-api";
import { normalizeUsersPayload, toUserApiPayload } from "@/lib/user-mapper";
import { EMPTY_USER_FORM, type UserFormValues } from "@/types/user";

export const dynamic = "force-dynamic";

function asString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function asNumber(value: unknown): number {
  const parsed = Number.parseInt(asString(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  const lowered = asString(value).toLowerCase();
  return lowered === "1" || lowered === "true" || lowered === "yes";
}

function sanitizeRequestBody(body: unknown): {
  values?: UserFormValues;
  error?: string;
} {
  const parsed = typeof body === "object" && body !== null ? body : {};
  const record = parsed as Record<string, unknown>;

  const userNo = asString(record.userNo);
  const lastName = asString(record.lastName);
  const firstName = asString(record.firstName);
  const middleName = asString(record.middleName);
  const birthdate = asString(record.birthdate);

  if (!userNo) {
    return { error: "User No. is required." };
  }
  if (userNo.length > 20) {
    return { error: "User No. must be 20 characters or less." };
  }

  if (!lastName) {
    return { error: "Last Name is required." };
  }
  if (lastName.length > 80) {
    return { error: "Last Name must be 80 characters or less." };
  }

  if (!firstName) {
    return { error: "First Name is required." };
  }
  if (firstName.length > 80) {
    return { error: "First Name must be 80 characters or less." };
  }

  if (middleName.length > 80) {
    return { error: "Middle Name must be 80 characters or less." };
  }

  if (!birthdate) {
    return { error: "Birthdate is required." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
    return { error: "Birthdate must be in YYYY-MM-DD format." };
  }

  const genderValue = asNumber(record.gender) === 2 ? 2 : 1;
  const civilStatusValue = asNumber(record.civilStatus);
  const normalizedCivilStatus =
    civilStatusValue >= 1 && civilStatusValue <= 4 ? civilStatusValue : 1;

  return {
    values: {
      ...EMPTY_USER_FORM,
      eId: asString(record.eId),
      userNo,
      lastName,
      firstName,
      middleName,
      birthdate,
      gender: genderValue,
      civilStatus: normalizedCivilStatus as UserFormValues["civilStatus"],
      skill1: asBoolean(record.skill1),
      skill2: asBoolean(record.skill2),
      skill3: asBoolean(record.skill3),
      skill4: asBoolean(record.skill4),
    },
  };
}

export async function GET() {
  try {
    const upstream = await fetchUsersFromApi();
    if (!upstream.ok) {
      return NextResponse.json(
        {
          message: "Failed to get users from upstream API.",
          upstream: upstream.data,
        },
        { status: upstream.status || 502 }
      );
    }

    return NextResponse.json({
      users: normalizeUsersPayload(upstream.data),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to fetch users.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const { values, error } = sanitizeRequestBody(body);

    if (error || !values) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const upstream = await postUserToApi(toUserApiPayload(values));

    if (!upstream.ok) {
      return NextResponse.json(
        {
          message: "Failed to save user via upstream API.",
          upstream: upstream.data,
        },
        { status: upstream.status || 502 }
      );
    }

    return NextResponse.json({
      message: values.eId ? "User updated successfully." : "User added successfully.",
      upstream: upstream.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to save user.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
