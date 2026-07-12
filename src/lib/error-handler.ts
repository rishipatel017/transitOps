import { toast } from "sonner"

export function handleApiError(error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    toast.error(error.message || 'An error occurred')
  } else {
    toast.error('An unexpected error occurred')
  }
  
  return { error: error instanceof Error ? error.message : 'An error occurred' }
}

export function handleSuccess(message: string) {
  toast.success(message)
  return { success: true }
}
