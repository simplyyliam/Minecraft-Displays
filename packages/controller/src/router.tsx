import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layouts/app-layout";
import AnimeSearchResults from "./pages/anime-search-results";
import AnimeDetails from "./pages/anime-details";


export const Router = createBrowserRouter([
    {
        element: <AppLayout/>,
        children: [
            {
                element: <AnimeSearchResults/>,
                index: true
            },
            {
                element:<AnimeDetails/>,
                path: "/anime/:animeId"
            }
        ]
    }
])
