import {
  EMPTY_USER_FORM,
  type CivilStatusValue,
  type GenderValue,
  type UserApiPayload,
  type UserFormValues,
  type UserRecord,
} from "@/types/user";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function normalizedKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildKeyValueMap(record: UnknownRecord): Map<string, unknown> {
  const keyValueMap = new Map<string, unknown>();

  Object.entries(record).forEach(([key, value]) => {
    keyValueMap.set(normalizedKey(key), value);
  });

  return keyValueMap;
}

function getValueByCandidates(
  map: Map<string, unknown>,
  candidates: string[]
): unknown {
  for (const candidate of candidates) {
    const mappedValue = map.get(normalizedKey(candidate));
    if (mappedValue !== undefined && mappedValue !== null) {
      return mappedValue;
    }
  }
  return undefined;
}

function asTrimmedString(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

function asInteger(value: unknown): number {
  const parsedNumber = Number.parseInt(asTrimmedString(value), 10);
  return Number.isFinite(parsedNumber) ? parsedNumber : 0;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }

  const lowered = asTrimmedString(value).toLowerCase();
  return lowered === "1" || lowered === "true" || lowered === "yes";
}

function normalizeBirthdate(value: unknown): string {
  const rawBirthdate = asTrimmedString(value);
  if (!rawBirthdate) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawBirthdate)) {
    return rawBirthdate;
  }

  const parsedDate = new Date(rawBirthdate);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
}

function normalizeGender(value: unknown): GenderValue {
  const loweredValue = asTrimmedString(value).toLowerCase();
  if (loweredValue === "female") {
    return 2;
  }

  const numericValue = asInteger(value);
  return numericValue === 2 ? 2 : 1;
}

function normalizeCivilStatus(value: unknown): CivilStatusValue {
  const loweredValue = asTrimmedString(value).toLowerCase();
  if (loweredValue === "married") {
    return 2;
  }
  if (loweredValue === "separated") {
    return 3;
  }
  if (loweredValue === "widowed") {
    return 4;
  }

  const numericValue = asInteger(value);
  if (numericValue >= 1 && numericValue <= 4) {
    return numericValue as CivilStatusValue;
  }

  return 1;
}

function extractUsersArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const preferredArrayKeys = [
    "users",
    "data",
    "result",
    "results",
    "items",
    "value",
  ];

  for (const key of preferredArrayKeys) {
    const candidate = payload[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function mapRawUserToRecord(rawUser: unknown, index: number): UserRecord | null {
  if (!isRecord(rawUser)) {
    return null;
  }

  const keyValueMap = buildKeyValueMap(rawUser);
  const eId = asTrimmedString(
    getValueByCandidates(keyValueMap, ["e_Id", "eId", "eid", "id"])
  );
  const userNo = asTrimmedString(
    getValueByCandidates(keyValueMap, ["idNo", "userNo", "userNumber"])
  );

  const userRecord: UserRecord = {
    ...EMPTY_USER_FORM,
    rowKey: eId || `${userNo || "user"}-${index}`,
    eId,
    userNo,
    lastName: asTrimmedString(
      getValueByCandidates(keyValueMap, ["lastname", "lastName", "surname"])
    ),
    firstName: asTrimmedString(
      getValueByCandidates(keyValueMap, ["firstname", "firstName", "givenName"])
    ),
    middleName: asTrimmedString(
      getValueByCandidates(keyValueMap, ["middleName", "middlename", "middle"])
    ),
    birthdate: normalizeBirthdate(
      getValueByCandidates(keyValueMap, ["birthdate", "birthDate", "dob"])
    ),
    gender: normalizeGender(
      getValueByCandidates(keyValueMap, ["gender", "sex"])
    ),
    civilStatus: normalizeCivilStatus(
      getValueByCandidates(keyValueMap, ["civilStatus", "maritalStatus"])
    ),
    skill1: asBoolean(getValueByCandidates(keyValueMap, ["skill1"])),
    skill2: asBoolean(getValueByCandidates(keyValueMap, ["skill2"])),
    skill3: asBoolean(getValueByCandidates(keyValueMap, ["skill3"])),
    skill4: asBoolean(getValueByCandidates(keyValueMap, ["skill4"])),
  };

  return userRecord;
}

export function normalizeUsersPayload(payload: unknown): UserRecord[] {
  return extractUsersArray(payload)
    .map((rawUser, index) => mapRawUserToRecord(rawUser, index))
    .filter((record): record is UserRecord => record !== null);
}

export function toUserApiPayload(form: UserFormValues): UserApiPayload {
  return {
    e_Id: form.eId,
    idNo: form.userNo,
    lastname: form.lastName,
    firstname: form.firstName,
    middleName: form.middleName,
    birthdate: form.birthdate,
    gender: form.gender,
    civilStatus: form.civilStatus,
    skill1: form.skill1 ? 1 : 0,
    skill2: form.skill2 ? 1 : 0,
    skill3: form.skill3 ? 1 : 0,
    skill4: form.skill4 ? 1 : 0,
  };
}
