import { milestoneWorldAssets as MWA } from "../lib/milestoneWorldAssets.js";

export default function XPModal({ event, onClose }) {
  if (!event) return null;

  return (
    <div className="xp-backdrop" role="presentation" onClick={onClose}>
      <div className="xp-modal" role="dialog" aria-modal="true" onClick={(eventClick) => eventClick.stopPropagation()}>
        <span className="xp-glow" />
        <span className="xp-asset" aria-hidden="true">
          <img src={MWA.portals.active} alt="" />
          <img src={MWA.icons.diamonds} alt="" />
        </span>
        <p className="hud-label">System Reward</p>
        <h2>+{event.xp} XP</h2>
        <p>{event.label}</p>
        {event.badges?.length > 0 && (
          <div className="badge-row">
            {event.badges.map((badge) => (
              <span className="badge" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        )}
        <button className="primary-btn compact" type="button" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
