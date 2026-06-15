import React, { useEffect, useMemo, useState } from "react";

const BOARD_TITLES = {
  milestoneNodes: {
    title: "Board 01 - Milestone Nodes",
    folder: "public/assets/milestone-nodes"
  },
  treasureSystem: {
    title: "Board 02 - Treasure System",
    folder: "public/assets/treasure-system"
  },
  phoenixShrine: {
    title: "Board 04 - Phoenix Shrine",
    folder: "public/assets/phoenix-shrine"
  },
  identityShift: {
    title: "Board 05 - Identity Shift Cards",
    folder: "public/assets/identity-shift/identity"
  }
};

function labelFromKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function flattenAssets(value, trail = []) {
  if (!value || typeof value !== "object") return [];

  if (value.src) {
    return [
      {
        key: trail.join("."),
        name: trail.map(labelFromKey).join(" / "),
        src: value.src,
        description: value.description || ""
      }
    ];
  }

  return Object.entries(value).flatMap(([key, child]) => flattenAssets(child, [...trail, key]));
}

export default function AssetLibraryPage() {
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    fetch("/assets/asset-manifest.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (mounted) setManifest(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Unable to load asset manifest.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sections = useMemo(() => {
    if (!manifest) return [];

    return Object.entries(manifest).map(([sectionKey, sectionValue]) => ({
      key: sectionKey,
      title: BOARD_TITLES[sectionKey]?.title || labelFromKey(sectionKey),
      folder: BOARD_TITLES[sectionKey]?.folder || "public/assets",
      assets: flattenAssets(sectionValue)
    }));
  }, [manifest]);

  const totalAssets = sections.reduce((sum, section) => sum + section.assets.length, 0);

  return (
    <section className="asset-library-page">
      <header className="asset-library-hero">
        <div>
          <p className="asset-library-kicker">Production Asset Library</p>
          <h1>Storyboard Assets Live In App</h1>
          <p>
            Every extracted board image is loaded from the production manifest and rendered here from
            the public asset folders.
          </p>
        </div>
        <div className="asset-library-count" aria-label={`${totalAssets} available assets`}>
          <strong>{totalAssets}</strong>
          <span>assets visible</span>
        </div>
      </header>

      {error && (
        <div className="asset-library-error" role="alert">
          {error}
        </div>
      )}

      {!manifest && !error && (
        <div className="asset-library-loading">Loading production assets...</div>
      )}

      {sections.map((section) => (
        <section className="asset-board-section" key={section.key}>
          <div className="asset-board-section__header">
            <div>
              <p className="asset-library-kicker">{section.folder}</p>
              <h2>{section.title}</h2>
            </div>
            <span>{section.assets.length} PNGs</span>
          </div>

          <div className="asset-grid">
            {section.assets.map((asset) => (
              <article className="asset-tile" key={asset.key}>
                <div className="asset-tile__image">
                  <img src={asset.src} alt={asset.name} loading="lazy" />
                </div>
                <div className="asset-tile__body">
                  <h3>{asset.name}</h3>
                  <p>{asset.description}</p>
                  <code>{asset.src}</code>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
