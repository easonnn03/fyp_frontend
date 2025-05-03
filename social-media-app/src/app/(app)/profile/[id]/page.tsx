'use client';

import UserHeader from '@/app/components/UserProfile/ProfileHeader';
import UserDetails from '@/app/components/UserProfile/ProfileDetails';
import UserPosts from '@/app/components/UserProfile/ProfilePosts';
import LeftSidebar from '@/app/components/LeftSidebar';

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 text-gray-800 flex flex-col lg:flex-row">
            {/* Left Sidebar */}
            <LeftSidebar />

            {/* Main Profile Content */}
            <div className="flex-1 space-y-6 mt-4 lg:mt-6 px-4 sm:px-6 lg:px-10 pb-10">
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <UserHeader />
                </div>
                <div className="rounded-2xl border border-gray-100">
                    <UserDetails />
                </div>
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                    <UserPosts />
                </div>
            </div>
        </div>
    );
}
