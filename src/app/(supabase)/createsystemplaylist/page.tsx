import React from "react";
import CreateSystemPlaylistForm from "./create-system-playlist-form";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-10">
      <CreateSystemPlaylistForm />
    </div>
  );
}
