import type { Config } from "tailwindcss";
export default { content:["./src/**/*.{ts,tsx}"], theme:{extend:{colors:{navy:"#0F1F3D",ink:"#0A1630",accent:"#F26A1B",mist:"#F1F3F6"},fontFamily:{display:["var(--font-display)"],body:["var(--font-body)"]}}}, plugins:[] } satisfies Config;
