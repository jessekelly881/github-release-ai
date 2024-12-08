import * as Form from "@radix-ui/react-form"
import React from "react"
import ReactDOM from "react-dom/client"
import "reset.css"
import "./style.css"

/**
 * Parse a GitHub URL into an owner and repo name.
 * @since 1.0.0
 */
export function parseGithubUrl(url: string | null) {
    if (!url) return null
    const match = url.match(
        /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/
    )
    if (!match || !(match.groups?.owner && match.groups?.name)) return null
    return { owner: match.groups.owner, repo: match.groups.name }
}

const App: React.FC = () => {
    return (
        <div>
            <Form.Root
                className="FormRoot"
                onSubmit={(event) => {
                    const data = Object.fromEntries(new FormData(event.currentTarget))
                    alert(JSON.stringify(data))
                    return event.preventDefault()
                }}
            >
                <h1>Query Project Releases with AI</h1>
                <Form.Field className="FormField" name="url">
                    <Form.Label className="FormLabel">Github Url</Form.Label>
                    <input required type="text" placeholder="github.com/Effect-TS/effect" />
                </Form.Field>
                <Form.Field className="FormField" name="api-key">
                    <Form.Label className="FormLabel">Api Key</Form.Label>
                    <input
                        type="text"
                        placeholder="sk-proj-zrNiwy8EOsagQkhH3F7CYds..."
                    />
                </Form.Field>
                <Form.Field className="FormField" name="query">
                    <Form.Label className="FormLabel">AI Query</Form.Label>
                    <textarea required placeholder="What's the coolest release in the last month?" />
                </Form.Field>
                <Form.Submit asChild>
                    <button className="Button" style={{ marginTop: 10 }}>
                        Run Query
                    </button>
                </Form.Submit>
            </Form.Root>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
