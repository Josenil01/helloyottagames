# AI Agent Integration Guide

This guide explains how an AI agent can connect to the Hello Yotta Games public API and consume catalog data.

## API Base

- Public domain: https://games.helloyotta.com
- Full catalog endpoint: https://games.helloyotta.com/api/games.json
- Category-grouped endpoint: https://games.helloyotta.com/api/games-by-category.json
- HTTP method: GET
- Authentication: not required
- Response format: application/json

## Recommended Consumption Flow

1. Fetch https://games.helloyotta.com/api/games.json.
2. Validate top-level fields: version, generatedAt, total, games.
3. Validate that games is an array and total matches the array length.
4. For each game, read: slug, title, description, icon, href, url, categories.
5. If you need category navigation, also fetch https://games.helloyotta.com/api/games-by-category.json.

## Expected Contract for games.json

Root object:
- version: string
- generatedAt: string (UTC ISO date)
- total: total number of games
- games: array of game objects

Each item in games:
- slug: stable game identifier
- title: public game name
- description: short description
- icon: game emoji icon
- href: relative path inside the website
- url: absolute game URL
- categories: category list, for example portugues, matematica, logica, novos

## Expected Contract for games-by-category.json

Root object:
- version: string
- generatedAt: string
- totalCategories: number of categories
- totalGames: total number of games
- categories: grouped category array

Each item in categories:
- slug: category identifier
- total: number of games in that category
- games: full game list (same format as games.json)

## Agent Robustness Rules

- If a request fails, retry up to 3 times with short backoff.
- If total does not match list length, treat the response as inconsistent and log a warning.
- If any game has no url, build it with https://games.helloyotta.com + href.
- Handle accents and emojis in UTF-8.
- Do not assume fixed item ordering.

## Example Strategy for End-User Questions

Goal: "show me math games"

Steps:
1. Read games-by-category.json.
2. Find the category whose slug is matematica.
3. Return title, description, icon, and url for each game.

Goal: "which games are new"

Steps:
1. Read games-by-category.json.
2. Find the category whose slug is novos.
3. Return the full list with links.

## Example Response Format the Agent Can Build

For each game:
- Name: title
- Icon: icon
- Description: description
- Link: url
- Categories: categories

## Data Sources

- Base catalog: platform index.html
- Generated catalog file: api/games.json
- Generated category file: api/games-by-category.json
- Automatic generator: scripts/generate-games-api.ps1

## Data Refresh

When new games are added to the catalog, run the API generator to refresh JSON files:

powershell -ExecutionPolicy Bypass -File ./scripts/generate-games-api.ps1

After refresh, the agent can consume new games without changing its reading logic.
