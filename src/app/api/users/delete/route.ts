import { NextRequest, NextResponse } from "next/server";

import { deleteUserFromApi } from "@/lib/test-api";

function asString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = typeof body === "object" && body !== null ? body : {};
    const record = parsed as Record<string, unknown>;
    const eId = asString(record.eId);

    if (!eId) {
      return NextResponse.json(
        { message: "Missing eId. Cannot delete user." },
        { status: 400 }
      );
    }

    const upstream = await deleteUserFromApi(eId);
    if (!upstream.ok) {
      return NextResponse.json(
        {
          message: "Failed to delete user via upstream API.",
          upstream: upstream.data,
        },
        { status: upstream.status || 502 }
      );
    }

    return NextResponse.json({
      message: "User deleted successfully.",
      upstream: upstream.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to delete user.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
