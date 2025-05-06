'use client';
import Navbar from '../components/Navbar';
import { useAuth } from '@/app/hook/useAuth';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
                <div className="text-gray-600 text-lg animate-pulse">🔄 Checking session...</div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="bg-gray-50 min-h-screen px-4 py-6">{children}</main>
        </>
    );
}
