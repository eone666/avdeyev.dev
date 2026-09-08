import qrcode from 'qrcode-generator'

export type QRCodeProps = {
    value: string;
    /** Rendered size in px. */
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    class?: string;
}

/**
 * Server-rendered QR code, replaces qrcode.react. Emits one background rect
 * plus a single path of dark modules, the same shape qrcode.react produced.
 */
export function QRCode({
    value,
    size = 128,
    level = 'L',
    bgColor = '#FFFFFF',
    fgColor = '#000000',
    class: className
}: QRCodeProps) {
    const qr = qrcode(0, level)
    qr.addData(value)
    qr.make()

    const cells = qr.getModuleCount()

    let path = ''
    for (let row = 0; row < cells; row++) {
        for (let col = 0; col < cells; col++) {
            if (qr.isDark(row, col)) {
                path += `M${col},${row}h1v1h-1z`
            }
        }
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox={`0 0 ${cells} ${cells}`}
            shape-rendering="crispEdges"
            role="img"
            aria-label={`QR code for ${value}`}
            class={className}
        >
            <path fill={bgColor} d={`M0,0h${cells}v${cells}H0z`} />
            <path fill={fgColor} d={path} />
        </svg>
    )
}
