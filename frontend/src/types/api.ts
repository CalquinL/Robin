export interface ApiMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiErrorDetail {
  field: string
  message: string
}

export interface ApiErrorBody {
  code: string
  message: string
  details: ApiErrorDetail[]
}
