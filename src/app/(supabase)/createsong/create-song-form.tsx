"use client";

import { useActionState, useState, ChangeEvent } from "react";
import { createSong } from "@/app/server/createSong";

const initialState = {
  success: false,
  error: "",
};

export default function CreateSongForm() {
  const [state, formAction, isPending] = useActionState(
    createSong,
    initialState,
  );

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");

  const handleSongChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Set title from filename
      const fileName = file.name.split(".").slice(0, -1).join(".");
      setTitle(fileName);

      // Detect duration
      const audio = new Audio();
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          audio.src = event.target.result as string;
          audio.addEventListener("loadedmetadata", () => {
            setDuration(Math.round(audio.duration).toString());
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      action={formAction}
      className="space-y-6 max-w-xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-800"
    >
      <h1 className="text-2xl font-bold mb-6">Upload New Song</h1>

      {state.error && (
        <div
          className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-300"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/50 dark:text-green-300"
          role="alert"
        >
          Song created successfully!
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Song Title"
        />
      </div>

      <div>
        <label
          htmlFor="album"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Album
        </label>
        <input
          type="text"
          name="album"
          id="album"
          required
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Album Name"
        />
      </div>

      <div>
        <label
          htmlFor="artist"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Artist Stage Name
        </label>
        <input
          type="text"
          name="artist"
          id="artist"
          required
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Artist Name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Language
          </label>
          <input
            type="text"
            name="language"
            id="language"
            required
            className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. English"
          />
        </div>
        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Duration (seconds)
          </label>
          <input
            type="number"
            name="duration"
            id="duration"
            required
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. 180"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="song"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Song File
        </label>
        <input
          type="file"
          name="song"
          id="song"
          accept="audio/*"
          required
          onChange={handleSongChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
        />
      </div>

      <div>
        <label
          htmlFor="coverImage"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Cover Image
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
        {isPending ? "Uploading..." : "Create Song"}
      </button>
    </form>
  );
}
