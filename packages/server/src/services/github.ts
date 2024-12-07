import { PersistedCache } from "@effect/experimental"
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import type { Redacted } from "effect"
import { Effect, flow, PrimaryKey, Schema } from "effect"

/** @internal */
const CacheStoreId = "@/Github"

/**
 * @since 1.0.0
 */
export class Author extends Schema.Class<Author>("Author")({
    login: Schema.String,
    id: Schema.Number,
    avatarUrl: Schema.String.pipe(Schema.propertySignature, Schema.fromKey("avatar_url")),
    url: Schema.String
}) {}

/**
 * @since 1.0.0
 * @see https://api.github.com/repos/Effect-TS/effect/releases/189211645
 */
export class Release extends Schema.Class<Release>("Release")({
    url: Schema.String,
    htmlUrl: Schema.String.pipe(Schema.propertySignature, Schema.fromKey("html_url")),
    id: Schema.Number,
    author: Author,
    tagName: Schema.String.pipe(Schema.propertySignature, Schema.fromKey("tag_name")),
    name: Schema.String,
    body: Schema.String,
    createdAt: Schema.DateTimeUtc.pipe(Schema.propertySignature, Schema.fromKey("created_at")),
    publishedAt: Schema.DateTimeUtc.pipe(Schema.propertySignature, Schema.fromKey("published_at")),
    draft: Schema.Boolean,
    prerelease: Schema.Boolean
}) {}

/** @internal */
const ReleasesApiResponse = Schema.Array(Release)

/**
 * @since 1.0.0
 */
export class RepoNotFound extends Schema.TaggedError<RepoNotFound>()("RepoNotFound", {}) {}

/** @internal */
class ReleasesRequest extends Schema.TaggedRequest<ReleasesRequest>()("ReleasesRequest", {
    failure: RepoNotFound,
    success: ReleasesApiResponse,
    payload: {
        owner: Schema.String,
        repo: Schema.String,
        apiKey: Schema.optional(Schema.RedactedFromSelf(Schema.String))
    }
}) {
    [PrimaryKey.symbol]() {
        return `${this.owner}/${this.repo}` // e.g. effect-ts/effect
    }
}

/** @internal */
const GithubApiClient = HttpClient.HttpClient.pipe(
    Effect.map(HttpClient.filterStatusOk),
    Effect.map(
        HttpClient.mapRequest(
            flow(
                HttpClientRequest.prependUrl(
                    "https://api.github.com"
                ),
                HttpClientRequest.setHeaders({
                    "X-GitHub-Api-Version": "2022-11-28",
                    "Accept": "application/vnd.github+json"
                })
            )
        )
    ),
    Effect.map(HttpClient.transformResponse(Effect.mapError((s) => s.reason === "StatusCode" ? new RepoNotFound() : s)))
)

/**
 * @since 1.0.0
 */
export class Github extends Effect.Service<Github>()("app/Github", {
    accessors: true,
    dependencies: [FetchHttpClient.layer],
    scoped: Effect.gen(function*() {
        const githubApiClient = yield* GithubApiClient
        const cachedReleases = yield* PersistedCache.make({
            storeId: CacheStoreId,
            timeToLive: () => "1 hour",
            lookup: (request: ReleasesRequest) => { // todo! - handle pagination
                const client = request.apiKey ?
                    githubApiClient.pipe(
                        HttpClient.mapRequest(HttpClientRequest.setHeader("Authorization", `Bearer ${request.apiKey}`))
                    )
                    : githubApiClient

                return client.get(`/repos/${request.owner}/${request.repo}/releases`).pipe(
                    Effect.flatMap(HttpClientResponse.schemaBodyJson(ReleasesApiResponse)),
                    Effect.catchTags({ // todo!
                        "ParseError": Effect.die,
                        "RequestError": Effect.die,
                        "ResponseError": Effect.die
                    })
                )
            }
        })

        return {
            /**
             * @since 1.0.0
             */
            getReleases: (owner: string, repo: string, options: { apiKey?: Redacted.Redacted<string> } = {}) =>
                cachedReleases.get(
                    new ReleasesRequest({ owner, repo, apiKey: options.apiKey })
                )
        }
    })
}) {}
