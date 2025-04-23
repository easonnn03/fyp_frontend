//[id] is a dynamic route parameter (required to reach the pages)
'use client'
// For Nextjs 13+ App Router, components are server components by default
// useState, useEffect, onClick, any interactivity
// Tell Nextjs this components run in the browser

const ProfilePage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
            <p className="text-lg">This is the profile page.</p>
        </div>
    );
}

export default ProfilePage