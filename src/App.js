import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePage } from "./HomePage";
import { Header } from "./Header";
import { FilmPage } from "./FilmPage";
import { Footer } from "./Footer";

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
            <div className="max-w-7xl px-4 mx-auto dark text-foreground z-10 box-border min-h-[calc(100dvh-10rem)]">
                <RouterProvider router={router} />
            </div>
            <Footer/>
        </>
    );
}

export default App;
