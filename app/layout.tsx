import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Old Friend - Barbershop & Grooming",
  description: "La tua barberia di fiducia dal 1950. Tradizione, stile e professionalità per un look sempre impeccabile.",
  keywords: "barbiere, barbershop, taglio capelli, barba, grooming, rasatura, stile uomo",
  authors: [{ name: "The Old Friend" }],
  openGraph: {
    title: "The Old Friend - Barbershop & Grooming",
    description: "La tua barberia di fiducia dal 1950",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="scroll-smooth">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
