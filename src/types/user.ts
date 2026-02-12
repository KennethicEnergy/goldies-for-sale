export type GenderValue = 1 | 2;
export type CivilStatusValue = 1 | 2 | 3 | 4;

export interface UserFormValues {
  eId: string;
  userNo: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthdate: string;
  gender: GenderValue;
  civilStatus: CivilStatusValue;
  skill1: boolean;
  skill2: boolean;
  skill3: boolean;
  skill4: boolean;
}

export interface UserRecord extends UserFormValues {
  rowKey: string;
}

export interface UserApiPayload {
  e_Id: string;
  idNo: string;
  lastname: string;
  firstname: string;
  middleName: string;
  birthdate: string;
  gender: number;
  civilStatus: number;
  skill1: number;
  skill2: number;
  skill3: number;
  skill4: number;
}

export const EMPTY_USER_FORM: UserFormValues = {
  eId: "",
  userNo: "",
  lastName: "",
  firstName: "",
  middleName: "",
  birthdate: "",
  gender: 1,
  civilStatus: 1,
  skill1: false,
  skill2: false,
  skill3: false,
  skill4: false,
};

export const GENDER_OPTIONS = [
  { label: "Male", value: 1 as GenderValue },
  { label: "Female", value: 2 as GenderValue },
];

export const CIVIL_STATUS_OPTIONS = [
  { label: "Single", value: 1 as CivilStatusValue },
  { label: "Married", value: 2 as CivilStatusValue },
  { label: "Separated", value: 3 as CivilStatusValue },
  { label: "Widowed", value: 4 as CivilStatusValue },
];
