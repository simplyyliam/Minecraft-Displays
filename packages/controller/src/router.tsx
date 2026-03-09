import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout/layout";
import List from "./screens/list";
import AnimeId from "./screens/animeId";


export const Router = createBrowserRouter([
    {
        element: <Layout/>,
        children: [
            {
                element: <List/>,
                index: true
            },
            {
                element:<AnimeId/>,
                path: "/anime/:id"
            }
        ]
    }
])