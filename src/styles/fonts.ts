import { Google_Sans } from "next/font/google";

export const GoogleSans = Google_Sans({
  subsets: ["latin", "latin-ext", "thai"],
  weight: "variable",
  display: "swap",
  fallback: ["sans-serif"],
  variable: "--font-google-sans",
});
