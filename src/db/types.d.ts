import type { D1Database } from '@cloudflare/workers-types'

type DBType = D1Database

type User = {
  user_id: number // main key
  username: string
  user_role_id: number // foreign key to UserRole
  password_hash: string
  created_at: string
}

type UserRole = {
  id: number // main key
  role_name: string
  password_rule_id: number // foreign key to PasswordRule
}

type PasswordRule = {
  id: number // main key
  min_length: number
  min_type: number
  require_special: boolean
  require_upper: boolean
  require_number: boolean
  created_at: string
  updated_at: string
}

type UserQueryResult = {
  meta: {
    last_row_id: number
  }
}

export type { DBType, PasswordRule, User, UserQueryResult, UserRole }
