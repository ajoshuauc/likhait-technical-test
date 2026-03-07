/**
 * API service for communicating with the backend
 */

import { Expense, ExpenseFormData, Category } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

type ExpenseDto = Omit<Expense, "amount"> & { amount: unknown };

function parseAmount(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeExpense(dto: ExpenseDto): Expense {
  return {
    ...dto,
    amount: parseAmount(dto.amount),
  } as Expense;
}

/**
 * Fetch all expenses
 */
export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch(`${API_BASE_URL}/expenses`);
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  const json = (await response.json()) as ExpenseDto[];
  return json.map(normalizeExpense);
}

/**
 * Fetch expenses for a specific year and month
 */
export async function getExpenses(
  year: number,
  month: number,
): Promise<Expense[]> {
  const response = await fetch(
    `${API_BASE_URL}/expenses?year=${year}&month=${month}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  const json = (await response.json()) as ExpenseDto[];
  return json.map(normalizeExpense);
}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

/**
 * Create a new category
 */
export async function createCategory(data: {
  name: string;
  emoji: string;
}): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category: data }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.errors?.join(", ") || "Failed to create category");
  }

  return response.json();
}

/**
 * Create a new expense
 */
export async function createExpense(data: ExpenseFormData): Promise<Expense> {
  // Convert category name to category_id
  const categories = await fetchCategories();
  const category = categories.find((c) => c.name === data.category);

  const expenseData = {
    description: data.description,
    amount: data.amount,
    category_id: category?.id,
    date: data.date,
  };

  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: expenseData }),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense");
  }

  const json = (await response.json()) as ExpenseDto;
  return normalizeExpense(json);
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  id: number,
  data: Partial<ExpenseFormData>,
): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: data }),
  });

  if (!response.ok) {
    throw new Error("Failed to update expense");
  }

  const json = (await response.json()) as ExpenseDto;
  return normalizeExpense(json);
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }
}
