import React from "react"
import ReactDOM from "react-dom/client"
import { Api } from "@template/domain/api"



const App: React.FC = () => {
    return <h1>Hello, Vite + React!</h1>
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
