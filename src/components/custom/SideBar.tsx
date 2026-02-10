"use client";
import { UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

function SideBar() {
  const router = useRouter();
  function redirect(to: string) {
    router.push(to);
  }
  return (
    <div className="h-screen w-full flex flex-col gap-3 p-3 bg-amber-900">
      <UserButton />
      <Button
        onClick={() => {
          redirect("/listsongs");
        }}
      >
        Songs
      </Button>
      <Button
      onClick={()=>{redirect("/listartists")}}
      >Artist</Button>
      <Button 
      onClick={()=>{redirect("/listsystemplaylists")}}
      >System Playlist</Button>
    </div>
  );
}
export default SideBar;
