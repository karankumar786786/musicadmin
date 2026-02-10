"use client";

import { useActionState } from "react";
import { createSystemPlaylist } from "@/app/server/createSystemPlaylist";

const initialState = {
  success: false,
  error: "",
};

export default function CreateSystemPlaylistForm() {
  const [state, formAction, isPending] = useActionState(
    createSystemPlaylist,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 max-w-xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-800"
    >
      <h1 className="text-2xl font-bold mb-6">Create System Playlist</h1>

      {state.error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-300">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/50 dark:text-green-300">
          Playlist created successfully!
        </div>
      )}

      <div>
        <label
          htmlFor="playlistName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Playlist Name
        </label>
        <input
          type="text"
          name="playlistName"
          id="playlistName"
          required
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="e.g. Top Hits"
        />
      </div>

      <div>
        <label
          htmlFor="coverImage"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Playlist Cover Image
        </label>
        <input
          type="file"
          name="coverImage"
          id="coverImage"
          accept="image/*"
          required
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Creating..." : "Create Playlist"}
      </button>
    </form>
  );
}
