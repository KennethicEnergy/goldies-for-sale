import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "User Management Application",
  description:
    "Next.js user management app using TestAPI endpoints on http://localhost:18100",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
