import { Link, useOutletContext } from "react-router-dom";
import useAnimeController from "../hooks/use-anime-controller";

export default function AnimeSearchResults() {
  const { animeList } =
    useOutletContext<ReturnType<typeof useAnimeController>>();
  return (
    <>
      <div className="flex flex-col">
        {animeList.map((list) => (
          <Link to={`/anime/${list.id}`} key={list.id} className="">
            {list.name}
          </Link>
        ))}
      </div>
    </>
  );
}
