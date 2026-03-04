import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

export default function SmoothScrollProvider({ children }) {
    const lenisRef = useRef(null);
    const rafIdRef = useRef(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        lenisRef.current = lenis;
        // Expose lenis globally so other parts of the app can use scrollTo
        window.__lenis = lenis;

        function raf(time) {
            lenis.raf(time);
            rafIdRef.current = requestAnimationFrame(raf);
        }

        rafIdRef.current = requestAnimationFrame(raf);

        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            lenis.destroy();
            window.__lenis = null;
        };
    }, []);

    return <>{children}</>;
}
