import { useEffect, useMemo } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import useAnimeController from "../hooks/use-anime-controller";

type StoredAnime = {
  id: string;
  name: string;
  poster: string;
};

type StoredEpisode = {
  title: string;
  episodesId: string;
  number?: number;
  isFiller?: boolean;
};

export default function AnimeDetails() {
  const { animeId } = useParams<{ animeId: string }>();
  const { animeList, episodes } =
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
      // Ignore storage write errors (e.g. storage full, private mode).
    }
  }, [anime, animeStorageKey]);

  const activeAnime = anime ?? storedAnime;
  const activeEpisodes =
    episodes.length > 0 ? episodes : storedEpisodes ?? [];

  useEffect(() => {
    if (!episodesStorageKey || episodes.length === 0) return;
    try {
      localStorage.setItem(episodesStorageKey, JSON.stringify(episodes));
    } catch {
      // Ignore storage write errors (e.g. storage full, private mode).
    }
  }, [episodes, episodesStorageKey]);

  return (
    <div className="flex flex-col gap-2 w-full h-full p-2">
      <div className="flex gap-2.5 h-fit w-full">
        <div className="flex border-2 h-15 w-15">
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
        <div className="flex flex-col gap-1">
          <span className="font-semibold">
            {activeAnime?.name ?? "Unknown anime"}
          </span>
          <span className="text-sm font-medium text-black/50">{animeId}</span>
        </div>
      </div>
      <div className="flex flex-col w-full h-full border-2">
        {activeEpisodes.map((ep) => (
          <div key={ep.episodesId}>
            <span>{ep.title}</span>
            <span>{ep.episodesId}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// https://hianime.to/watch/hells-paradise-18332?ep=100187
