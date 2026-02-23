import { useState, useEffect } from "react";
import {
  Star,
  Github,
  MessageCircle,
  Bug,
  BookOpen,
} from "lucide-react";

export default function Footer() {
  const [stats, setStats] = useState(null);
  const [tagline, setTagline] = useState("");

  const taglines = [
    "Making neckbeards laugh in XRP since 2026",
    "Built by Aussies, for neckbeards worldwide",
    "We're not your dad",
    "Subgen, but with a brain",
    "Compose Files Matter",
    "Tell your neckbeard friends",
    "The brain the *arr stack deserves",
    "Going off like a frog in a sock",
    "Nekminnit - legendary software",
  ];

  useEffect(() => {
    fetch("/api/github/stars")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to fetch GitHub stats:", err));

    setTagline(taglines[Math.floor(Math.random() * taglines.length)]);
  }, []);

  const iconLinks = [
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/coaxk/subbrainarr",
      badge: stats && stats.stars > 0 ? stats.stars : null,
    },
    {
      icon: MessageCircle,
      label: "Discussions",
      href: "https://github.com/coaxk/subbrainarr/discussions",
    },
    {
      icon: Bug,
      label: "Report Bug",
      href: "https://github.com/coaxk/subbrainarr/issues/new",
    },
    {
      icon: BookOpen,
      label: "Subgen Docs",
      href: "https://github.com/McCloudS/subgen",
    },
  ];

  return (
    <footer className="border-t border-border mt-12">
      <div className="container mx-auto px-4 py-6">
        {/* Icon Row */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {iconLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                title={link.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">
                  {link.label}
                </span>
                {link.badge && (
                  <span className="flex items-center gap-0.5 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    <Star className="w-3 h-3" />
                    {link.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>

        {/* Version Badge */}
        <div className="flex justify-center mb-3">
          <span className="text-xs px-2.5 py-1 bg-secondary rounded-full text-muted-foreground">
            SubBrainArr v1.6.1
          </span>
        </div>

        {/* Tagline */}
        <div className="text-center text-sm text-muted-foreground mb-3">
          <p>{tagline}</p>
        </div>

        {/* Credits */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Made with care by{" "}
            <a
              href="https://github.com/coaxk"
              className="text-primary hover:underline"
            >
              @coaxk
            </a>
            {" | "}
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
