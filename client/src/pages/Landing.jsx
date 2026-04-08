import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
            {/* Wordmark */}
            <p className="mb-10 text-sm uppercase tracking-[0.4em] text-gather-ink-soft">
                Gather
            </p>

            {/* Editorial headline */}
            <h1 className="display text-6xl sm:text-7xl md:text-8xl">
                Making friends
                <br />
                <span className="italic text-gather-accent">as an adult</span>
                <br />
                shouldn't be this hard.
            </h1>

            <p className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-gather-ink-soft sm:text-xl">
                Gather quietly matches you with a small circle of people in your city
                at a similar life stage. One video meetup. No pressure to be anything
                other than yourself.
            </p>

            <Link to="/join" className="btn-primary mt-12 text-lg">
                Join Gather
            </Link>

            {/* Social proof / reassurance */}
            <div className="mt-12 space-y-2 text-sm text-gather-ink-soft">
                <p>No algorithm. No swiping. Just people.</p>
                <p>Free during early access — no card, no catch.</p>
                <p>Built quietly, by someone who's been there.</p>
            </div>
        </main>
    );
}
