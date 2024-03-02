export type CreateProfileInput = {
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
  userId: string;
};

export type ChangeProfileInput = Omit<CreateProfileInput, 'userId'>;
