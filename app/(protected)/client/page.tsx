"use client";

import { UserInfo } from "@/components/user-info";
import { useCurrentUser } from "@/hooks/use-current-user";

/*
this is just to show that we can get use info in Client Component
in the server route, we get user info by auth()
in client route, we get user info from next-auth/react, this is a Client Component 
it could only be used in client component
we could get the exactly same user data from two different ways
*/
const ClientPage = () => {
  const user = useCurrentUser();

  return <UserInfo label="📱 Client component" user={user} />;
};

export default ClientPage;
