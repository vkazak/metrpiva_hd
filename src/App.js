import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePage } from "./HomePage";
import { Header } from "./Header";
import { FilmPage } from "./FilmPage";

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />
    },
    {
        path: '/watch/:id',
        element: <FilmPage />
    },
]);

const App = () => {
    return (
        <>
            <Header/>
            <div className="max-w-7xl px-4 mx-auto dark text-foreground z-10">
                <RouterProvider router={router} />
            </div>
        </>
    );
}

export default App;
