import { Link } from 'react-router-dom';
import ReturningUser from '../components/ReturningUser.jsx';

export default function Landing() {
    return (
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
            {/* Wordmark */}
            <p className="mb-8 text-xs uppercase tracking-[0.4em] text-gather-ink-soft">
                Gather
            </p>

            {/* Editorial headline */}
            <h1 className="display text-4xl sm:text-5xl md:text-6xl">
                Making friends
                <br />
                <span className="italic text-gather-accent">as an adult</span>
                <br />
                shouldn't be this hard.
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-gather-ink-soft sm:text-lg">
                Gather quietly matches you with a small circle of people in your city
                at a similar life stage. One video meetup. No pressure to be anything
                other than yourself.
            </p>

            <Link to="/join" className="btn-primary mt-10">
                Join Gather
            </Link>

            <ReturningUser />

            {/* Social proof / reassurance */}
            <div className="mt-10 space-y-1.5 text-xs text-gather-ink-soft">
                <p>No algorithm. No swiping. Just people.</p>
                <p>Free during early access — no card, no catch.</p>
                <p>Built quietly, by someone who's been there.</p>
            </div>
        </main>
    );
}
