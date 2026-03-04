class MakeDateNotNullInExpenses < ActiveRecord::Migration[7.2]
  def up
    # Fill any existing NULL values first (prevents migration failure)
    execute <<-SQL
      UPDATE expenses
      SET date = CURRENT_DATE
      WHERE date IS NULL
    SQL

    # Then enforce NOT NULL constraint
    change_column_null :expenses, :date, false
  end

  def down
    change_column_null :expenses, :date, true
  end
end