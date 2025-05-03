'use client';
import { useState, useEffect } from 'react';
import api from '@/app/utils/axios';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RightSidebar() {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [friendRequests, setFriendRequests] = useState<Array<{
        id: string;
        username: string;
        profileImageUrl: string;
    }>>([]);
    const [friendsList, setFriendsList] = useState<Array<{
        id: string;
        username: string;
        profileImageUrl: string;
    }>>([]);
    const router = useRouter();
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const { sub } = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(sub);

                api.get('/friend/Friend-Request', {
                    params: { currentUserId: sub },
                })
                    .then((res) => {
                        setFriendRequests(res.data);
                    })
                    .catch((err) => {
                        toast.error('Error fetching friend requests: ' + err.message);
                    });
            } catch (err) {
                toast.error('Invalid token: ' + (err as Error).message);
            }
        }
    }, []);

    useEffect(() => {
        if (currentUserId) {
            api.get('/friend/Friend-List', {
                params: { currentUserId },
            })
                .then((res) => {
                    setFriendsList(res.data);
                })
                .catch((err) => {
                    toast.error('Error fetching friends: ' + err.message);
                });
        }
    }, [currentUserId]);

    const handleContextMenu = (
        e: React.MouseEvent<HTMLDivElement>,
        userId: string
    ) => {
        e.preventDefault();
        setSelectedUserId(userId);
        setMenuPosition({ x: e.pageX, y: e.pageY });
        setShowContextMenu(true);
    };

    const handleCloseMenu = () => setShowContextMenu(false);

    const handleViewProfile = () => {
        if (selectedUserId) {
            router.push(`/profile/${selectedUserId}`);
        }
        setShowContextMenu(false);
    };

    const handleApproveRequest = (senderId: string) => {
        api.post('/friend/approve', {
            sender: senderId,
            addressee: currentUserId,
        })
            .then(() => {
                toast.success('Friend request approved!');
                setTimeout(() => window.location.reload(), 1500);
            })
            .catch((err) => {
                toast.error('Failed to approve friend request: ' + err.message);
            });
    };

    const handleRejectRequest = (senderId: string) => {
        api.post('/friend/reject', {
            sender: senderId,
            addressee: currentUserId,
        })
            .then(() => {
                toast.success('Friend request rejected!');
                setTimeout(() => window.location.reload(), 1500);
            })
            .catch((err) => {
                toast.error('Failed to reject friend request: ' + err.message);
            });
    };

    return (
        <>
            {/* Context Menu */}
            {showContextMenu && (
                <div
                    className="fixed rounded-lg p-2 z-50 min-w-[10rem]
                               transform transition-all duration-200 ease-in-out origin-top-left"
                    style={{ top: menuPosition.y, left: menuPosition.x }}
                    onMouseLeave={handleCloseMenu}
                >
                    <button
                        onClick={handleViewProfile}
                        className="block w-full text-left bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700
                            text-white px-3 py-1 rounded-md font-medium focus:outline-none transition-all duration-300
                            transform hover:-translate-y-1 hover:shadow-md"
                    >
                        User Profile
                    </button>
                </div>
            )}

            <aside className="hidden xl:block w-1/5 space-y-6 px-4" onClick={handleCloseMenu}>
                {/* Friend Requests */}
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <h2 className="font-semibold text-sm mb-3">Friend Requests</h2>
                    {friendRequests.map((fr) => (
                        <div key={fr.id} className="flex items-center justify-between text-sm mb-2">
                            <div
                                className="flex items-center gap-2"
                                onContextMenu={(e) => handleContextMenu(e, fr.id)}>
                                <Image
                                    src={fr.profileImageUrl || '/default-profile.png'}
                                    alt={fr.username}
                                    className="w-8 h-8 rounded-full object-cover"
                                    width={32}
                                    height={32}
                                />
                                <span>{fr.username}</span>
                            </div>
                            <div className="space-x-2">
                                <button
                                    onClick={() => handleApproveRequest(fr.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full 
                                                focus:outline-none transition-all duration-200 
                                                shadow-sm hover:shadow-lg transform hover:-translate-y-0.5">
                                    ✔
                                </button>
                                <button
                                    onClick={() => handleRejectRequest(fr.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full 
                                                focus:outline-none transition-all duration-200 
                                                shadow-sm hover:shadow-lg transform hover:-translate-y-0.5">
                                    ✖
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Friends List */}
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <h2 className="font-semibold text-sm mb-3">Friends</h2>
                    {friendsList.map((friend) => (
                        <div
                            key={friend.id}
                            className="flex items-center gap-2 text-sm mb-2"
                            onContextMenu={(e) => handleContextMenu(e, friend.id)}
                        >
                            <Image
                                src={friend.profileImageUrl || '/default-profile.png'}
                                alt={friend.username}
                                className="w-8 h-8 rounded-full object-cover"
                                width={32}
                                height={32}
                            />
                            <span>{friend.username}</span>
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
}