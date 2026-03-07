import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { StateProvider } from '@/components/StateProvider';

export const metadata: Metadata = {
    title: 'Terrasse - The Art of Simplicity',
    description: 'Crafting timeless essentials for the modern wardrobe. Quality, sustainability, and effortless style.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <StateProvider>
                    <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-1">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </StateProvider>
            </body>
        </html>
    );
}
