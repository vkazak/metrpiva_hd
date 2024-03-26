import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePage } from "./HomePage";
import { Header } from "./Header";
import { FilmPageWrapper } from "./FilmPage";
import { Footer } from "./Footer";

import { validateAndClearLocalStorage } from "./utils/localStorageUtils";

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />
    },
    {
        path: '/watch/:id',
        element: <FilmPageWrapper/>
    },
]);

const App = () => {
    useEffect(() => {
        try {
            validateAndClearLocalStorage();
        } catch (err) {
            console.error('Error happened while clearing storage ', err);
        }
    }, []);
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
