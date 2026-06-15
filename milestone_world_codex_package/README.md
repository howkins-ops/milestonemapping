# Milestone World Codex Package

This package contains the generated RPG-style milestone world concept images, the reusable creation system, Codex build instructions, prompt templates, and an example asset manifest.

## Contents

- `images/` — all generated world map, milestone, completion, final goal, and victory screen image assets from this concept session.
- `docs/MILESTONE_WORLD_CREATION_SYSTEM.md` — reusable instructions for creating future worlds.
- `docs/CODEX_BUILD_PROMPT.md` — direct build prompt for Codex.
- `docs/PROMPT_TEMPLATES_FOR_NEW_WORLDS.md` — prompt templates for generating new biomes/worlds.
- `docs/IMAGE_ASSET_INDEX.md` — suggested crop/rename map.
- `assets_manifest.example.js` — example app manifest for image paths.

## Core Flow

World Map → Enter Milestone World → Complete Milestone / Collect Stone → Back To Updated Map → Repeat → Final Goal → Final Stone Claimed → Mission Complete → Congratulations World Complete.

## Core Concept

A project is a world. A milestone is a location. Completing a milestone means collecting that milestone stone. Once all stones are collected, the final goal unlocks.

Use these images as source/reference assets. Codex should crop them into clean app-ready assets, then recreate real UI text/buttons in JSX over cinematic image backgrounds.
