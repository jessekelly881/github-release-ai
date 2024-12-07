import { config } from "@dotenvx/dotenvx"
import { AiChat } from "@effect/ai"
import { Effect, Schema } from "effect"
import { Github } from "./github.js"

config()

class ResponseStructure extends Schema.Class<ResponseStructure>("ResponseStructure")(
    {
        responseText: Schema.String.annotations({
            description: "The response text to the users query"
        }),
        relevantReleases: Schema.Array(Schema.Struct({
            tagName: Schema.String,
            name: Schema.String,
            url: Schema.String.annotations({ description: "The html url of the release" })
        })).annotations({
            description:
                "An short array of releases most relevant to the users query. They should be the exact same releases as mentioned in the response text, no more, no less"
        })
    },
    {
        description: "The response text along with a minimal array of releases most relevant to the users query"
    }
) {}

interface QueryOptions {
    owner: string
    repo: string
    query: string
    apiKey?: string
}

export class ReleasesAi extends Effect.Service<ReleasesAi>()("@/ReleasesAi", {
    dependencies: [Github.Default],
    accessors: true,
    effect: Effect.gen(function*() {
        const gh = yield* Github

        return {
            query: (options: QueryOptions) =>
                Effect.gen(function*() {
                    const releases = yield* gh.getReleases(options.owner, options.repo)
                    const chat = yield* AiChat.fromInput(JSON.stringify(releases))
                    return yield* chat.structured(ResponseStructure, options.query)
                })
        }
    })
}) {}
