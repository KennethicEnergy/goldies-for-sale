import type { UserApiPayload } from "@/types/user";

const DEFAULT_TEST_API_BASE_URL = "http://localhost:18100";
const baseUrl =
  process.env.TEST_API_BASE_URL?.replace(/\/+$/, "") || DEFAULT_TEST_API_BASE_URL;

export const TEST_API_ENDPOINTS = {
  getUsers: `${baseUrl}/api/TestAPI/Getusers`,
  postUsers: `${baseUrl}/api/TestAPI/Postusers`,
  deleteUsers: `${baseUrl}/api/TestAPI/Deleteusers`,
};

export interface UpstreamResult {
  ok: boolean;
  status: number;
  data: unknown;
}

function createFormBody(payload: object): string {
  const formData = new URLSearchParams();

  Object.entries(payload as Record<string, unknown>).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  return formData.toString();
}

async function parseUpstreamResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return responseText;
  }
}

export async function fetchUsersFromApi(): Promise<UpstreamResult> {
  const response = await fetch(TEST_API_ENDPOINTS.getUsers, {
    method: "GET",
    cache: "no-store",
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await parseUpstreamResponse(response),
  };
}

export async function postUserToApi(
  payload: UserApiPayload
): Promise<UpstreamResult> {
  const response = await fetch(TEST_API_ENDPOINTS.postUsers, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "omit",
    body: createFormBody(payload),
    cache: "no-store",
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await parseUpstreamResponse(response),
  };
}

export async function deleteUserFromApi(eId: string): Promise<UpstreamResult> {
  const response = await fetch(TEST_API_ENDPOINTS.deleteUsers, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "omit",
    body: createFormBody({ e_Id: eId }),
    cache: "no-store",
  });

  return {
    ok: response.ok,
    status: response.status,
    data: await parseUpstreamResponse(response),
  };
}
