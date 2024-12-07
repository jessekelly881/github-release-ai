import { HttpApiBuilder, HttpApiScalar, HttpMiddleware, HttpServer } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { createServer } from "node:http"
import { ApiLive } from "../src/Api.js"
import { TodosRepository } from "../src/TodosRepository.js"

const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
    HttpServer.withLogAddress,
    Layer.provide(HttpApiScalar.layer({ path: "/docs" })),
    Layer.provide(ApiLive),
    Layer.provide(TodosRepository.Default),
    Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
)

Layer.launch(HttpLive).pipe(
    NodeRuntime.runMain
)
