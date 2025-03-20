import { useSession } from "next-auth/react";

/**  
 A Custom hook that provides an easy way to retrieves the current user's role from the authentication session.  
 */
export const useCurrentRole = () => {
  const session = useSession();

  return session.data?.user?.role;
};
