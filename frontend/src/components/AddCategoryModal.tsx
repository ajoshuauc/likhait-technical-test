import React, { useState, useEffect } from "react";
import { Category } from "../types";
import { createCategory } from "../services/api";
import { Modal, TextField, Button } from "../vibes";
import { COLORS } from "../constants/colors";

const EMOJI_OPTIONS = [
  "🍔", "🚗", "🛍️", "🎬", "📄", "🏥", "📚", "✈️", "👤", "📦",
  "🏠", "🎵", "🐾", "💼", "🎮", "💊", "🎁", "🌿", "☕", "🏋️",
  "🎨", "🔧", "📱", "🚌", "⛽", "🍕", "🧹", "💡", "🎂", "💰",
];

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (category: Category) => void;
  existingCategories: Category[];
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onCreated,
  existingCategories,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📦");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmoji("📦");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validate = (): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return "Category name is required";
    if (trimmed.length > 100) return "Category name must be 100 characters or less";
    const duplicate = existingCategories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) return "A category with this name already exists";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const category = await createCategory({
        name: name.trim(),
        emoji,
      });
      onCreated(category);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    marginTop: "8px",
    marginBottom: "16px",
  };

  const emojiButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    width: "44px",
    height: "44px",
    fontSize: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: isSelected
      ? `2px solid ${COLORS.primary.p06}`
      : `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    background: isSelected ? COLORS.primary.p01 : COLORS.background.main,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const previewStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    background: COLORS.secondary.s01,
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "18px",
    fontWeight: 600,
    color: COLORS.text.primary,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: COLORS.danger,
    marginBottom: "12px",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "flex-end",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: COLORS.text.primary,
    marginBottom: "4px",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Category">
      <div onKeyDown={handleKeyDown}>
        <TextField
          label="Category Name"
          type="text"
          placeholder="e.g. Groceries"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          maxLength={100}
          fullWidth
          required
          autoFocus
        />

        <div style={{ marginTop: "16px" }}>
          <div style={labelStyle}>Pick an Emoji</div>
          <div style={gridStyle}>
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                style={emojiButtonStyle(e === emoji)}
                onClick={() => setEmoji(e)}
                aria-label={`Select ${e} emoji`}
                aria-pressed={e === emoji}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {name.trim() && (
          <div style={previewStyle}>
            <span style={{ fontSize: "28px" }}>{emoji}</span>
            <span>{name.trim()}</span>
          </div>
        )}

        {error && <div style={errorStyle}>{error}</div>}

        <div style={buttonGroupStyle}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Category"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
