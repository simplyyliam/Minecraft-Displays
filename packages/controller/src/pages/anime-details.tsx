import { useEffect, useMemo } from "react";
import {  useOutletContext, useParams } from "react-router-dom";
import useAnimeController from "../hooks/use-anime-controller";
import axios from "axios";
import { API_URL } from "../constants";

type StoredAnime = {
  id: string;
  name: string;
  poster: string;
};

type StoredEpisode = {
  title: string;
  episodeId: string;
  number?: number;
  isFiller?: boolean;
};

export default function AnimeDetails() {
  const { animeId } = useParams<{ animeId: string }>();
  const { animeList, episodes, setStreamUrl, submitUrl } =
    useOutletContext<ReturnType<typeof useAnimeController>>();
  const anime = animeList.find((item) => item.id === animeId);
  const animeStorageKey = useMemo(
    () => (animeId ? `controller-anime:${animeId}` : ""),
    [animeId],
  );
  const episodesStorageKey = useMemo(
    () => (animeId ? `controller-episodes:${animeId}` : ""),
    [animeId],
  );

  const storedAnime = useMemo<StoredAnime | null>(() => {
    if (!animeStorageKey) return null;
    try {
      const raw = localStorage.getItem(animeStorageKey);
      return raw ? (JSON.parse(raw) as StoredAnime) : null;
    } catch {
      return null;
    }
  }, [animeStorageKey]);

  const storedEpisodes = useMemo<StoredEpisode[] | null>(() => {
    if (!episodesStorageKey) return null;
    try {
      const raw = localStorage.getItem(episodesStorageKey);
      return raw ? (JSON.parse(raw) as StoredEpisode[]) : null;
    } catch {
      return null;
    }
  }, [episodesStorageKey]);

  useEffect(() => {
    if (!anime || !animeStorageKey) return;
    try {
      localStorage.setItem(animeStorageKey, JSON.stringify(anime));
    } catch {
      // Ig e storage write errors (e.g. storage full, private mode).
    }
  }, [anime, animeStorageKey]);

  const activeAnime = anime ?? storedAnime;
  const activeEpisodes =
    episodes.length > 0 ? episodes : (storedEpisodes ?? []);

  useEffect(() => {
    if (!episodesStorageKey || episodes.length === 0) return;
    try {
      localStorage.setItem(episodesStorageKey, JSON.stringify(episodes));
    } catch {
      // Ignore storage write errors (e.g. storage full, private mode).
    }
  }, [episodes, episodesStorageKey]);

const generateStreamUrl = async (episodeId: string) => {
  try {
    console.log("Episode clicked:", episodeId);

    // Extract numeric ID after ::ep=
    const cleanId = episodeId.includes("::ep=")
      ? episodeId.split("::ep=")[1]
      : episodeId;

    console.log("Clean ID:", cleanId);

    const res = await axios.get(`${API_URL}/anime/episode-src/${cleanId}`);
    const stream = res.data.sources[0].url;
    console.log("Stream URL:", stream);

    setStreamUrl(stream);
    await submitUrl(stream);
  } catch (err) {
    console.error("Failed to fetch stream URL", err);
  }
};

  return (
    <div className="flex flex-col gap-2 w-full h-full p-2 text-sm">
      <div className="flex gap-2 h-fit w-full">
        <div className="flex border-2 h-12 w-12">
          {activeAnime?.poster ? (
            <img
              className="w-full"
              src={activeAnime.poster}
              alt={activeAnime.name}
              style={{
                objectFit: "cover",
              }}
            />
          ) : (
            <span className="p-2">No poster available</span>
          )}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-semibold">
            {activeAnime?.name ?? "Unknown anime"}
          </span>
          <span className="text-xs font-medium text-black/50 truncate">
            {animeId}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-start gap-1 p-2 w-full flex-1 min-h-0 overflow-hidden overflow-y-auto border-2">
        {activeEpisodes.map((ep) => (
          <button
            onClick={() => generateStreamUrl(ep.episodeId)}
            className="cursor-pointer w-full text-left"
            key={ep.episodeId}
          >
            <div className="flex justify-between w-full">
              <span>{ep.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

