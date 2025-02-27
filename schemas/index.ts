import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  // no need to validate the length of password, since some situations like first time login, the password won't satisfy the requirement
  password: z.string().nonempty("You must input your password!"),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z
    .string()
    .min(6, {
      message: "Minimum 6 characters required",
    })
    .nonempty("You must input your password!"),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});
