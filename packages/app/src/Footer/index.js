import packageJson from '../../package.json';
import { AnimatedDiv } from '../components/AnimatedDiv';

export const Footer = () => {
    return <AnimatedDiv 
        opacity={0.3}
        hoverOpacity={0.7}
        className='flex justify-center items-center gap-6 h-20'
    >
        <p className='text-sm'>v {packageJson?.version}</p>
    </AnimatedDiv>
}