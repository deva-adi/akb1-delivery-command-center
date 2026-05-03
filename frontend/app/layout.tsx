import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AKB1 Delivery Command Center",
  description: "Programme delivery intelligence for senior leaders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
