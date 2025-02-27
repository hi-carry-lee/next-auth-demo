import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  // no need to validate the length of password, since some situations like first time login, the password won't satisfy the requirement
  password: z.string().nonempty("You must input your password!"),
});
