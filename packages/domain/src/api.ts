import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

export const QueryResponse = Schema.Struct({})

export const Query = Schema.Struct({
    owner: Schema.String,
    repo: Schema.String,
    apiKey: Schema.optional(Schema.RedactedFromSelf(Schema.String)),
    query: Schema.String
})

export class RepoApiGroup extends HttpApiGroup.make("repo")
    .add(HttpApiEndpoint.get("queryRepo", "/query/:owner/:repo").addSuccess(QueryResponse))
{}

export class Api extends HttpApi.empty.add(RepoApiGroup) {}
