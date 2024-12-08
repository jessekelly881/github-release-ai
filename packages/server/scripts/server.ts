import { config } from "@dotenvx/dotenvx"
import { OpenAiClient, OpenAiCompletions } from "@effect/ai-openai"
import { DevTools } from "@effect/experimental"
import * as Lmdb from "@effect/experimental/Persistence/Lmdb"
import { FetchHttpClient, HttpApiBuilder, HttpApiScalar, HttpMiddleware, HttpServer } from "@effect/platform"
import { NodeContext, NodeHttpServer, NodeRuntime, NodeSocket } from "@effect/platform-node"
import { Config, Effect, Layer } from "effect"
import { createServer } from "http"
import { ApiLive } from "../src/Api.js"
import { Github } from "../src/services/github.js"
import { ReleasesAi } from "../src/services/releasesAi.js"

config()

const PlatformLive = Layer.merge(
    NodeContext.layer,
    NodeSocket.layerWebSocketConstructor
)

const CompletionsLive = OpenAiCompletions.layerCompletions({ model: "gpt-4o-mini" }).pipe(
    Layer.provide(OpenAiClient.layerConfig({ apiKey: Config.redacted("OPENAI_API_KEY") })),
    Layer.provide(FetchHttpClient.layer)
)

const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
    Layer.provide(HttpApiBuilder.middlewareCors()),
    HttpServer.withLogAddress,
    Layer.provide(HttpApiScalar.layer({ path: "/docs" })),
    Layer.provide(ApiLive),
    Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
)

HttpLive.pipe(
    Layer.provide(Github.Default),
    Layer.provide(ReleasesAi.Default),
    Layer.provide(CompletionsLive),
    Layer.launch,
    Effect.provide(DevTools.layerWebSocket()),
    Effect.provide(Lmdb.layerResult({ path: "./.cache" })),
    Effect.provide(PlatformLive),
    NodeRuntime.runMain
)
