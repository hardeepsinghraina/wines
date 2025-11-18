export interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export interface PredefinedResponse {
  id: string
  keywords: string[]
  response: string
  category: string
  priority: number
}