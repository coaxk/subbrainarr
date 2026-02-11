import { useState, useEffect } from "react";
import { Star, GitFork, Users } from "lucide-react";

export default function Footer() {
  const [stats, setStats] = useState(null);
  const [tagline, setTagline] = useState("");

  const taglines = [
    "Making neckbeards laugh in XRP since 2026 💎",
    "Built by Aussies, for neckbeards worldwide 🇦🇺",
    "We're not your dad 💜",
    "Subgen, but with a brain 🧠",
    "Compose Files Matter 🐳",
    "Tell your neckbeard friends 🧔",
    "The brain the *arr stack deserves",
    "Going off like a frog in a sock 🐸🧦",
    "Nekminnit - legendary software ⚡",
  ];

  useEffect(() => {
    // Fetch GitHub stats
    fetch("/api/github/stars")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to fetch GitHub stats:", err));

    // Random tagline
    setTagline(taglines[Math.floor(Math.random() * taglines.length)]);
  }, []);

  return (
    <footer className="border-t border-border mt-12">
      <div className="container mx-auto px-4 py-6">
        {/* GitHub Stats */}
        {stats && stats.stars > 0 && (
          <div className="flex items-center justify-center gap-6 mb-4 text-sm text-muted-foreground">
            <a
              href={stats.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Star className="w-4 h-4" />
              {stats.stars} stars
            </a>
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4" />
              {stats.forks} forks
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {stats.watchers} watching
            </div>
          </div>
        )}

        {/* Tagline Rotation */}
        <div className="text-center text-sm text-muted-foreground mb-4">
          <p>{tagline}</p>
        </div>

        {/* Credits */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Made with 💜 by{" "}
            <a
              href="https://github.com/coaxk"
              className="text-primary hover:underline"
            >
              @coaxk
            </a>
          </p>
          <p className="mt-1">
            Powered by{" "}
            <a
              href="https://github.com/McCloudS/subgen"
              className="text-primary hover:underline"
            >
              McCloud/subgen
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
