import { useEffect, useMemo } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import useAnimeController from "../hooks/use-anime-controller";

type StoredAnime = {
  id: string;
  name: string;
  poster: string;
};

export default function AnimeDetails() {
  const { animeId } = useParams<{ animeId: string }>();
  const { animeList, episodes } =
    useOutletContext<ReturnType<typeof useAnimeController>>();
  const anime = animeList.find((item) => item.id === animeId);
  console.log("Episodes:", episodes);
  const storageKey = useMemo(
    () => (animeId ? `controller-anime:${animeId}` : ""),
    [animeId],
  );

  const storedAnime = useMemo<StoredAnime | null>(() => {
    if (!storageKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as StoredAnime) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  useEffect(() => {
    if (!anime || !storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(anime));
    } catch {
      // Ignore storage write errors (e.g. storage full, private mode).
    }
  }, [anime, storageKey]);

  const activeAnime = anime ?? storedAnime;

  console.log("animeId in hook:", animeId);

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
      <div className="flex flex-col w-full h-full border-2 ">
        {episodes.map((ep) => (
          <div key={ep.episodesId}>{ep.title}</div>
        ))}
      </div>
    </div>
  );
}
