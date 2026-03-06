require 'rails_helper'

RSpec.describe "Api::Expenses", type: :request do
  let!(:food_category) { Category.create!(name: "Food") }
  let!(:transport_category) { Category.create!(name: "Transport") }

  describe "GET /api/expenses" do
    it "returns all expenses with category information" do
      Expense.create!(description: "Lunch", amount: 100.00, category: food_category, date: Date.new(2026, 3, 5))
      Expense.create!(description: "Taxi", amount: 50.00, category: transport_category, date: Date.new(2026, 3, 6))

      get "/api/expenses"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end

    it "orders expenses by expense date descending" do
      newer_date = Expense.create!(
        description: "Newer date",
        amount: 10.00,
        category: food_category,
        date: Date.new(2026, 3, 20)
      )

      older_date = Expense.create!(
        description: "Older date",
        amount: 5.00,
        category: transport_category,
        date: Date.new(2026, 3, 5)
      )

      # Ensure ordering is not accidentally driven by created_at.
      older_date.update_column(:created_at, Time.zone.local(2026, 3, 21, 12, 0, 0))
      newer_date.update_column(:created_at, Time.zone.local(2026, 3, 1, 12, 0, 0))

      get "/api/expenses", params: { year: 2026, month: 3 }

      json = JSON.parse(response.body)
      expect(json.map { |e| e["id"] }).to eq([ newer_date.id, older_date.id ])
    end

    it "uses created_at as a tie-breaker when dates are equal" do
      same_date = Date.new(2026, 3, 10)

      earlier_created = Expense.create!(
        description: "Earlier created",
        amount: 1.00,
        category: food_category,
        date: same_date
      )

      later_created = Expense.create!(
        description: "Later created",
        amount: 2.00,
        category: transport_category,
        date: same_date
      )

      earlier_created.update_column(:created_at, Time.zone.local(2026, 3, 10, 10, 0, 0))
      later_created.update_column(:created_at, Time.zone.local(2026, 3, 10, 11, 0, 0))

      get "/api/expenses", params: { year: 2026, month: 3 }

      json = JSON.parse(response.body)
      expect(json.first["id"]).to eq(later_created.id)
    end
  end

  describe "POST /api/expenses" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          expense: {
            description: "Team Lunch",
            amount: 150.50,
            category_id: food_category.id,
            date: Date.today
          }
        }
      end

      it "creates a new expense" do
        expect {
          post "/api/expenses", params: valid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["description"]).to eq("Team Lunch")
        expect(json["amount"]).to be_within(0.001).of(150.5)
      end
    end

    context "with invalid parameters" do
      it "with negative amounts" do
        invalid_params = {
          expense: {
            description: "Invalid expense",
            amount: -100.00,
            category_id: food_category.id,
            date: Date.today
          }
        }

        expect {
          post "/api/expenses", params: invalid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it "with empty descriptions" do
        invalid_params = {
          expense: {
            description: "",
            amount: 100.00,
            category_id: food_category.id,
            date: Date.today
          }
        }

        expect {
          post "/api/expenses", params: invalid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
      end
    end
  end
end
