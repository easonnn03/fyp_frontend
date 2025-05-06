'use client';
import { useEffect, useState } from 'react';
import PostCard from '@/app/components//PostCard';
import api from '@/app/utils/axios';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useNewsFeed } from '@/app/hook/useNewsFeed';

interface Tag {
    id: string;
    name: string;
}

export default function MainFeed() {
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await api.get('/posts/get-all-tags'); // adjust your real API path
                setAvailableTags(res.data);
            } catch (error) {
                toast.error('Failed to load tags.' + error);
            }
        };

        fetchTags();
    }, []);

    useEffect(() => {
        const fetchProfileImage = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const { sub } = JSON.parse(atob(token.split('.')[1]));

            try {
                const res = await api.get(`/user/Profile-Image`, {
                    params: { currentUserId: sub },
                });

                setProfileImageUrl(res.data);
            } catch (error) {
                toast.error('Failed to fetch profile image' + error);
            }
        };

        fetchProfileImage();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const { sub } = JSON.parse(atob(token.split('.')[1]));
            setUserId(sub);
        }
    }, []);

    const { posts, isLoadingInitialData, isLoadingMore, isReachingEnd, loadMore } = useNewsFeed(userId ?? '');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handlePost = async () => {
        if (!content.trim()) {
            toast.error('Post description cannot be empty.');
            return;
        }

        if (selectedTagIds.length === 0) {
            toast.error('Please select at least one tag.');
            return;
        }

        setLoading(true);

        const token = localStorage.getItem('accessToken');
        let userId = '';
        if (token) {
            const { sub } = JSON.parse(atob(token.split('.')[1]));
            userId = sub;
        }

        const formData = new FormData();
        formData.append('content', content);
        formData.append('userId', userId);
        formData.append('interestTagIds', JSON.stringify(selectedTagIds));
        files.forEach((file) => formData.append('files', file));

        try {
            await api.post('/posts/create-post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Post created successfully!');
            setContent('');
            setFiles([]);
            setSelectedTagIds([]);
        } catch (error) {
            setContent('');
            setFiles([]);
            setSelectedTagIds([]);
            toast.error('Error creating post: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tagId: string) => {
        setSelectedTagIds((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        );
    };

    if (isLoadingInitialData) {
        return <p className="text-center text-gray-500">Loading News Feed...</p>;
    }

    return (
        <div className="w-full lg:w-3/5 space-y-6 px-4">
            {/* Create Post */}
            <div className="bg-white p-6 rounded-xl shadow-md space-y-5">
                {/* User input area */}
                <div className="flex gap-4">
                    {/* Avatar placeholder */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        {profileImageUrl ? (
                            <Image
                                src={profileImageUrl}
                                alt="User Avatar"
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <Image
                                src="/default-profile.png" // save a default profile image inside /public/
                                alt="Default Avatar"
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                            />
                        )}
                    </div>

                    {/* Input */}
                    <div className="flex-1 space-y-3">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full border border-gray-300 rounded-lg p-3 text-base resize-none focus:ring focus:border-blue-400"
                            rows={3}
                        />
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3 py-1 rounded-full border text-sm ${selectedTagIds.includes(tag.id)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                        {/* Attached Files Preview */}
                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {files.map((file, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 group">
                                        {/* X button */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(idx)}
                                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs rounded-full p-1 hidden group-hover:block"
                                        >
                                            ❌
                                        </button>

                                        {/* Image or Video */}
                                        {file.type.startsWith('image') ? (
                                            <Image
                                                src={URL.createObjectURL(file)}
                                                alt="preview"
                                                className="object-cover w-full h-full"
                                                width={96}
                                                height={96}
                                            />
                                        ) : (
                                            <video
                                                src={URL.createObjectURL(file)}
                                                className="object-cover w-full h-full"
                                                muted
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Buttons Row */}
                <div className="flex items-center gap-4 border-t pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-pink-500">
                        📷 Photo
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-purple-500">
                        🎥 Video
                        <input
                            type="file"
                            accept="video/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>

                    <button
                        onClick={handlePost}
                        disabled={loading}
                        className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>

            {/* News Feed (sample post) */}
            <div className="space-y-6">
                {isLoadingInitialData ? (
                    <p className="text-center text-gray-500">Loading news feed...</p>
                ) : (
                    <>
                        {posts.map((post) => (
                            <PostCard
                                key={post.postId}
                                postId={post.postId}
                                userId={post.userId}
                                username={post.username}
                                userAvatar={post.userAvatar}
                                createdAt={post.createdAt}
                                content={post.content}
                                media={post.media}
                                likeCount={post.likeCount}
                                commentCount={post.commentCount}
                                tags={post.tags}
                                isOwnPost={userId === post.userId}
                            />
                        ))}

                        {!isReachingEnd && (
                            <div className="flex justify-center pt-6">
                                <button
                                    onClick={loadMore}
                                    disabled={isLoadingMore}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                    {isLoadingMore ? 'Loading more...' : 'Load More'}
                                </button>
                            </div>
                        )}

                        {isReachingEnd && (
                            <p className="text-center text-gray-400 pt-6">No more posts</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}