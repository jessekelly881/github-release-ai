import { HttpApiBuilder } from "@effect/platform"
import { Api, QueryResponse } from "@template/domain/api"
import { Effect, Layer } from "effect"
import { Github } from "./services/github.js"

const RepoApiLive = HttpApiBuilder.group(Api, "repo", (handlers) =>
    Effect.gen(function*() {
        const github = yield* Github
        return handlers
            .handle("queryRepo", () => Effect.succeed(QueryResponse.make({})))
    }))

export const ApiLive = HttpApiBuilder.api(Api).pipe(
    Layer.provide(RepoApiLive)
)
