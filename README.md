# Superwall AI App

![Screenshot](./screenshot.png)

Created from Effect Monorepo

```ts
git clone https://github.com/jessekelly881/superwall-project
cd superwall-project
pnpm install
```

## Server

Requires a .env file (in the packages/server directory) with:

```env
OPENAI_API_KEY=
```

Starting the server:

```ts
cd packages/server
pnpm run dev
```

Api Docs: <http://localhost:3000/docs>

Has the effect DevTools layer setup so you can see traces using the "Effect Dev Tools" vscode extension.

## Client

```ts
cd packages/app
pnpm run dev
```

App: <http://localhost:5173/>
