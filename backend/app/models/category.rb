class Category < ApplicationRecord
  DEFAULT_EMOJIS_BY_NAME = {
    "Food" => "🍔",
    "Transportation" => "🚗",
    "Shopping" => "🛍️",
    "Entertainment" => "🎬",
    "Bills" => "📄",
    "Healthcare" => "🏥",
    "Education" => "📚",
    "Travel" => "✈️",
    "Personal" => "👤",
    "Other" => "📦"
  }.freeze

  DEFAULT_EMOJI = "📦"

  has_many :expenses, dependent: :destroy

  validates :name, presence: true, uniqueness: { case_sensitive: false }, length: { maximum: 100 }
  validates :emoji, length: { maximum: 8 }

  def emoji_with_fallback
    emoji.presence || DEFAULT_EMOJIS_BY_NAME[name] || DEFAULT_EMOJI
  end
end
