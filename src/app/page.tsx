"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  CIVIL_STATUS_OPTIONS,
  EMPTY_USER_FORM,
  GENDER_OPTIONS,
  type UserFormValues,
  type UserRecord,
} from "@/types/user";

interface UsersResponse {
  users?: UserRecord[];
  message?: string;
}

interface ActionResponse {
  message?: string;
}

type FieldErrors = Partial<Record<keyof UserFormValues, string>>;

type FlashMessage = {
  type: "success" | "error";
  text: string;
};

function createEmptyForm(): UserFormValues {
  return { ...EMPTY_USER_FORM };
}

function formatBirthdate(value: string): string {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString();
}

function mapSkills(user: UserRecord): string {
  const selectedSkills: string[] = [];
  if (user.skill1) selectedSkills.push("Skill 1");
  if (user.skill2) selectedSkills.push("Skill 2");
  if (user.skill3) selectedSkills.push("Skill 3");
  if (user.skill4) selectedSkills.push("Skill 4");
  return selectedSkills.length > 0 ? selectedSkills.join(", ") : "-";
}

function validateForm(values: UserFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.userNo.trim()) {
    errors.userNo = "User No. is required.";
  } else if (values.userNo.trim().length > 20) {
    errors.userNo = "User No. must be 20 characters or less.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last Name is required.";
  } else if (values.lastName.trim().length > 80) {
    errors.lastName = "Last Name must be 80 characters or less.";
  }

  if (!values.firstName.trim()) {
    errors.firstName = "First Name is required.";
  } else if (values.firstName.trim().length > 80) {
    errors.firstName = "First Name must be 80 characters or less.";
  }

  if (values.middleName.trim().length > 80) {
    errors.middleName = "Middle Name must be 80 characters or less.";
  }

  if (!values.birthdate) {
    errors.birthdate = "Birthdate is required.";
  }

  return errors;
}

export default function Home() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [formValues, setFormValues] = useState<UserFormValues>(createEmptyForm);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserKey, setDeletingUserKey] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);

  const civilStatusLabelMap = useMemo(
    () => new Map(CIVIL_STATUS_OPTIONS.map((option) => [option.value, option.label])),
    []
  );
  const genderLabelMap = useMemo(
    () => new Map(GENDER_OPTIONS.map((option) => [option.value, option.label])),
    []
  );
  const isEditing = Boolean(formValues.eId);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);

    try {
      const response = await fetch("/api/users", {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json()) as UsersResponse;

      if (!response.ok) {
        throw new Error(data.message || "Unable to load users.");
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
      setFlashMessage((current) => (current?.type === "error" ? null : current));
    } catch (error) {
      setUsers([]);
      setFlashMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to load users from API.",
      });
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function resetForm() {
    setFormValues(createEmptyForm());
    setFieldErrors({});
  }

  function populateFormForEdit(user: UserRecord) {
    setFormValues({
      eId: user.eId,
      userNo: user.userNo,
      lastName: user.lastName,
      firstName: user.firstName,
      middleName: user.middleName,
      birthdate: user.birthdate,
      gender: user.gender,
      civilStatus: user.civilStatus,
      skill1: user.skill1,
      skill2: user.skill2,
      skill3: user.skill3,
      skill4: user.skill4,
    });
    setFieldErrors({});
    setFlashMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFlashMessage(null);

    const preparedValues: UserFormValues = {
      ...formValues,
      userNo: formValues.userNo.trim(),
      lastName: formValues.lastName.trim(),
      firstName: formValues.firstName.trim(),
      middleName: formValues.middleName.trim(),
    };

    const validationErrors = validateForm(preparedValues);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setSavingUser(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preparedValues),
      });
      const data = (await response.json()) as ActionResponse;

      if (!response.ok) {
        throw new Error(data.message || "Unable to save user.");
      }

      setFlashMessage({
        type: "success",
        text: data.message || "User saved successfully.",
      });
      resetForm();
      await loadUsers();
    } catch (error) {
      setFlashMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to save the user record.",
      });
    } finally {
      setSavingUser(false);
    }
  }

  async function handleDeleteUser(user: UserRecord) {
    setFlashMessage(null);

    if (!user.eId) {
      setFlashMessage({
        type: "error",
        text:
          "Cannot delete this record because the upstream e_Id value is missing.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Delete ${user.firstName} ${user.lastName} (User No. ${user.userNo})?`
    );
    if (!confirmed) {
      return;
    }

    setDeletingUserKey(user.rowKey);
    try {
      const response = await fetch("/api/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eId: user.eId }),
      });
      const data = (await response.json()) as ActionResponse;

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete user.");
      }

      setFlashMessage({
        type: "success",
        text: data.message || "User deleted successfully.",
      });
      if (formValues.eId === user.eId) {
        resetForm();
      }
      await loadUsers();
    } catch (error) {
      setFlashMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to delete the record.",
      });
    } finally {
      setDeletingUserKey(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6">
        <header className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold md:text-3xl">
            User Management Application
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            API domain in use: <strong>http://localhost:18100</strong>
          </p>
        </header>

        {flashMessage && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              flashMessage.type === "success"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
            }`}
          >
            {flashMessage.text}
          </div>
        )}

        <section className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold">
              {isEditing ? "Edit User" : "Add User"}
            </h2>
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="userNo">
                  User No. <span className="text-rose-600">*</span>
                </label>
                <input
                  id="userNo"
                  type="text"
                  maxLength={20}
                  value={formValues.userNo}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      userNo: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2"
                />
                {fieldErrors.userNo && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.userNo}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="lastName">
                  Last Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  maxLength={80}
                  value={formValues.lastName}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      lastName: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2"
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="firstName">
                  First Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  maxLength={80}
                  value={formValues.firstName}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      firstName: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2"
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="middleName">
                  Middle Name
                </label>
                <input
                  id="middleName"
                  type="text"
                  maxLength={80}
                  value={formValues.middleName}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      middleName: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2"
                />
                {fieldErrors.middleName && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldErrors.middleName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="birthdate">
                  Birthdate <span className="text-rose-600">*</span>
                </label>
                <input
                  id="birthdate"
                  type="date"
                  value={formValues.birthdate}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      birthdate: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2"
                />
                {fieldErrors.birthdate && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldErrors.birthdate}
                  </p>
                )}
              </div>

              <fieldset>
                <legend className="mb-1 block text-sm font-medium">Gender</legend>
                <div className="flex flex-wrap gap-4">
                  {GENDER_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="inline-flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={formValues.gender === option.value}
                        onChange={() =>
                          setFormValues((previous) => ({
                            ...previous,
                            gender: option.value,
                          }))
                        }
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="civilStatus">
                  Civil Status
                </label>
                <select
                  id="civilStatus"
                  value={formValues.civilStatus}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      civilStatus: Number(event.target.value) as UserFormValues["civilStatus"],
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2"
                >
                  {CIVIL_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend className="mb-1 block text-sm font-medium">Skills</legend>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formValues.skill1}
                      onChange={(event) =>
                        setFormValues((previous) => ({
                          ...previous,
                          skill1: event.target.checked,
                        }))
                      }
                    />
                    Skill 1
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formValues.skill2}
                      onChange={(event) =>
                        setFormValues((previous) => ({
                          ...previous,
                          skill2: event.target.checked,
                        }))
                      }
                    />
                    Skill 2
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formValues.skill3}
                      onChange={(event) =>
                        setFormValues((previous) => ({
                          ...previous,
                          skill3: event.target.checked,
                        }))
                      }
                    />
                    Skill 3
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formValues.skill4}
                      onChange={(event) =>
                        setFormValues((previous) => ({
                          ...previous,
                          skill4: event.target.checked,
                        }))
                      }
                    />
                    Skill 4
                  </label>
                </div>
              </fieldset>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingUser}
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
                >
                  {savingUser
                    ? "Saving..."
                    : isEditing
                      ? "Update User"
                      : "Add User"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={savingUser}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Users</h2>
              <button
                type="button"
                onClick={() => void loadUsers()}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100"
              >
                Refresh
              </button>
            </div>

            {loadingUsers ? (
              <p className="text-sm text-slate-600">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-slate-600">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left">
                      <th className="px-3 py-2 font-semibold">User No.</th>
                      <th className="px-3 py-2 font-semibold">Last Name</th>
                      <th className="px-3 py-2 font-semibold">First Name</th>
                      <th className="px-3 py-2 font-semibold">Middle Name</th>
                      <th className="px-3 py-2 font-semibold">Birthdate</th>
                      <th className="px-3 py-2 font-semibold">Gender</th>
                      <th className="px-3 py-2 font-semibold">Civil Status</th>
                      <th className="px-3 py-2 font-semibold">Skills</th>
                      <th className="px-3 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.rowKey} className="border-b border-slate-200">
                        <td className="px-3 py-2">{user.userNo || "-"}</td>
                        <td className="px-3 py-2">{user.lastName || "-"}</td>
                        <td className="px-3 py-2">{user.firstName || "-"}</td>
                        <td className="px-3 py-2">{user.middleName || "-"}</td>
                        <td className="px-3 py-2">{formatBirthdate(user.birthdate)}</td>
                        <td className="px-3 py-2">
                          {genderLabelMap.get(user.gender) || "Male"}
                        </td>
                        <td className="px-3 py-2">
                          {civilStatusLabelMap.get(user.civilStatus) || "Single"}
                        </td>
                        <td className="px-3 py-2">{mapSkills(user)}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => populateFormForEdit(user)}
                              className="rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-amber-600"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteUser(user)}
                              disabled={deletingUserKey === user.rowKey}
                              className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                            >
                              {deletingUserKey === user.rowKey ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
