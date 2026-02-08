import { useState, useEffect } from "react";
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Info,
  Target,
} from "lucide-react";

export default function RecommendationsCard() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hardware/smart-recommendations");
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "performance":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "optimization":
        return <Target className="w-5 h-5 text-primary" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "tip":
        return <Lightbulb className="w-5 h-5 text-primary" />;
      default:
        return <Lightbulb className="w-5 h-5 text-primary" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "performance":
        return "border-green-500/20 bg-green-500/5";
      case "optimization":
        return "border-primary/20 bg-primary/5";
      case "warning":
        return "border-yellow-500/20 bg-yellow-500/5";
      case "info":
        return "border-blue-500/20 bg-blue-500/5";
      case "tip":
        return "border-primary/20 bg-primary/5";
      default:
        return "border-border bg-card";
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Smart Recommendations</h3>
        </div>
        <div className="text-center py-4 text-muted-foreground">
          Analyzing your setup...
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Smart Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            Based on your hardware and usage
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${getTypeColor(rec.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {rec.icon ? (
                  <span className="text-xl">{rec.icon}</span>
                ) : (
                  getIcon(rec.type)
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {rec.description}
                </p>
                {rec.action && (
                  <div className="text-xs text-primary font-medium">
                    → {rec.action}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
