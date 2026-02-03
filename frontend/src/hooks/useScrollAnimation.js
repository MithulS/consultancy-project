import { useEffect, useRef, useState } from 'react';

/**
 * useScrollAnimation Hook
 * 
 * Triggers an animation state when an element enters the viewport.
 * 
 * Usage:
 * const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });
 * <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
 * 
 * @param {Object} options - IntersectionObserver options
 * @returns {[React.RefObject, boolean]} - Ref to attach and boolean visibility state
 */
export const useScrollAnimation = (options = {}) => {
    const elementRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            // Trigger only once when it comes into view
            if (entry.isIntersecting) {
                setIsVisible(true);
                // Optional: Stop observing once visible if you only want it to animate once
                if (elementRef.current) {
                    observer.unobserve(elementRef.current);
                }
            }
        }, {
            threshold: 0.1, // Trigger when 10% is visible
            rootMargin: '0px 0px -50px 0px', // Trigger slightly before bottom
            ...options
        });

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [options]);

    return [elementRef, isVisible];
};

export default useScrollAnimation;
