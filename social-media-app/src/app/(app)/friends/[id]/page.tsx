'use client';
import { useState, useEffect } from 'react';
import LeftSidebar from '@/app/components/LeftSidebar';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import api from '@/app/utils/axios';
import { toast } from 'react-toastify';

interface FriendInfo {
    id: string;
    username: string;
    profileImageUrl: string;
}

export default function FriendsPage() {
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [friendRequests, setFriendRequests] = useState<FriendInfo[]>([]);
    const [friendsList, setFriendsList] = useState<FriendInfo[]>([]);
    const params = useParams();
    const userIdFromRoute = params?.id as string;

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const { sub } = JSON.parse(atob(token.split('.')[1]));
                const userIdFromToken = sub;

                if (userIdFromRoute !== userIdFromToken) {
                    toast.error('Page Not Found. Redirecting to your friends page...');
                    router.push(`/friends/${userIdFromToken}`);
                }
            } catch (err) {
                toast.error('Invalid token:' + err);
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
    }, [userIdFromRoute, router]);

    //fetch friends requests
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

    //fetch friends list
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

    //Future Enhancements: Real time updates for friend requests (not reloading the page)
    const handleAccept = (id: string) => {
        api.post('/friend/approve', {
            sender: id,
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

    const handleReject = (id: string) => {
        api.post('/friend/reject', {
            sender: id,
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

    const handleViewProfile = (id: string) => {
        router.push(`/profile/${id}`);
    };


    //Future Enhancements: Real time messaging
    /*const handleMessage = (id: string) => {
        // Navigate to chat or messaging
    };*/

    return (
        <div className="flex h-screen">
            {/* Left Sidebar */}
            <LeftSidebar />

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Friend Requests */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {friendRequests.length === 0 && (
                            <p className="text-gray-600">No friend requests at the moment.</p>
                        )}
                        {friendRequests.map((req) => (
                            <div
                                key={req.id}
                                onClick={() => handleViewProfile(req.id)}
                                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={req.profileImageUrl || '/default-profile.png'}
                                        alt={req.username}
                                        width={50}
                                        height={50}
                                        className="rounded-full object-cover"
                                    />
                                    <span className="font-semibold">{req.username}</span>
                                </div>
                                <div className="mt-3 flex justify-end gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAccept(req.id);
                                        }}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReject(req.id);
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider Line */}
                <hr className="my-8 border-gray-300" />

                {/* Friends List */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Friends</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {friendsList.map((friend) => (
                            <div
                                key={friend.id}
                                onClick={() => handleViewProfile(friend.id)}
                                className="bg-white rounded-lg shadow p-3 cursor-pointer hover:shadow-md transition w-64"
                            >
                                {/* Profile Image */}
                                <div className="flex justify-center">
                                    <Image
                                        src={friend.profileImageUrl || '/default-profile.png'}
                                        alt={friend.username}
                                        width={100}
                                        height={100}
                                        className="rounded-full object-cover"
                                    />
                                </div>

                                {/* Username */}
                                <div className="mt-2 mb-2 font-semibold text-center text-gray-800">
                                    {friend.username}
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewProfile(friend.id);
                                        }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                                    >
                                        View Profile
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            //handleMessage(friend.id);
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
                                    >
                                        Message
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}