require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    let!(:food) { Category.create!(name: "Food", emoji: "🍔") }
    let!(:transport) { Category.create!(name: "Transport", emoji: "🚗") }
    let!(:supplies) { Category.create!(name: "Supplies") }

    it "returns all categories" do
      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      expect(json.map { |c| c["name"] }).to include("Food", "Transport", "Supplies")
    end

    it "returns categories in alphabetical order" do
      get "/api/categories"

      json = JSON.parse(response.body)
      expect(json.map { |c| c["name"] }).to eq([ "Food", "Supplies", "Transport" ])
    end

    it "returns emoji field with fallback for nil" do
      get "/api/categories"

      json = JSON.parse(response.body)
      food_json = json.find { |c| c["name"] == "Food" }
      supplies_json = json.find { |c| c["name"] == "Supplies" }

      expect(food_json["emoji"]).to eq("🍔")
      expect(supplies_json["emoji"]).to eq("📦")
    end
  end

  describe "POST /api/categories" do
    context "with valid parameters" do
      let(:valid_params) do
        { category: { name: "Groceries", emoji: "🛒" } }
      end

      it "creates a new category" do
        expect {
          post "/api/categories", params: valid_params, as: :json
        }.to change(Category, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Groceries")
        expect(json["emoji"]).to eq("🛒")
        expect(json["id"]).to be_present
      end
    end

    context "with duplicate name" do
      before { Category.create!(name: "Food", emoji: "🍔") }

      it "returns unprocessable entity" do
        post "/api/categories", params: { category: { name: "Food", emoji: "🍕" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name has already been taken")
      end
    end

    context "with missing name" do
      it "returns unprocessable entity" do
        post "/api/categories", params: { category: { name: "", emoji: "📦" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Name can't be blank")
      end
    end
  end
end
