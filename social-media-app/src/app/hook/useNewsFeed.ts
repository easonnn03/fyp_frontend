'use client';
import useSWRInfinite from 'swr/infinite';
import api from '@/app/utils/axios';

interface Media {
  url: string;
  type: 'image' | 'video';
}

interface Tag {
  id: string;
  name: string;
}

interface Post {
  postId: string;
  userId: string;
  username: string;
  userAvatar: string;
  createdAt: string;
  content: string;
  media: Media[];
  likeCount: number;
  commentCount: number;
  tags: Tag[];
}

interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
}

const PAGE_SIZE = 10;

export function useNewsFeed(userId: string) {
  //if no more nextCursor, return null (reach the end of the pages)
  const getKey = (pageIndex: number, previousPageData: FeedResponse | null) => {
    if (!userId) return null;
    if (previousPageData && !previousPageData.nextCursor) return null; // no more data
    const cursor = previousPageData?.nextCursor;
    return `/posts/feed?userId=${userId}&limit=${PAGE_SIZE}${
      cursor ? `&cursor=${cursor}` : ''
    }`;
  };

  //call backend and get the posts
  /*
    {
  "posts": [...],
  "nextCursor": "abcdefg"
    }
  */
  const { data, error, size, setSize } = useSWRInfinite<FeedResponse>(
    getKey,
    async (url) => {
      const res = await api.get(url);
      return res.data;
    }
  );

  //make it looks like continuous
  const posts = data ? data.flatMap((page) => page.posts) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isReachingEnd = data && data[data.length - 1]?.nextCursor === null;

  return {
    posts,
    isLoadingInitialData,
    isLoadingMore,
    isReachingEnd,
    loadMore: () => setSize(size + 1),
    error,
  };
}
