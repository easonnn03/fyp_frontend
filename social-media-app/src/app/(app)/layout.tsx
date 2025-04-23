import Navbar from '../components/Navbar';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="w-full bg-white md:px-8 lg:px-16 xl:px-32 2xl:px-64">
                <Navbar />
            </div>
            <main className="bg-gray-50 min-h-screen px-4 py-6">{children}</main>
        </>
    );
}
