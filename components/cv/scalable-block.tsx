"use client";

import { useRef, useEffect, useState, PropsWithChildren, useLayoutEffect } from "react";

export function ScalableBlock({ children }: PropsWithChildren) {
    const blockRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (typeof window === 'undefined') return
        const adjustScale = () => {
            if (!blockRef.current) return;

            const windowWidth = window.innerWidth;
            const blockWidth = blockRef.current.scrollWidth;

            // Вычисляем масштаб по ширине окна
            const newScale = Math.min(windowWidth / blockWidth, 1);
            setScale(newScale);
        };

        adjustScale();
        window.addEventListener("resize", adjustScale);
        return () => window.removeEventListener("resize", adjustScale);
    }, []);

    return (
        <div
            ref={blockRef}
            style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                boxSizing: "border-box",
            }}
        >
            {children}
        </div>
    );
};