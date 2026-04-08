import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

// Pleasant warm tones to cycle through avatar backgrounds
const AVATAR_TINTS = ['#F4D5C5', '#E2C9A8', '#D9B8A0', '#E8C4B8', '#C9A87C', '#EDC9B5'];

function tintFor(name, idx) {
    return AVATAR_TINTS[idx % AVATAR_TINTS.length];
}

function formatWhen(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return {
        weekday: d.toLocaleDateString(undefined, { weekday: 'long' }),
        date: d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
        time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    };
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
                <h1 className="display text-3xl">Still gathering.</h1>
                <p className="mt-4 max-w-sm text-gather-ink-soft">
                    We haven't matched you with a circle just yet. We'll let you know
                    the moment we do.
                </p>
                <Link to="/" className="btn-secondary mt-8">
                    Back home
                </Link>
            </Centered>
        );
    }

    const when = cohort.session ? formatWhen(cohort.session.scheduled_at) : null;

    return (
        <main className="mx-auto max-w-2xl px-6 py-16">
            <p className="text-sm uppercase tracking-[0.3em] text-gather-ink-soft">
                {cohort.city}
            </p>
            <h1 className="display mt-3 text-5xl sm:text-6xl">{cohort.name}</h1>
            <p className="mt-4 text-lg text-gather-ink-soft">
                A few people we think you'll get along with.
            </p>

            {/* Members as soft avatar circles */}
            <section className="card-lg mt-10">
                <h2 className="font-display text-2xl text-gather-ink">Your circle</h2>
                <div className="mt-6 flex flex-wrap gap-6">
                    {cohort.members.map((name, i) => (
                        <div key={name} className="flex flex-col items-center gap-2">
                            <div
                                className="avatar"
                                style={{ backgroundColor: tintFor(name, i) }}
                            >
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gather-ink-soft">
                                {name}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Prominent session card */}
            {cohort.session && (
                <section className="mt-8 rounded-3xl bg-gradient-to-br from-gather-blush via-white to-gather-bg-deep p-10 shadow-warm-lg border border-white">
                    <p className="text-sm uppercase tracking-[0.25em] text-gather-accent">
                        Your meetup
                    </p>

                    <div className="mt-4 space-y-1">
                        <p className="font-display text-3xl text-gather-ink sm:text-4xl">
                            {when.weekday}
                        </p>
                        <p className="font-display text-2xl text-gather-ink-soft">
                            {when.date} · {when.time}
                        </p>
                    </div>

                    <p className="mt-6 max-w-md text-gather-ink-soft">
                        One hour. Just a video call. Bring whatever you'd bring to
                        coffee with a friend you haven't met yet.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <a
                            href={cohort.session.video_link}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary"
                        >
                            Join the video call
                        </a>
                        <Link
                            to="/rate"
                            state={{ sessionId: cohort.session.id }}
                            className="btn-secondary"
                        >
                            I've already met — rate it
                        </Link>
                    </div>
                </section>
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
