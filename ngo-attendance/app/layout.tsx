import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NGO Attendance Manager",
  description: "Session-wise attendance tracking for NGO programs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
