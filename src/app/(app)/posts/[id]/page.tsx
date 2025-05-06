"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/app/utils/axios";
import PostCard from "@/app/components/PostCard";
import { toast } from "react-toastify";
import { notFound } from 'next/navigation';
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

export default function PostPage() {
    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true); // ADD loading state

    useEffect(() => {
        if (!id) return;
        api
            .get(`/posts/get-post?postId=${id}`)
            .then((res) => {
                setPost(res.data);
            })
            .catch((err) => {
                toast.error(err);
                setPost(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <p className="text-center text-gray-500">Loading post...</p>;
    }

    if (!post) {
        return notFound();
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <PostCard
                key={post.Id}
                postId={post.Id}
                userId={post.UserId}
                username={post.Users.Username}
                userAvatar={post.Users.Profiles?.ProfileImageUrl ?? '/default-profile.png'}
                createdAt={post.createdAt}
                content={post.Content}
                media={post.PostMedia?.map((m) => ({
                    url: m.Url,
                    type: m.Type as 'image' | 'video',
                })) ?? []}
                likeCount={post.Likes?.length ?? 0}
                commentCount={post.Comments?.length ?? 0}
                tags={post.PostTags?.map((t) => ({
                    id: t.InterestTags.Id,
                    name: t.InterestTags.Name,
                })) ?? []}
                isOwnPost={false}
            />
        </div>
    );
}
