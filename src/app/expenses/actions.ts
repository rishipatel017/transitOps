'use server'

import { prisma } from '@/lib/db'
import { expenseSchema, expenseUpdateSchema } from '@/schemas'
import { revalidatePath } from 'next/cache'
import { handleApiError, handleSuccess } from '@/lib/error-handler'

export async function getExpenses() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { date: 'desc' },
    })
    return { success: true, data: expenses }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getExpense(id: string) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        vehicle: true,
      },
    })
    if (!expense) {
      return { error: 'Expense not found' }
    }
    return { success: true, data: expense }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function createExpense(data: unknown) {
  try {
    const validated = expenseSchema.parse(data)
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: validated.vehicleId },
    })
    
    if (!vehicle) {
      return { error: 'Vehicle not found' }
    }
    
    const expense = await prisma.expense.create({
      data: {
        ...validated,
        date: new Date(validated.date),
      },
    })
    
    revalidatePath('/expenses')
    revalidatePath('/dashboard')
    return handleSuccess('Expense created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function updateExpense(id: string, data: unknown) {
  try {
    const validated = expenseUpdateSchema.parse(data)
    
    const expense = await prisma.expense.findUnique({
      where: { id },
    })
    
    if (!expense) {
      return { error: 'Expense not found' }
    }
    
    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...validated,
        date: validated.date ? new Date(validated.date) : undefined,
      },
    })
    
    revalidatePath('/expenses')
    revalidatePath('/dashboard')
    return handleSuccess('Expense updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteExpense(id: string) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
    })
    
    if (!expense) {
      return { error: 'Expense not found' }
    }
    
    await prisma.expense.delete({
      where: { id },
    })
    
    revalidatePath('/expenses')
    revalidatePath('/dashboard')
    return handleSuccess('Expense deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
