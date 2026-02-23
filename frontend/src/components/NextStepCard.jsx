import { ArrowRight } from "lucide-react";

/**
 * Trail-head waypoint card — guides users to the next logical step.
 * Placed at the bottom of each tab to create a "garden path" flow:
 * Dashboard → Languages → Scanning → Settings.
 *
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.title - CTA heading (e.g. "Configure Your Languages")
 * @param {string} props.description - Why this step matters
 * @param {string} props.buttonLabel - Button text
 * @param {function} props.onClick - Navigation callback
 */
export default function NextStepCard({ icon: Icon, title, description, buttonLabel, onClick }) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <button
            onClick={onClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {buttonLabel}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
