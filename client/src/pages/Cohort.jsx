import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

function formatWhen(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function Cohort() {
    const [cohort, setCohort] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.myCohort()
            .then((data) => setCohort(data.cohort))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Centered>Loading your circle…</Centered>;
    if (error) return <Centered>{error}</Centered>;
    if (!cohort) {
        return (
            <Centered>
                You haven't been matched yet. Check back soon.
                <Link to="/" className="btn-secondary mt-6">Back home</Link>
            </Centered>
        );
    }

    return (
        <main className="mx-auto max-w-xl px-6 py-16">
            <h1 className="text-3xl font-bold">{cohort.name}</h1>
            <p className="mt-1 text-gather-ink/60">{cohort.city}</p>

            <div className="card mt-8">
                <h2 className="text-lg font-semibold">Your circle</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                    {cohort.members.map((name) => (
                        <li key={name} className="rounded-full bg-gather-bg px-4 py-2 text-sm">
                            {name}
                        </li>
                    ))}
                </ul>
            </div>

            {cohort.session && (
                <div className="card mt-6">
                    <h2 className="text-lg font-semibold">Your meetup</h2>
                    <p className="mt-2 text-gather-ink/70">{formatWhen(cohort.session.scheduled_at)}</p>
                    <a
                        href={cohort.session.video_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary mt-4"
                    >
                        Join video call
                    </a>
                    <Link
                        to="/rate"
                        state={{ sessionId: cohort.session.id }}
                        className="btn-secondary mt-3 ml-2"
                    >
                        Rate after the call
                    </Link>
                </div>
            )}
        </main>
    );
}

function Centered({ children }) {
    return (
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
            {children}
        </main>
    );
}
