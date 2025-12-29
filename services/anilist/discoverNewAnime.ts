import { anilistRequest } from "./anilistClient"

type DiscoverResponse = {
  Page: {
    media: {
      id: number
      updatedAt: number
    }[]
  }
}

const QUERY = `
query DiscoverAnime($page: Int!, $perPage: Int!) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: ID_DESC) {
      id
      updatedAt
    }
  }
}
`

export async function discoverNewAnime(
  page: number,
  perPage: number
) {
  const data = await anilistRequest<DiscoverResponse>(
    QUERY,
    { page, perPage }
  )

  return data.Page.media
}
