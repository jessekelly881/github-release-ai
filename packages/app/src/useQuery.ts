import { Rx, useRx } from "@effect-rx/rx-react"
import { FetchHttpClient, HttpApiClient } from "@effect/platform"
import { Effect } from "effect"
import "reset.css"
import { Api } from "../../domain/src/api.js"
import "./style.css"

const Client = HttpApiClient.make(Api, {
    baseUrl: "http://localhost:3000"
})

export interface Query {
    owner: string
    repo: string
    apiKey?: string
    query: string
}

/**
 * @internal
 */
const queryReleases = (query: Query) =>
    Effect.flatMap(Client, (client) =>
        client.repo.queryRepo({
            path: { owner: query.owner, repo: query.repo },
            urlParams: { query: "" },
            headers: query.apiKey ? { "X-GITHUB-TOKEN": query.apiKey } : {}
        })).pipe(
            Effect.provide(FetchHttpClient.layer)
        )

const queryReleaseRx = Rx.fn(queryReleases)
export const useQuery = () => useRx(queryReleaseRx)
