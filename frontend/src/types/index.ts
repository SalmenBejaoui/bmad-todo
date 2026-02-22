export interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  userId: string | null
  createdAt: string
  doneAt: string | null
  updatedAt: string
  deletedAt: string | null
}

export interface ApiErrorResponse {
  error: string
  code?: string
}
