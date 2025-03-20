import { useSession } from "next-auth/react";

/**  
 A Custom hook that provides an easy way to retrieves the current user info from the authentication session.  
 */
export const useCurrentUser = () => {
  const session = useSession();

  return session.data?.user;
};
