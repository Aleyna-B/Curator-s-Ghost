import { Cinzel_Decorative, Cinzel, Playfair_Display } from "next/font/google";
import "./globals.css";
import AudioCleaner from "./components/AudioCleaner";

const cinzelDecorative = Cinzel_Decorative({
  variable: "--font-cinzel-decorative",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "The Curator's Ghost | Art Has a Voice",
  description: "Step into the shadows of the museum and let the spirits guide your journey through art history.",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cinzelDecorative.variable} ${cinzel.variable} ${playfair.variable} antialiased`}
      >
        <AudioCleaner />
        {children}
      </body>
    </html>
  );
}
