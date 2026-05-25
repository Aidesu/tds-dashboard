import type { Metadata } from "next";
import "./globals.css";
import Header from "@/src/components/Layout/Header";

export const metadata: Metadata = {
    title: "TDS Dashboard",
    description: "Gestionnaire de services personnels",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
            <body>
                <Header />
                <main className="relative z-10">{children}</main>
            </body>
        </html>
    );
}
