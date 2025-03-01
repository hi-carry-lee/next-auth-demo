"use server";

import * as z from "zod";
import { RegisterSchema } from "@/schemas/index";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  console.log("register action, data is: ", values);
  const validatedFields = RegisterSchema.safeParse(values);

  // if use validatedFields directly, then in the following destructure, it will has some error;
  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, name, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  // check if the email is used by other people;
  // const existingUser = await db.user.findUnique({
  //   where: {
  //     email,
  //   },
  // });
  // extract the above code to a common method, since we will use it multiple times;
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // TODO: send verification token email
  return { success: "User created!" };
};
