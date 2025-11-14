export type Account = {
  account_id: string
  email: string
  password: string
  events: string[] | null
  created_at: Date
  verified_at: Date | null
}