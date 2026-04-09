export interface AniOAuthTokenResponse {
  access_token?: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
}

export interface AniViewerNameResponse {
  data?: {
    Viewer?: {
      name?: string | null
    } | null
  }
}

export interface AniViewerIdResponse {
  data?: {
    Viewer?: {
      id?: number | null
    } | null
  }
}
