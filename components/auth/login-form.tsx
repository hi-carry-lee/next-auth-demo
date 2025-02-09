import { CardWrapper } from "@/components/auth/card-wrapper";

// it's a component not a page, so don't use default export
export function LoginForm() {
  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      this is login-form component
    </CardWrapper>
  );
}
