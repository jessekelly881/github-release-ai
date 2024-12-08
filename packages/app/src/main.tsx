import * as Form from "@radix-ui/react-form"
import { Option } from "effect"
import { marked } from "marked"
import React from "react"
import ReactDOM from "react-dom/client"
import "reset.css"
import "./style.css"
import { useQuery } from "./useQuery.js"

/**
 * Parse a GitHub URL into an owner and repo name.
 * @since 1.0.0
 */
export function parseGithubUrl(url: string): Option.Option<{ owner: string; repo: string }> {
    const match = url.match(
        /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/
    )
    if (!match || !(match.groups?.owner && match.groups?.name)) return Option.none()
    return Option.some({ owner: match.groups.owner, repo: match.groups.name })
}

const App: React.FC = () => {
    const [result, query] = useQuery()

    return (
        <div>
            <Form.Root
                className="FormRoot"
                onSubmit={(event) => {
                    const data: { url: string; apiKey: string; query: string } = Object.fromEntries(
                        new FormData(event.currentTarget)
                    ) as any

                    const parsedUrlOption = parseGithubUrl(data.url)
                    alert(parsedUrlOption._tag)
                    if (Option.isNone(parsedUrlOption)) {
                        alert("Invalid Github URL")
                        return event.preventDefault()
                    }

                    const { owner, repo } = parsedUrlOption.value

                    alert("Running query...")
                    query({
                        owner,
                        repo,
                        query: data.query,
                        apiKey: data.apiKey
                    })

                    return event.preventDefault()
                }}
            >
                <h1>Query Project Releases with AI</h1>
                <Form.Field className="FormField" name="url">
                    <Form.Label className="FormLabel">Github Url</Form.Label>
                    <input required type="text" placeholder="github.com/Effect-TS/effect" />
                </Form.Field>
                <Form.Field className="FormField" name="apiKey">
                    <Form.Label className="FormLabel">Api Key (required for private repos)</Form.Label>
                    <input
                        type="password"
                        placeholder="sk-proj-zrNiwy8EOsagQkhH3F7CYds..."
                    />
                </Form.Field>
                <Form.Field className="FormField" name="query">
                    <Form.Label className="FormLabel">AI Query</Form.Label>
                    <textarea required placeholder="What's the coolest release in the last month?" />
                </Form.Field>
                <Form.Submit asChild>
                    <button disabled={result.waiting} className="Button" style={{ marginTop: 10 }}>
                        {result.waiting ? "Running query..." : "Run Query"}
                    </button>
                </Form.Submit>
            </Form.Root>
            <br />
            {result._tag === "Success" && (
                <pre
                    className="ResultBody"
                    dangerouslySetInnerHTML={{ "__html": marked(result.value.body, { async: false }) }}
                />
            )}
        </div>
    )
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
