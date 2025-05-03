'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/app/utils/axios';
import Image from 'next/image';
import { toast } from 'react-toastify';
import EditProfileModal from './EditProfileForm';
import { useRef } from 'react';

export default function UserHeader() {
    const params = useParams();
    // Page Owner User ID
    const profileId = params?.id as string;
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [profileHeaderData, setProfileHeaderData] = useState<{
        username: string;
        profileImage: string;
        backgroundImage: string;
        relation: string;
    } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const { sub } = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(sub);
                api.get('/user/Profile-Header', {
                    params: {
                        profileId,
                        currentUserId: sub,
                    },
                }).then((res) => {
                    setProfileHeaderData(res.data);
                }).catch((err) => {
                    toast.error('Failed to fetch profile header data:' + (err as Error).message);
                });
            } catch (err) {
                toast.error('Invalid token:' + (err as Error).message);
            }
        }
    }, [profileId]);

    const handleAddFriend = () => {
        api.post('/friend/add-friend', {
            sender: currentUserId,
            addressee: profileId,
            status: 'pending',
        }).then((res) => {
            if (res.data === true) {
                toast.success('Friend request sent!');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error('Failed to send friend request: Requests Pending');
                setTimeout(() => window.location.reload(), 1500);
            }
        }).catch((err) => {
            toast.error('Failed to send friend request: ' + err.message);
        });
    };

    const handleUnfriend = () => {
        api.post('/friend/unfriend', {
            sender: currentUserId,
            addressee: profileId,
        })
            .then(() => {
                toast.success('Unfriended successfully');
                setTimeout(() => window.location.reload(), 1000);
            })
            .catch((err) => {
                toast.error('Failed to unfriend: ' + err.message);
            });
    };

    const handleUploadCoverClick = () => {
        coverInputRef.current?.click();
    };

    const handleUploadProfileClick = () => {
        profileInputRef.current?.click();
    };

    const handleCoverSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const formData = new FormData();
            formData.append('file', e.target.files[0]);
            formData.append('userId', currentUserId || '');

            try {
                await api.post('/user/upload-cover', formData);
                toast.success('Cover image updated!');
                setTimeout(() => window.location.reload(), 1000);
            } catch (err) {
                toast.error('Failed to upload cover: ' + (err as Error).message);
            }
        }
    };

    const handleProfileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const formData = new FormData();
            formData.append('file', e.target.files[0]);
            formData.append('userId', currentUserId || '');

            try {
                await api.post('/user/upload-profile', formData);
                toast.success('Profile image updated!');
                setTimeout(() => window.location.reload(), 1000);
            } catch (err) {
                toast.error('Failed to upload profile: ' + (err as Error).message);
            }
        }
    };

    const handleApproveRequest = () => {
        api.post('/friend/approve', {
            sender: profileId,
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

    const handleRejectRequest = () => {
        api.post('/friend/reject', {
            sender: profileId,
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

    const username = profileHeaderData?.username || 'User';
    const profileImage = profileHeaderData?.profileImage || '/default-profile.png';
    const backgroundImage = profileHeaderData?.backgroundImage || '/default-background.png';
    const relation = profileHeaderData?.relation || '';

    return (
        <>
            <EditProfileModal
                visible={showModal}
                currentUsername={username}
                currentUserId={currentUserId || ''}
                onClose={() => setShowModal(false)}
                onSave={(newUsername, newBio, newAge, newCourse, newInterests) => {
                    // Handle API call to save
                    if (newInterests.length === 0) {
                        toast.error('Please select at least one interest tag.');
                        return;
                    }
                    api.post('/user/update-profile', {
                        userId: currentUserId,
                        username: newUsername,
                        bio: newBio,
                        age: newAge,
                        courseName: newCourse,
                        interests: newInterests,
                    }).then(() => {
                        toast.success('Profile updated successfully!');
                        setShowModal(false);
                        setTimeout(() => window.location.reload(), 1500);
                    })
                        .catch((err) => {
                            toast.error('Failed to update profile: ' + err.message);
                        });
                }}
            />
            <div className="relative">
                {/* Cover Image */}
                <div className="h-64 w-full bg-cover bg-center relative rounded-t-2xl shadow-lg z-0 group"
                    style={{ backgroundImage: `url(${backgroundImage})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-t-2xl" />

                    {relation === 'self' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 rounded-t-2xl">
                            <button
                                onClick={handleUploadCoverClick}
                                className="bg-white text-black px-4 py-2 rounded-lg font-semibold shadow-lg"
                            >
                                Upload Cover
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Info Bar */}
                <div className="relative w-full px-6 lg:px-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6 py-6 -mt-4 rounded-b-2xl shadow z-10">
                    <div className="flex items-end gap-6">
                        <div className="w-32 h-32 rounded-full border-4 border-blue-300 bg-gray-200 overflow-hidden shadow-2xl -mt-20 relative group">
                            <Image
                                src={profileImage}
                                alt="Profile"
                                className="object-cover w-full h-full"
                                width={128}
                                height={128}
                            />

                            {relation === 'self' && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 rounded-full">
                                    <button
                                        onClick={handleUploadProfileClick}
                                        className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold shadow-md"
                                    >
                                        Upload
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-end">
                            <h1 className="text-3xl font-extrabold text-black tracking-tight mb-1 drop-shadow">
                                {username}
                            </h1>
                            <p className="text-base text-black font-mono">@{username.toLowerCase().replace(/\s/g, '')}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 flex-wrap items-center">
                        {relation === 'self' && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2.5 rounded-xl text-base font-semibold shadow-lg transition-all duration-150"
                            >
                                ✏️ Edit Profile
                            </button>
                        )}
                        {relation === 'not_friends' && (
                            <button
                                onClick={handleAddFriend}
                                className="bg-green-600 hover:bg-green-700 text-white px-7 py-2.5 rounded-xl text-base font-semibold shadow-lg transition-all duration-150"
                            >
                                ➕ Add Friend
                            </button>
                        )}
                        {relation === 'pending' && (
                            <button
                                disabled
                                className="bg-gray-400 text-white px-7 py-2.5 rounded-xl text-base font-semibold shadow-lg transition-all duration-150 cursor-not-allowed"
                            >
                                ⏳ Pending
                            </button>
                        )}
                        {relation === 'approving' && (
                            <>
                                <button
                                    onClick={handleApproveRequest}
                                    className="bg-green-600 hover:bg-green-700 text-white px-7 py-2.5 rounded-xl text-base font-semibold shadow-lg transition-all duration-150"
                                >
                                    ✅ Approve
                                </button>
                                <button
                                    onClick={handleRejectRequest}
                                    className="bg-red-600 hover:bg-red-700 text-white px-7 py-2.5 rounded-xl text-base font-semibold shadow-lg transition-all duration-150"
                                >
                                    ❌ Reject
                                </button>
                            </>
                        )}
                        {relation === 'friends' && (
                            <>
                                <button className="bg-gray-800 hover:bg-gray-900 text-white px-7 py-2.5 rounded-xl text-base font-semibold shadow-lg flex items-center gap-2 transition-all duration-150">
                                    👥 Friends
                                </button>
                                <button className="bg-blue-700 hover:bg-blue-800 text-white px-7 py-2.5 rounded-xl text-base font-semibold shadow-lg flex items-center gap-2 transition-all duration-150">
                                    💬 Message
                                </button>
                                <button
                                    onClick={handleUnfriend}
                                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-base font-semibold shadow-lg flex items-center gap-2 transition-all duration-150"
                                >
                                    ❌ UnFriend
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <input
                type="file"
                accept="image/*"
                ref={coverInputRef}
                className="hidden"
                onChange={handleCoverSelected}
            />

            <input
                type="file"
                accept="image/*"
                ref={profileInputRef}
                className="hidden"
                onChange={handleProfileSelected}
            />

        </>


    );
}

