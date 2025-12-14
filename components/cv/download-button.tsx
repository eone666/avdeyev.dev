"use client";

import { RiDownload2Line } from "react-icons/ri";
import { Button } from "../ui/button";

export function DownloadButton() {

    return <Button
        asChild
        variant="default"
        size="lg"
        className="print:hidden"
    >
        <a href="/cv.pdf" download>
            <RiDownload2Line className="size-4" />
            Download
        </a>
    </Button >
}