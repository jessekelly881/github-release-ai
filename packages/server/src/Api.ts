import { HttpApiBuilder } from "@effect/platform"
import { Api } from "@template/domain/api"
import { Effect, Layer } from "effect"
import { ReleasesAi } from "./services/releasesAi.js"

const RepoApiLive = HttpApiBuilder.group(Api, "repo", (handlers) =>
    Effect.gen(function*() {
        const releasesAi = yield* ReleasesAi
        return handlers
            .handle("queryRepo", ({ path: { owner, repo }, urlParams: { query } }) =>
                Effect.gen(function*() {
                    const aiResponse = yield* releasesAi.query({
                        owner,
                        repo,
                        query,
                        apiKey: ""
                    })
                    return {
                        body: aiResponse.responseText,
                        relevantReleases: aiResponse.relevantReleases
                    }
                }).pipe(Effect.orDie))
    }))

export const ApiLive = HttpApiBuilder.api(Api).pipe(
    Layer.provide(RepoApiLive)
)
