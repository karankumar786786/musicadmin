// app/dashboard/page.tsx
import { UserAvatar, UserButton, UserProfile } from '@clerk/nextjs';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Suspense } from 'react';

export default async function DashboardPage() {
  // 1. Get the userId for quick authorization
  const { userId } = await auth();

  if (!userId) {
    return <div>Not logged in</div>;
  }
  // 2. Get the full user object to access the email/username
  const user = await currentUser();

  // Accessing email (User can have multiple, so we use the primary one)
  const email = user?.primaryEmailAddress?.emailAddress;
  const username = user?.username;

  return (
    <>
    <Suspense fallback = {<><div>loading</div></>}>
      <UserButton />
        <div className="p-8">
      <h1>Welcome, {username || "User"}!</h1>
      <p>Your primary email is: {email}</p>
      <p>Your Internal Clerk ID is: {userId}</p>
    </div>
    </Suspense>
    </>
  );
}