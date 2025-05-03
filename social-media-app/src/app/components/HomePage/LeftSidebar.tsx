'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '@/app/utils/axios';
import Image from 'next/image';

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
    const [userProfileData, setUserProfileData] = useState<{ username: string; profileImage: string; friendsAmount: number } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                // Decode the JWT token to get user ID
                const { sub } = JSON.parse(atob(token.split('.')[1]));
                setUserId(sub);

                // Fetch user details using the user ID
                api.get(`/user/Home-UserProfile/${sub}`).then((res) => {
                    setUserProfileData(res.data);
                }).catch((err) => {
                    toast.error('Failed to fetch user data: ' + (err as Error).message);
                });

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

    const username = userProfileData?.username || 'User';
    const friends = userProfileData?.friendsAmount || 0;
    const profileImage = userProfileData?.profileImage || '/default-profile.png';

    return (
        <aside className="hidden lg:block w-1/5 space-y-6 px-4">
            {/* Profile Block */}
            <div className="bg-white p-6 rounded-xl shadow text-center">
                <div className="mx-auto mb-3 rounded-full overflow-hidden w-20 h-20 bg-gray-300">
                    <Image
                        src={profileImage}
                        alt="User Avatar"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                    />
                </div>
                <p className="font-semibold text-lg">{username}</p>
                <span className="text-sm text-gray-500">{friends} friends</span>
                <button
                    className="mt-3 block mx-auto text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-full transition hover:scale-[1.05]"
                    onClick={handleNavigateToProfilePage}
                >
                    My Profile
                </button>
            </div>

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
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer transition ${pathname.startsWith(item.route) ? 'bg-blue-100 text-blue-600 font-semibold' : 'hover:bg-blue-100'
                            }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

/*profile block 
1. get user data and output
*/

/* navigation menu
1. trigger to different page
*/