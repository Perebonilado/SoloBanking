import classNames from "classnames";
import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { ICON_FONT_URL } from "@/components/ui/Icon";
import StoreProvider from "@/store/StoreProvider";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoloBanking",
  description: "SoloBanking",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={classNames(atkinson.variable, "h-full antialiased")}
    >
      <head>
        <link rel="stylesheet" href={ICON_FONT_URL} />
      </head>
      <body className="flex min-h-full flex-col bg-black font-sans text-white">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
