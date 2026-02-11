import { X, Trophy } from "lucide-react";

export default function MilestoneModal({ milestone, onClose }) {
  if (!milestone) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-primary rounded-lg max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">{milestone.badge}</div>

          <h2 className="text-2xl font-bold mb-2 text-primary">
            {milestone.title}
          </h2>

          <p className="text-lg mb-4">{milestone.message}</p>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <p className="text-3xl font-bold text-primary">
              {milestone.milestone_value.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Files Processed</p>
          </div>

          <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg p-3 mb-4">
            <p className="text-sm">
              <span className="font-semibold">Rank Unlocked:</span>{" "}
              <span className="text-primary">{milestone.rank}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Keep Going!
          </button>

          <p className="text-xs text-muted-foreground mt-4">
            Share this achievement with your neckbeard friends! 🧔
          </p>
        </div>
      </div>
    </div>
  );
}
