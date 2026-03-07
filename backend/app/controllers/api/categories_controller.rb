class Api::CategoriesController < ApplicationController
  def index
    categories = Category.order(:name)
    render json: categories.map { |c| format_category(c) }
  end

  def create
    category = Category.new(category_params)

    if category.save
      render json: format_category(category), status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def category_params
    params.require(:category).permit(:name, :emoji)
  end

  def format_category(category)
    {
      id: category.id,
      name: category.name,
      emoji: category.emoji_with_fallback
    }
  end
end
