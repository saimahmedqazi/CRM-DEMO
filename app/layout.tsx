import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuro Solutions CRM",
  description: "Commercial-grade, appointment-led multi-tenant CRM SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        {children}
      </body>
    </html>
  );
}
