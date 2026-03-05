require 'rails_helper'

RSpec.describe Category, type: :model do
  describe "validations" do
    subject { build(:category) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name).case_insensitive }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }
    it { is_expected.to validate_length_of(:emoji).is_at_most(8) }
  end

  describe "#emoji_with_fallback" do
    it "returns stored emoji when present" do
      category = build(:category, name: "Food", emoji: "🍕")
      expect(category.emoji_with_fallback).to eq("🍕")
    end

    it "falls back to DEFAULT_EMOJIS_BY_NAME when emoji is nil" do
      category = build(:category, name: "Food", emoji: nil)
      expect(category.emoji_with_fallback).to eq("🍔")
    end

    it "falls back to DEFAULT_EMOJI for unknown category name" do
      category = build(:category, name: "Custom", emoji: nil)
      expect(category.emoji_with_fallback).to eq("📦")
    end
  end
end
