import { useState, useEffect } from 'react';
import api from '@/app/utils/axios';
import { toast } from 'react-toastify';
import { useRef } from 'react';

type EditProfileModalProps = {
    visible: boolean;
    currentUsername: string;
    currentUserId: string;
    onClose: () => void;
    onSave: (username: string, bio: string, age: number, course: string, interests: string[]) => void;
};

export default function EditProfileForm({
    visible,
    currentUsername,
    currentUserId,
    onClose,
    onSave
}: EditProfileModalProps) {
    const [username, setUsername] = useState(currentUsername);
    const [, setUserId] = useState(currentUserId);
    const [bio, setBio] = useState<string>('');
    const [age, setAge] = useState<number>(0);
    const [course, setCourse] = useState<string>('');
    const [interests, setInterests] = useState<string[]>([]);
    const [profileFormData, setProfileFormData] = useState<{
        bio: string;
        courseName: string;
        age: number;
        interests: string[]
    } | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!visible) return;
        api.get('/user/getAllTags')
            .then((res) => {
                setAllTags(res.data || []);
            })
            .catch((err) => {
                toast.error('Failed to fetch available tags: ' + (err as Error).message);
            });
    }, [visible]);

    // Fetch user details when the modal is opened
    useEffect(() => {
        if (!visible) return;
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const { sub } = JSON.parse(atob(token.split('.')[1]));
                api.get('/user/Profile-Details', {
                    params: {
                        profileId: sub,
                    },
                }).then((res) => {
                    setInterests(res.data.interests || []);
                    setProfileFormData(res.data);
                }).catch((err) => {
                    toast.error('Failed to fetch profile header data:' + (err as Error).message);
                });
            } catch (err) {
                toast.error('Invalid token:' + (err as Error).message);
            }
        }
    }, [visible]);

    // Update form fields when profileFormData changes
    useEffect(() => {
        if (!visible) return;
        setUsername(currentUsername);
        setUserId(currentUserId);
        setBio(profileFormData?.bio || '');
        setAge(profileFormData?.age || 0);
        setCourse(profileFormData?.courseName || '');
        setInterests(profileFormData?.interests || []);
        setSelectedTag('');
    }, [profileFormData, visible]);


    if (!visible) return null;

    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    function addInterest() {
        const trimmed = selectedTag.trim();
        if (trimmed && !interests.includes(trimmed)) {
            setInterests([...interests, trimmed]);
        }
        setSelectedTag('');
    }

    function removeInterest(tag: string) {
        setInterests(interests.filter((i) => i !== tag));
    }

    if (!visible) return null;

    return (
        <div
            onClick={handleBackgroundClick}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div
                ref={modalRef}
                className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Profile</h2>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Username Field */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Age Field */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">Age</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Course Field */}
                    <div className="col-span-2 flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">Course</label>
                        <input
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Bio Field */}
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="border px-4 py-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Interests Field */}
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Interests</label>

                    {/* Display chosen interests */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {interests.map((interest) => (
                            <span
                                key={interest}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2"
                            >
                                {interest}
                                <button
                                    className="font-bold text-red-500 hover:text-red-700"
                                    onClick={() => removeInterest(interest)}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Dropdown for predefined tags */}
                    <div className="flex gap-2">
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="border px-3 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a tag</option>
                            {allTags
                                .filter((tag) => !interests.includes(tag)) // Exclude already selected tags
                                .map((tag) => (
                                    <option key={tag} value={tag}>
                                        {tag}
                                    </option>
                                ))}
                        </select>
                        <button
                            onClick={addInterest}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSave(username, bio, age, course, interests);
                            onClose();
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}