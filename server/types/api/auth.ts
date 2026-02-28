export interface AniOAuthTokenResponse {
  access_token?: string
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
