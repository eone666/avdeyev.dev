"use client";

import { RiDownload2Line } from "react-icons/ri";
import { Button } from "../ui/button";

export function PrintButton() {
    const handleClick = () => {
        if (typeof window !== 'undefined') {
            window.print()
        }
    }

    return <Button
        onClick={handleClick}
        variant="default"
        size="lg"
        className="fixed bottom-8 right-8 z-50 shadow-lg print:hidden"
    >
        Print/Downlad
    </Button>
}