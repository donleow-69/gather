import { Link } from 'react-router-dom';

export default function Waiting() {
    return (
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
            <div className="card-lg w-full">
                {/* Three overlapping circles — a quiet visual of a small circle forming */}
                <div className="mx-auto mb-8 flex h-24 w-32 items-center justify-center">
                    <svg viewBox="0 0 120 80" className="h-full w-full">
                        <circle cx="35" cy="40" r="28" fill="#F4D5C5" opacity="0.85">
                            <animate attributeName="opacity" values="0.6;0.95;0.6" dur="4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="60" cy="40" r="28" fill="#E26D5C" opacity="0.85">
                            <animate attributeName="opacity" values="0.95;0.6;0.95" dur="4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="85" cy="40" r="28" fill="#C9A87C" opacity="0.85">
                            <animate attributeName="opacity" values="0.6;0.95;0.6" dur="4s" begin="2s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                </div>

                <h1 className="display text-4xl sm:text-5xl">
                    You're in.
                </h1>

                <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-gather-ink-soft">
                    Take a breath. We've got you.
                </p>

                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gather-ink-soft">
                    We'll quietly look for a few people in your city who feel like
                    you do right now. When your circle is ready — usually within a
                    week — we'll send you the meetup details.
                </p>

                <p className="mx-auto mt-4 max-w-md text-sm italic text-gather-ink-soft">
                    No notifications. No nudges. Just a single thoughtful email.
                </p>

                <Link to="/cohort" className="btn-secondary mt-10">
                    Check on my circle
                </Link>
            </div>
        </main>
    );
}
