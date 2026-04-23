import { useEffect, useState } from "react";

export function useIsTablet(): boolean {
    const [isTablet, setIsTablet] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.innerWidth <= 1024;
    });

    useEffect(() => {
        function handleResize() {
            setIsTablet(window.innerWidth <= 1024);
        }

        window.addEventListener("resize", handleResize);
        // Call once in case of SSR hydration mismatch
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isTablet;
}
