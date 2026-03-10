import { useOutletContext } from "react-router-dom";
import useAnimeController from "../hooks/use-anime-controller";

export default function AnimeSearchResults() {
  const { animeList } = useOutletContext<
    ReturnType<typeof useAnimeController>
  >();
  return (
    <>
      <div className="">
        {animeList.map((list) => (
          <div key={list.id} className="">
            {list.name}
          </div>
        ))}
      </div>
    </>
  );
}
