import { motion } from "framer-motion";

export const AnimatedDiv = ({ 
    opacity = 1, 
    hoverOpacity = 1, 
    ...rest 
}) => {
    return <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity }}
        whileHover={{ opacity: hoverOpacity }}
        transition={{ duration: 0.5 }}
        {...rest}
    />
}