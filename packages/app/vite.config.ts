import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
    plugins: [react()],
    root: ".",
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
