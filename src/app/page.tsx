"use client"
import { UserButton } from "@clerk/nextjs";
import {useUser} from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Sign in to view this page</div>;
  console.log(user);
  console.log(user.emailAddresses);
  console.log(user.id)
  // console.table(user);
  return <div>Hello {user.firstName}!</div>
}
