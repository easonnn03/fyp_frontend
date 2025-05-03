'use client';

import LeftMenu from '@/app/components/HomePage/LeftSidebar';
import MainFeed from '@/app/components/HomePage/MainFeed';
import RightMenu from '@/app/components/HomePage/RightSidebar';

const Homepage = () => {

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 font-inter flex">
            <LeftMenu />
            <MainFeed />
            <RightMenu />
        </div>
    )
};

export default Homepage