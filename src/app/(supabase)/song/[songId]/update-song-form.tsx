"use client";

import { useActionState } from "react";
import { updateSong } from "@/app/server/updateSong";

const initialState = {
  success: false,
  error: "",
};

export default function UpdateSongForm({ song }: { song: any }) {
  const [state, formAction, isPending] = useActionState(
    updateSong,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 max-w-xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-800"
    >
      <h1 className="text-2xl font-bold mb-6">Edit Song</h1>

      <input type="hidden" name="songId" value={song.id} />

      {state.error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-300">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/50 dark:text-green-300">
          Song updated successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          defaultValue={song.title}
          required
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Album
        </label>
        <input
          type="text"
          name="album"
          defaultValue={song.album}
          required
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Artist Stage Name
        </label>
        <input
          type="text"
          name="artist"
          defaultValue={song.artist_stage_name}
          required
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language
          </label>
          <input
            type="text"
            name="language"
            defaultValue={song.language}
            required
            className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration (seconds)
          </label>
          <input
            type="number"
            name="duration"
            defaultValue={song.duration}
            required
            min="1"
            className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Song File (Leave empty to keep current)
        </label>
        <input
          type="file"
          name="song"
          accept="audio/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
        />
        <p className="text-xs text-gray-500 mt-1">
          Current URL: {song.songUrl}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cover Image (Leave empty to keep current)
        </label>
        <input
          type="file"
          name="coverImage"
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
        />
        {song.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={song.coverImageUrl}
            alt="Current Cover"
            className="mt-2 h-20 w-20 object-cover rounded"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Updating..." : "Update Song"}
      </button>
    </form>
  );
}
