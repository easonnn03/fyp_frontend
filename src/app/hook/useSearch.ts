'use client';

import { useState } from 'react';
import api from '@/app/utils/axios';
import { toast } from 'react-toastify';

type ResultItem = {
  id: string;
  username?: string;
  content?: string;
  media?: { url: string; type: string }[]; // if Post has media
  name?: string; // for tag
};

type SearchParams = {
  type: 'user' | 'post' | 'tag';
  requesterId: string;
  query?: string;
  tagId?: string;
};

export function useSearch() {
  const [type, setType] = useState<'user' | 'post' | 'tag'>('user');
  const [query, setQuery] = useState('');
  const [tagId, setTagId] = useState<string>('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = async (requesterId: string) => {
    setIsLoading(true);
    try {
      const params: SearchParams = { type, requesterId };
      if (type === 'tag') params.tagId = tagId;
      else params.query = query;

      const res = await api.get('/search', { params });
      if (type === 'user') setResults(res.data.users);
      if (type === 'post') setResults(res.data.posts);
      if (type === 'tag') setResults(res.data.tags);
    } catch (err) {
      toast.error('Search failed' + err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    type,
    setType,
    query,
    setQuery,
    tagId,
    setTagId,
    results,
    isLoading,
    search,
  };
}
