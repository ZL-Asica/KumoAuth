export type ValidationResult =
  | {
      user_id: number
      username: string
      user_role_id: number
      created_at: string
    }
  | { status: 401 | 403 | 404 | 500; error: string }

export type UsernamePatternInterface = {
  minLength: number
  maxLength: number
  charsAllowed: RegExp[]
}
