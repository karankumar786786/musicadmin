import React from "react";
import { auth } from "@clerk/nextjs/server";
import CreateArtistForm from "./create-artist-form";

async function Page() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="p-8 text-center text-red-500">
        Unauthorized: Please sign in.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <CreateArtistForm />
    </div>
  );
}

export default Page;
