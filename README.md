# URL Shortener

> Simple free-to-use URL shortener that doesn't store any user data and offers a link expiration date.

- [Prerequisites](#Prerequisites)
- [Installation](#Installation)
- [Run](#Run)
- [Configuration](#Configuration)
- [Deployment](#Deployment)

## Prerequisites

- Knowledge of JavaScript/TypeScript, [Next.js](https://nextjs.org/), Git
- IDE ([VS Code](https://code.visualstudio.com/), WebStorm, ...)
- Package manager ([pnpm](https://pnpm.io/installation), npm, ...)

## Installation

- Go to the project folder using `cd url-shortener/`
- Install all dependecies using `pnpm install`
- Copy `.env.example` to `.env` and change the properties

## Run

- Development server: `pnpm run dev`
- Production: `pnpm run build & pnpm run start`

## Configuration

| Description       | Values                 |
| ----------------- | ---------------------- |
| **Ports:**        | 3000                   |
| **Technologies:** | Next.js                |
| **URL:**          | http://localhost:3000/ |

## Deployment

| Description | Values                   |
| ----------- | ------------------------ |
| **Server:** | Coolify                  |
| **URL:**    | https://url.ksprptr.dev/ |
