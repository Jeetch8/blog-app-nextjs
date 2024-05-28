import prisma from '@prisma_client/prisma';

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
};

export const getUserProfileByUsername = async (username: string) => {
  const profile = await prisma.user_Profile.findUnique({
    where: { username },
  });
  return profile;
};
