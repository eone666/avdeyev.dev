import tailwindcss from '@tailwindcss/postcss'
import pixelsToRem from './config/pixels-to-rem.mjs'

export default { plugins: [tailwindcss(), pixelsToRem()] }
