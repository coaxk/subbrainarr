import { useState, useEffect } from "react";
import { Users, Globe, TrendingUp, Award, Heart } from "lucide-react";
import MilestoneModal from "./MilestoneModal";

export default function CommunityCard() {
  const [communityStats, setCommunityStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [milestone, setMilestone] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [community, user] = await Promise.all([
          fetch("/api/community/stats").then((r) => r.json()),
          fetch("/api/community/user-stats").then((r) => r.json()),
        ]);
        setCommunityStats(community);
        setUserStats(user);

        // Check for milestones
        if (user.files_processed) {
          const milestoneCheck = await fetch(
            `/api/community/check-milestone?files_processed=${user.files_processed}`
          ).then((r) => r.json());
          console.log("Milestone check result:", milestoneCheck);
          if (milestoneCheck.milestone_hit) {
            // Check if we've already shown this milestone
            const shownKey = `milestone_shown_${milestoneCheck.milestone_value}`;
            if (!localStorage.getItem(shownKey)) {
              setMilestone(milestoneCheck);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch community stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-4 text-muted-foreground">
          Loading community stats...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">SubBrainArr Community</h3>
          <p className="text-sm text-muted-foreground">
            You're not alone in this fight
          </p>
        </div>
      </div>

      {/* User Identity */}
      <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-4">
        <p className="text-center text-lg">
          You are{" "}
          <span className="font-bold text-primary">
            one of {communityStats.total_users.toLocaleString()}
          </span>{" "}
          neckbeards
        </p>
        <p className="text-center text-sm text-muted-foreground mt-1">
          making subtitles great again
        </p>
      </div>

      {/* Global Stats */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h4 className="font-semibold">Global Stats (Last 24h)</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-background/50 rounded-md p-3">
            <p className="text-muted-foreground">Files Processed</p>
            <p className="text-xl font-bold text-primary">
              {communityStats.files_processed_24h.toLocaleString()}
            </p>
          </div>
          <div className="bg-background/50 rounded-md p-3">
            <p className="text-muted-foreground">Active Users</p>
            <p className="text-xl font-bold text-primary">
              {communityStats.active_users_24h.toLocaleString()}
            </p>
          </div>
          <div className="bg-background/50 rounded-md p-3">
            <p className="text-muted-foreground">Total Processed</p>
            <p className="text-xl font-bold text-primary">
              {(communityStats.total_files_processed / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-background/50 rounded-md p-3">
            <p className="text-muted-foreground">Storage Transcribed</p>
            <p className="text-xl font-bold text-primary">
              {communityStats.total_storage_transcribed_tb} TB
            </p>
          </div>
        </div>
        <div className="mt-3 text-center text-sm">
          <span className="text-muted-foreground">Most active: </span>
          <span className="font-semibold text-primary">
            {communityStats.most_active_language} (
            {communityStats.most_active_language_pct}%)
          </span>
        </div>
      </div>

      {/* User Contribution */}
      {userStats && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Your Contribution</h4>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-background/50 rounded-md p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {userStats.files_processed.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Files</p>
            </div>
            <div className="bg-background/50 rounded-md p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                Top {userStats.top_percentile}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Rank</p>
            </div>
            <div className="bg-background/50 rounded-md p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {userStats.favorite_language}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Favorite</p>
            </div>
          </div>
        </div>
      )}

      {/* Trending Badge */}
      {communityStats.trending_rank && (
        <div className="mt-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-md p-3 text-center">
          <p className="text-sm">
            🔥{" "}
            <span className="font-semibold">
              Trending #{communityStats.trending_rank}
            </span>{" "}
            in *arr stack
          </p>
        </div>
      )}

      {/* Milestone Modal */}
      {milestone && (
        <MilestoneModal
          milestone={milestone}
          onClose={() => {
            // Mark this milestone as shown
            const shownKey = `milestone_shown_${milestone.milestone_value}`;
            localStorage.setItem(shownKey, "true");
            setMilestone(null);
          }}
        />
      )}
    </div>
  );
}
