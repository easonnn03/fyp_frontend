'use client';
import { useState } from 'react';
import api from '@/app/utils/axios';

const moods = [
    { label: "Very Sad", emoji: "😢", value: 1 },
    { label: "Sad", emoji: "😟", value: 2 },
    { label: "Neutral", emoji: "😐", value: 3 },
    { label: "Happy", emoji: "🙂", value: 4 },
    { label: "Very Happy", emoji: "😄", value: 5 },
];

export default function DailyMoodPage() {
    const [selected, setSelected] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (selected !== null) {
            await api.post('/mood/mood-submit', { mood: selected });
            setSubmitted(true);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg text-center space-y-4">
            <h1 className="text-lg font-bold">How are you feeling today?</h1>

            <div className="flex justify-center gap-4">
                {moods.map((m) => (
                    <button
                        key={m.value}
                        className={`text-3xl hover:scale-110 transition ${selected === m.value ? 'ring-2 ring-blue-500 rounded-full' : ''}`}
                        onClick={() => setSelected(m.value)}
                    >
                        {m.emoji}
                    </button>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                disabled={submitted || selected === null}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                {submitted ? "Thanks for sharing 💙" : "Submit Mood"}
            </button>
        </div>
    );
}
