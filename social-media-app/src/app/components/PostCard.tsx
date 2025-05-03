'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useRef, useEffect, useState } from 'react';
import api from '@/app/utils/axios';

interface Media {
    url: string;
    type: 'image' | 'video';
}

interface Tag {
    id: string;
    name: string;
}

interface Comment {
    Id: string;
    Content: string;
    createdAt: string;
    Users: {
        Username: string;
        Profiles?: {
            ProfileImageUrl?: string;
        };
    };
}

interface PostCardProps {
    postId: string;
    userId: string;
    username: string;
    userAvatar: string;
    createdAt: string;
    content: string;
    media?: Media[];
    likeCount: number;
    commentCount: number;
    tags?: Tag[];
    isOwnPost: boolean;
}

export default function PostCard({
    postId,
    userId,
    username,
    userAvatar,
    createdAt,
    content,
    media = [],
    likeCount,
    commentCount,
    tags = [],
    isOwnPost,
}: PostCardProps) {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const handleImageClick = (url: string) => setSelectedImage(url);
    const closeModal = () => setSelectedImage(null);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editContent, setEditContent] = useState(content);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([...new Set(tags.map((t) => t.id))]);
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(likeCount);
    const [currentUserId, setcurrentUserId] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const handleProfileClick = () => {
        router.push(`/profile/${userId}`);
    };

    const handleShare = () => {
        const url = `${window.location.origin}/posts/${postId}`;
        navigator.clipboard.writeText(url);
        toast.success('🔗 Post link copied!');
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/posts/delete-post/${postId}/${userId}`);
            toast.success('🗑 Post deleted!');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            toast.error('Failed to delete post.' + err);
        }
    };

    const handleSubmitEdit = async () => {
        if (selectedTagIds.length === 0) {
            toast.error('Please select at least one interest tag.');
            setShowEditModal(false);
            return;
        }
        try {
            await api.put('/posts/update-post', {
                postId,
                userId,
                content: editContent,
                interestTagIds: selectedTagIds,
            });

            toast.success('Post updated!');
            setShowEditModal(false);
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            toast.error('Failed to update post.' + err);
        }
    };

    const handleCommentSubmit = async () => {
        if (!userId || !newComment.trim()) return;

        try {
            await api.post('/posts/comment', {
                postId,
                userId,
                content: newComment.trim(),
            });
            setNewComment('');
            setShowComments(true);
            toast.success('💬 Comment added!');
            setTimeout(() => window.location.reload(), 1500);
        } catch {
            toast.error('Failed to post comment');
        }
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await api.get(`/posts/${postId}/comments`);
                setComments(res.data);
            } catch {
                toast.error('Failed to load comments');
            }
        };

        if (showComments) {
            fetchComments();
        }
    }, [showComments, postId]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const { sub } = JSON.parse(atob(token.split('.')[1]));
                setcurrentUserId(sub);
            } catch (err) {
                toast.error('Invalid token:' + (err as Error).message);
            }
        }
    }, []);

    useEffect(() => {
        if (showEditModal) {
            setEditContent(content);
            setSelectedTagIds(tags.map((t) => t.id));
        }
    }, [showEditModal, tags, content]);

    useEffect(() => {
        if (!showEditModal) return;

        const fetchTags = async () => {
            try {
                const res = await api.get('/posts/get-all-tags');
                setAvailableTags(res.data);
            } catch {
                toast.error('Failed to load tags');
            }
        };

        fetchTags();
    }, [showEditModal]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (!postId || !currentUserId) return;
            try {
                const res = await api.get('/posts/is-liked', {
                    params: {
                        postId,
                        userId: currentUserId,
                    }
                });
                setLiked(res.data.isLiked);
            } catch (err) {
                console.error('Failed to fetch like status', err);
            }
        };

        if (currentUserId) {
            fetchLikeStatus();
        }
    }, [postId, currentUserId]);

    return (
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">

                <div
                    className="w-12 h-12 rounded-full overflow-hidden cursor-pointer"
                    onClick={handleProfileClick}
                >
                    <Image
                        src={userAvatar || '/default-profile.png'}
                        alt="User Avatar"
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                    />
                </div>
                <div>
                    <p
                        onClick={handleProfileClick}
                        className="font-semibold cursor-pointer hover:underline"
                    >
                        {username}
                    </p>
                    <p className="text-xs text-gray-500">
                        {new Date(createdAt).toLocaleString()}
                    </p>
                </div>

                {isOwnPost && (
                    <div className="ml-auto relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ⋮
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border shadow-lg rounded-md z-50">
                                <button
                                    onClick={() => {
                                        setShowEditModal(true);
                                        setShowMenu(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                    ✏️ Edit Post
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    🗑 Delete Post
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                        >
                            #{tag.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Content */}
            {content && (
                <p className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">
                    {content}
                </p>
            )}

            {/* Media */}
            {media.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                    {media.map((m, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden w-full h-64 relative">
                            {m.type === 'image' ? (
                                <Image
                                    src={m.url}
                                    alt="Post media"
                                    fill
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleImageClick(m.url)}
                                    className="object-cover rounded-lg cursor-pointer transition duration-200 hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <video
                                    controls
                                    className="w-full h-full object-cover rounded-lg"
                                >
                                    <source src={m.url} />
                                    Your browser does not support video.
                                </video>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-2 text-sm text-gray-600">
                <button
                    onClick={async () => {
                        if (!userId) return toast.error('Please log in first.');

                        try {
                            if (liked) {
                                await api.delete('/posts/unlike', { data: { postId, userId: currentUserId } });
                                setLikes((prev) => prev - 1);
                            } else {
                                await api.post('/posts/like', { postId, userId: currentUserId });
                                setLikes((prev) => prev + 1);
                            }
                            setLiked(!liked);
                        } catch (err) {
                            toast.error('❌ Failed to update like.' + err);
                        }
                    }}
                    className={`hover:text-blue-500 ${liked ? 'text-blue-500 font-semibold' : ''}`}
                >
                    👍 {likes} Like
                </button>
                <button onClick={() => setShowComments(!showComments)} className="hover:text-blue-500">
                    💬 {commentCount} Comment
                </button>
                <button onClick={handleShare} className="hover:text-blue-500">
                    🔗 Share
                </button>
            </div>
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    onClick={closeModal}
                >
                    <div className="relative w-[95vw] h-[90vh] max-w-6xl p-4 translate-y-[-2%]">
                        <Image
                            src={selectedImage}
                            alt="Full size image"
                            fill
                            className="object-contain rounded-lg"
                            priority
                        />
                    </div>
                </div>
            )}

            {showEditModal && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4"
                    onClick={() => setShowEditModal(false)}
                >
                    <div className="bg-white w-full max-w-xl rounded-lg p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold">Edit Post</h2>
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                        />
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() =>
                                        setSelectedTagIds((prev) =>
                                            prev.includes(tag.id)
                                                ? prev.filter((id) => id !== tag.id)
                                                : [...prev, tag.id]
                                        )
                                    }
                                    className={`px-3 py-1 rounded-full border text-sm ${selectedTagIds.includes(tag.id)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitEdit}
                                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showComments && (
                <div className="pt-4 border-t">
                    {/* Comment Input */}
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 border rounded px-3 py-2 text-sm"
                        />
                        <button
                            onClick={handleCommentSubmit}
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                            Post
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {comments.map((comment) => (
                            <div key={comment.Id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                    <Image
                                        src={comment.Users.Profiles?.ProfileImageUrl || '/default-profile.png'}
                                        alt="Avatar"
                                        width={32}
                                        height={32}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{comment.Users.Username}</p>
                                    <p className="text-sm text-gray-700">{comment.Content}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
