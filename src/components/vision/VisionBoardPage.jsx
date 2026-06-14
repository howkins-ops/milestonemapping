import React, { useState } from "react";
import VisionBoardCard from "./VisionBoardCard.jsx";
import VisionBoardForm from "./VisionBoardForm.jsx";
import Button from "../ui/Button.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import { useAppData } from "../../hooks/useAppData.js";

export default function VisionBoardPage() {
  const { visionBoard, addVisionBoardItem, deleteVisionBoardItem } = useAppData();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="anim-fade-in">
      <header className="page-header">
        <div className="page-header__kicker">VISION BOARD</div>
        <h1 className="page-header__title">
          Your future should be visible before it becomes real.
        </h1>
        <p className="page-header__sub">Pin the evidence of where you're going.</p>
      </header>

      <div style={{ marginBottom: 20 }}>
        <Button variant="primary" onClick={() => setFormOpen(true)}>
          + Add Vision
        </Button>
      </div>

      {visionBoard.length === 0 ? (
        <EmptyState
          icon="🔭"
          title="The board is blank"
          description="A future you can see is a future you can build. Pin your first vision."
          actionLabel="+ Add Vision"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div style={{ columns: "3 240px", columnGap: 16 }}>
          {visionBoard.map((item, i) => (
            <VisionBoardCard
              key={item.id}
              item={item}
              index={i}
              onDelete={() => deleteVisionBoardItem(item.id)}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <VisionBoardForm open={formOpen} onClose={() => setFormOpen(false)} onAdd={addVisionBoardItem} />
      )}
    </div>
  );
}
