FactoryBot.define do
  factory :category do
    sequence(:name) { |n| "Category #{n}" }
    emoji { "📦" }
  end
end
