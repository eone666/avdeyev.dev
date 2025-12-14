"use client";

import { useRef, useEffect, useState, PropsWithChildren, useLayoutEffect } from "react";

export function ScalableBlock({ children }: PropsWithChildren) {
    const blockRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [isReady, setIsReady] = useState(false);

    useLayoutEffect(() => {
        if (typeof window === 'undefined') return


        const adjustScale = () => {
            if (!blockRef.current) return;


            const viewportWidth = window.visualViewport
                ? window.visualViewport.width
                : window.innerWidth;

            const availableWidth = viewportWidth;
            const contentWidth = blockRef.current.scrollWidth;

            const newScale = Math.min(availableWidth / contentWidth, 1);
            setScale(newScale);
            setIsReady(true);
        };

        requestAnimationFrame(() => {
            adjustScale();
        });
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", adjustScale);
        }
        window.addEventListener("resize", adjustScale);
        return () => window.removeEventListener("resize", adjustScale);
    }, []);

    return (
        <div
            ref={blockRef}
            style={{
                opacity: isReady ? 1 : 0,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                boxSizing: "border-box",
                padding: '0 16px',
                width: "fit-content",
                marginInline: 'auto',
                height: isReady ? `${blockRef.current?.scrollHeight ? blockRef.current.scrollHeight * scale : 'auto'}px` : 'auto',
            }}
        >
            {children}
        </div>
    );
};