import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

export const QueryResponse = Schema.Struct({
    body: Schema.String,
    relevantReleases: Schema.Array(Schema.Struct({
        tagName: Schema.String,
        name: Schema.String,
        url: Schema.String
    }))
})

export class RepoApiGroup extends HttpApiGroup.make("repo")
    .add(
        HttpApiEndpoint.get("queryRepo", "/query/:owner/:repo")
            .addSuccess(QueryResponse)
            .setPath(Schema.Struct({ owner: Schema.String, repo: Schema.String }))
            .setUrlParams(Schema.Struct({ query: Schema.String }))
            .setHeaders(Schema.Struct({ "X-GITHUB-TOKEN": Schema.optional(Schema.String) }))
    )
{}

export class Api extends HttpApi.empty.add(RepoApiGroup) {}
