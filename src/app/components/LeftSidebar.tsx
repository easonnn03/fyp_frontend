'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const navItems = [
    { icon: '🏠', label: 'Home', route: '/home' },
    { icon: '👤', label: 'My Profile', route: '/profile' },
    { icon: '👥', label: 'Friends', route: '/friends' },
    //{ icon: '📅', label: 'Events', route: '/events' },
    //{ icon: '🎞️', label: 'Videos', route: '/videos' },
    //{ icon: '📰', label: 'News', route: '/news' },
];

export default function SidebarLeft() {
    const router = useRouter();
    const pathname = usePathname();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const { sub } = JSON.parse(atob(token.split('.')[1]));
                setUserId(sub);
            } catch (err) {
                toast.error('Invalid token' + (err as Error).message);
            }
        }
    }, []);

    const handleNavigateToProfilePage = () => {
        router.push(`/profile/${userId}`);
    }

    const handleNavigateToFriendsPage = () => {
        router.push(`/friends/${userId}`);
    }

    return (
        <aside className="hidden lg:block w-1/5 space-y-6 px-4">
            {/* Navigation Menu */}
            <ul className="space-y-2 text-sm font-medium">
                {navItems.map(item => (
                    <li
                        key={item.label}
                        onClick={() => {
                            if (pathname.startsWith(item.route)) {
                                window.location.reload();
                            } else if (item.route === '/profile') {
                                handleNavigateToProfilePage();
                            } else if (item.route === '/friends') {
                                handleNavigateToFriendsPage();
                            } else {
                                router.push(item.route);
                            }
                        }}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer transition ${pathname.startsWith(item.route)
                            ? 'bg-blue-100 text-blue-600 font-semibold'
                            : 'hover:bg-blue-100'
                            }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        </aside >
    );
}
