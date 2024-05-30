import prisma from '@prisma_client/prisma';

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
};

export const getUserProfilePageInfo = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { profile: true },
  });
  return user;
};
