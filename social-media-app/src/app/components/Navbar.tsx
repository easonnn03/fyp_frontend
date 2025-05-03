import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Settings, LogOut, Bell } from 'lucide-react';
import api from '@/app/utils/axios';
import Image from 'next/image';

type FlatResult = {
    key: string;           // stable unique key for React
    label: string;         // what the user sees
    go: () => void;        // where to navigate when clicked
};

type SearchParams = {
    type: 'user' | 'post' | 'tag';
    requesterId: string;
    query?: string;
    tagId?: string;
};

interface ApiUser { Id: string; Username: string; ProfileImageUrl?: string }
interface ApiPost { Id: string; Content: string; Media?: { Url: string; Type: string }[] }
interface ApiTag { Id: string; Name: string }

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const moodRef = useRef<HTMLDivElement>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string>('');
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        message: string;
        link: string;
        isRead: boolean;
    }>>([]);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const [searchType, setSearchType] = useState<'user' | 'post' | 'tag'>('user');
    const [query, setQuery] = useState('');
    const [tagId, setTagId] = useState('');
    const [searchResults, setSearchResults] = useState<FlatResult[]>([]);
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [moodDropdownOpen, setMoodDropdownOpen] = useState(false);
    const [todayMood, setTodayMood] = useState<number>(3);
    const [userId, setUserId] = useState<string>('');
    const handleNotificationClick = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            )
        );

        api.post('/user/markAsRead', { notificationId: id })
            .then((res) => {
                const buttonURL = res.data;
                if (buttonURL) router.push(buttonURL);
            })
            .catch((err) => {
                toast.error(`Failed to update notification: ${err.message}`);
            });
    };

    const handleLogout = () => {
        localStorage.clear();
        toast.success('👋 Logged out successfully!');
        setTimeout(() => router.push('/login'), 1500);
    };


    const handleLogoClick = () => {
        if (pathname === '/home') {
            window.location.reload();
        } else {
            router.push('/home');
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const { sub } = JSON.parse(atob(token.split('.')[1]));
        const params: SearchParams = { type: searchType, requesterId: sub };
        if (searchType === 'tag') params.tagId = tagId;
        else params.query = query;

        try {
            const res = await api.get('/search', { params });

            let flat: FlatResult[] = [];

            if (searchType === 'user') {
                const users = res.data.users as ApiUser[];
                flat = users.map((u) => ({
                    key: `user-${u.Id}`,
                    label: u.Username,
                    go: () => router.push(`/profile/${u.Id}`),
                }));
            } else if (searchType === 'post') {
                const posts = res.data.posts as ApiPost[];
                flat = posts.map((p) => ({
                    key: `post-${p.Id}`,
                    label: p.Content?.slice(0, 50) || '(No content)',
                    go: () => router.push(`/posts/${p.Id}`),
                }));
            } else {
                const tags = res.data.tags as ApiTag[];
                flat = tags.map((t) => ({
                    key: `tag-${t.Id}`,
                    label: `#${t.Name}`,
                    go: () =>
                        router.push(`/search/tag/${encodeURIComponent(t.Name)}`),
                }));
            }

            setSearchResults(flat);
            setSearchDropdownOpen(true);
        } catch (err) {
            toast.error('Search failed: ' + (err as Error).message);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const { sub } = JSON.parse(atob(token.split('.')[1]));
                setUserId(sub);
                api.get('/user/Profile-Image', {
                    params: {
                        currentUserId: sub,
                    },
                }).then((res) => {
                    setProfileImageUrl(res.data);
                }).catch((err) => {
                    toast.error('Failed to fetch profile header Image:' + (err as Error).message);
                });
            } catch (err) {
                toast.error('Invalid token:' + (err as Error).message);
            }
        }

        if (token) {
            try {
                const { sub } = JSON.parse(atob(token.split('.')[1]));
                api.get('/user/Notifications', {
                    params: {
                        currentUserId: sub,
                    },
                }).then((res) => {
                    setNotifications(res.data);
                }).catch((err) => {
                    toast.error('Failed to fetch notifications:' + (err as Error).message);
                });
            } catch (err) {
                toast.error('Invalid token:' + (err as Error).message);
            }
        }

        api.get('/wellbeing/mood', {
            params: {
                userId: userId,
            },
        }).then((res) => {
            setTodayMood(res.data);
        })
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Close profile dropdown when clicking outside
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
            // Close notification dropdown when clicking outside
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchDropdownOpen(false);
            }
            if (moodRef.current && !moodRef.current.contains(event.target as Node)) {
                setMoodDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        api.get('/user/getAllTags')
            .then((res) => {
                setAvailableTags(res.data || []);
            })
            .catch((err) => {
                toast.error('Failed to fetch available tags: ' + (err as Error).message);
            });
    }, [searchType]);

    const handleSearchResultClick = (item: FlatResult) => {
        item.go();
    };

    return (
        <div className="w-full bg-white border-b shadow-md sticky top-0 z-50 dark:bg-gray-800">
            <ToastContainer position="top-center" autoClose={1000} />
            <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <div
                    onClick={handleLogoClick}
                    className="text-2xl font-bold text-blue-600 cursor-pointer tracking-tight hover:text-blue-700 transition"
                >
                    ApBook
                </div>

                {/* Search input */}
                <div className="relative flex-1 max-w-xl mx-6" ref={searchRef}>
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
                        {/* Search Type Dropdown */}
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as 'user' | 'post' | 'tag')}
                            className="h-10 px-4 border border-gray-300 rounded-full text-sm bg-gray-50 hover:bg-gray-100 focus:outline-none"
                        >
                            <option value="user">User</option>
                            <option value="post">Post</option>
                            <option value="tag">Tag</option>
                        </select>

                        {/* Search Input or Tag Selector */}
                        {searchType === 'tag' ? (
                            <select
                                value={tagId}
                                onChange={(e) => setTagId(e.target.value)}
                                className="flex-1 h-10 px-4 border border-gray-300 rounded-full text-sm bg-gray-50 hover:bg-gray-100 focus:outline-none"
                            >
                                <option key="default" value="">Select Tag</option>
                                {availableTags.map((tag) => (
                                    <option key={tag} value={tag}>
                                        {tag}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search something..."
                                    className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-full text-sm bg-gray-50 hover:bg-gray-100 focus:outline-none"
                                />
                                {/* Search Icon inside input */}
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    🔍
                                </div>
                            </div>
                        )}

                        {/* Search Button */}
                        <button
                            type="submit"
                            className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition"
                        >
                            Search
                        </button>
                    </form>

                    {/* Search Results */}
                    {searchDropdownOpen && (
                        <div className="absolute mt-2 w-full max-h-96 overflow-auto bg-white shadow-lg rounded-xl text-sm z-50 border border-gray-200">
                            {searchResults.length === 0 ? (
                                <div className="p-4 text-gray-500 text-center">No results found.</div>
                            ) : (
                                searchResults.map((r) => (
                                    <div
                                        key={r.key}
                                        className="flex items-center gap-3 p-3 hover:bg-blue-50 transition cursor-pointer border-b last:border-none"
                                        onClick={() => handleSearchResultClick(r)}
                                    >
                                        <span className="font-medium text-gray-700">{r.label}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}


                </div>

                {/* Icons + Profile */}
                <div className="flex items-center gap-5">
                    <div className="relative" ref={moodRef}>
                        <button
                            onClick={() => setMoodDropdownOpen((prev) => !prev)}
                            title="How are you feeling today?"
                            className="text-xl cursor-pointer hover:text-blue-500 transition hover:scale-[1.20]"
                        >
                            {todayMood === 1 ? "😢" : todayMood === 2 ? "😟" : todayMood === 3 ? "😐" : todayMood === 4 ? "🙂" : "😄"}
                        </button>

                        {moodDropdownOpen && (
                            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md p-4 z-50 border w-80">
                                <p className="text-sm font-semibold mb-2 text-center">How are you feeling today?</p>

                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((mood) => {
                                        const emoji = ["😢", "😟", "😐", "🙂", "😄"][mood - 1];
                                        const label = ["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"][mood - 1];

                                        return (
                                            <div key={mood} className="flex flex-col items-center space-y-1">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await api.post('/wellbeing/mood-submit', { userId, mood });
                                                            toast.success(`🧠 Mood "${label}" saved!`);
                                                            setMoodDropdownOpen(false);
                                                            setTodayMood(mood);
                                                            setTimeout(() => window.location.reload(), 1500);
                                                        } catch (err) {
                                                            toast.error('Failed to submit mood: ' + (err as Error).message);
                                                        }
                                                    }}
                                                    className="text-2xl hover:scale-110 transition"
                                                >
                                                    {emoji}
                                                </button>
                                                <span className="text-xs text-gray-600">{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* 🔔 Notification */}
                    <div className="relative" ref={notifRef}>
                        <button
                            title="Notifications"
                            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                            className="relative text-xl cursor-pointer hover:text-blue-500 transition hover:scale-[1.20]"
                        >
                            <Bell />
                            {unreadCount > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 bg-red-500 text-white 
                                               text-xs w-5 h-5 flex items-center justify-center 
                                               rounded-full"
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {notifDropdownOpen && (
                            <div
                                className="absolute right-0 mt-2 w-72 bg-white shadow-lg 
                                        rounded-md overflow-hidden text-sm z-50 
                                        divide-y divide-gray-200 transition-all duration-200
                                        +max-h-80 overflow-y-auto"
                            >
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-gray-500">No notifications</div>
                                ) : (
                                    notifications.map((notif) => (
                                        <button
                                            key={notif.id}
                                            onClick={() =>
                                                handleNotificationClick(notif.id)
                                            }
                                            className={`block w-full text-left px-4 py-2 
                                                ${notif.isRead
                                                    ? 'bg-gray-100 text-gray-500'
                                                    : 'bg-white hover:bg-gray-100'
                                                }
                                            `}
                                        >
                                            {/* Icon or Avatar */}
                                            <span className="text-blue-500">🔔 </span>
                                            {/* Notification Text */}
                                            <span>{notif.message}</span>
                                            {/*{notif.message}*/}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* 👤 Avatar */}
                    <div className="relative" ref={dropdownRef}>
                        <div
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-9 h-9 rounded-full bg-gray-300 cursor-pointer hover:ring-2 hover:ring-blue-500 overflow-hidden"
                        >
                            {profileImageUrl ? (
                                <Image
                                    src={profileImageUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    width={36}
                                    height={36}
                                />
                            ) : (
                                <Image
                                    src="/default-profile.png"
                                    alt="Default Profile"
                                    className="w-full h-full object-cover"
                                    width={36}
                                    height={36}
                                />
                            )}
                        </div>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md overflow-hidden text-sm z-50">
                                <button
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={() => router.push('/settings')}
                                >
                                    <Settings size={16} />
                                    <span>Settings</span>
                                </button>
                                <button
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={16} />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav >
        </div >
    );
}

/*
1. search input logic 
2. chat icon logic 
3. notification logic 
4. settings logic
*/