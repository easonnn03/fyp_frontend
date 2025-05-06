'use client';
import { useEffect, useState } from 'react';
import PostCard from '@/app/components/PostCard';
import api from '@/app/utils/axios';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';

interface Like {
    id: string;
    userId: string;
    postId: string;
}

interface Comment {
    id: string;
    userId: string;
    postId: string;
    content: string;
    createdAt: string;
}

interface PostMedia {
    Url: string;
    Type: 'image' | 'video';
}

interface PostTag {
    InterestTags: {
        Id: string;
        Name: string;
    };
}

interface Post {
    Id: string;
    UserId: string;
    Content: string;
    createdAt: string;
    Users: {
        Username: string;
        Profiles?: {
            ProfileImageUrl: string;
        };
    };
    PostMedia?: PostMedia[];
    Likes?: Like[];
    Comments?: Comment[];
    PostTags?: PostTag[];
}

export default function ProfilePosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const params = useParams();
    const userIdFromRoute = params?.id as string;

    const [isSelf, setIsSelf] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const { sub } = JSON.parse(atob(token.split('.')[1]));
            if (sub === userIdFromRoute) {
                setIsSelf(true);
            }
        }
    }, [userIdFromRoute]);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const res = await api.get(`/posts/user-posts?userId=${userIdFromRoute}`);
                setPosts(res.data);
            } catch (err) {
                toast.error('Failed to fetch user posts' + err);
            } finally {
                setLoading(false);
            }
        };

        if (userIdFromRoute) fetchUserPosts();
    }, [userIdFromRoute]);

    if (loading) return <p className="text-sm text-gray-500">Loading your posts...</p>;

    return (
        <div className="space-y-6">
            {posts.length === 0 ? (
                <p className="text-center text-gray-500"> User haven’t posted anything yet.</p>
            ) : (
                posts.map((post) => (
                    <PostCard
                        key={post.Id}
                        postId={post.Id}
                        userId={post.UserId}
                        username={post.Users.Username}
                        userAvatar={post.Users.Profiles?.ProfileImageUrl ?? '/default-profile.png'}
                        createdAt={post.createdAt}
                        content={post.Content}
                        media={
                            post.PostMedia?.map((m) => ({
                                url: m.Url,
                                type: m.Type as 'image' | 'video',
                            })) ?? []
                        }
                        likeCount={post.Likes?.length ?? 0}
                        commentCount={post.Comments?.length ?? 0}
                        tags={post.PostTags?.map((t) => ({
                            id: t.InterestTags.Id,
                            name: t.InterestTags.Name,
                        }))}
                        isOwnPost={isSelf}
                    />
                ))
            )}
        </div>
    );
}
