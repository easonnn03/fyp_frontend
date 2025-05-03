'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/app/utils/axios';
import { toast } from 'react-toastify';
export default function UserDetails() {
    const params = useParams();
    const profileId = params?.id as string;

    const [profileHeaderData, setProfileHeaderData] = useState<{ bio: string; courseName: string; age: number; interests: string[] } | null>(null);

    useEffect(() => {
        try {
            api.get('/user/Profile-Details', {
                params: {
                    profileId,
                },
            }).then((res) => {
                setProfileHeaderData(res.data);
            }).catch((err) => {
                toast.error('Failed to fetch profile header data1:' + (err as Error).message);
            });
        } catch (err) {
            toast.error('Invalid token:' + (err as Error).message);
        }
    }, [profileId]);

    const bio = profileHeaderData?.bio;
    const course = profileHeaderData?.courseName;
    const age = profileHeaderData?.age;
    const interests = profileHeaderData?.interests || [];

    return (
        <div className="flex flex-col gap-4 p-6 w-full bg-gradient-to-bl from-purple-100 to-white rounded-lg shadow-lg transform hover:scale-[1.01] transition-transform">
            {/* About Me */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-purple-800">About Me</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                    {bio}
                </p>
            </div>

            {/* Details */}
            <div className="space-y-4 border-t border-purple-200 pt-4">
                <h2 className="text-lg font-semibold text-purple-800">Details</h2>
                <div className="space-y-2">
                    <p className="flex items-center gap-2 text-purple-700 text-sm">
                        <span className="font-medium text-purple-900">Course:</span>
                        {course}
                    </p>
                    <p className="flex items-center gap-2 text-purple-700 text-sm">
                        <span className="font-medium text-purple-900">Age:</span>
                        {age}
                    </p>
                </div>
            </div>

            {/* Interests */}
            <div className="space-y-4 border-t border-purple-200 pt-4">
                <h2 className="text-lg font-semibold text-purple-800">Interests</h2>
                <div className="flex flex-wrap gap-2">
                    {interests.map((interest, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium shadow hover:shadow-md transition-all"
                        >
                            #{interest}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}