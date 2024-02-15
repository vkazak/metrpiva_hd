import { Image } from '@nextui-org/image';
import packageJson from '../../package.json';

export const Footer = () => {
    return <div className='flex justify-center items-center gap-6 opacity-30 hover:opacity-80 transition-opacity h-20'>
        <p className='text-sm'>v {packageJson?.version}</p>
        <div className='flex items-center gap-1'>
            <Image className='h-12' src='./tg-logo.svg' />
            <p className='text-sm'>@Victor_k</p>
        </div>
    </div>
}