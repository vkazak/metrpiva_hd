import { Image } from "@nextui-org/react";

export const Header = () => {
    return <div className="shadow flex items-center justify-center h-20 z-10">
        <a href='/'>
            <Image className="max-h-16" src='/logo.png' disableSkeleton/>
        </a>
    </div>
};