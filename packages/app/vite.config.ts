import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
    plugins: [react()],
    root: ".",
    build: {
        rollupOptions: {
            external: ["multipasta", "fast-check", "find-my-way-ts"]
        }
    },
    optimizeDeps: {
        exclude: ["multipasta", "fast-check", "find-my-way-ts"] // Exclude dependencies from pre-bundling
    },
    resolve: {
        preserveSymlinks: true, // Ensure Vite resolves symlinked dependencies
        alias: {
            "@template/domain": path.resolve(__dirname, "../packages/domain/src")
        }
    },
    server: {
        fs: {
            allow: [".."] // Allow access to parent directories in the monorepo
        }
    }
})
