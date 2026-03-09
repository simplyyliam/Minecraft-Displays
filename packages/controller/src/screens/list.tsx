import { useOutletContext } from "react-router-dom";
import useAnime from "../hooks/useAnime";

export default function List() {
  const { animeList } = useOutletContext<ReturnType<typeof useAnime>>();
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
