import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">Gather</h1>
            <p className="mt-6 text-xl text-gather-ink/70">
                Real friendships, started in small groups. Gather matches adults in your city
                with others at a similar life stage, then brings you together over a single
                video meetup. No swiping, no ghosting — just a quiet way to find your people.
            </p>
            <Link to="/join" className="btn-primary mt-10 text-lg">
                Join Gather
            </Link>
            <p className="mt-6 text-sm text-gather-ink/50">
                Free during early access · Takes under a minute
            </p>
        </main>
    );
}
