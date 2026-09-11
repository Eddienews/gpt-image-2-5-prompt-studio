# GPT Image 2.5 Prompt Studio

A bilingual, browser-based prompt builder for GPT Image 2.5. It turns visual intent into a structured prompt plus separate API settings for generation, editing, reconstruction, reference remixing, and repair.

**[Try the live demo](https://ember-temple-xsw7.here.now/)**

![GPT Image 2.5 Prompt Studio](https://img.shields.io/badge/GPT_Image_2.5-Prompt_Studio-b9f360?style=for-the-badge&labelColor=09111f)

## What it captures

- Purpose, destination, canvas, subjects, relationships, and appearance
- Exact text as isolated, quoted requirements
- Explicit roles for each reference image
- A target → change → preserve → allow contract for edits
- Hard constraints and a final inspection checklist
- An explainable recommendation between GPT Image 2.5 Flare and Sunburst
- Quality, dimensions, background, output format, and variation count as API settings

The generator runs locally in the browser and does not require an API key.

## Run locally

    npm install
    npm run dev

Open the local URL printed by the development server.

## Verify

    npm test
    npm run lint
    npm run build

## Sources

The implementation follows the official [OpenAI image prompting guide](https://developers.openai.com/api/docs/guides/image-prompting) and model documentation for [GPT Image 2.5 Flare](https://developers.openai.com/api/docs/models/gpt-image-2.5-flare) and [GPT Image 2.5 Sunburst](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst). It also incorporates the supplied field workflow for controlled edits, explicit reference roles, narrow repair passes, and pass/fail inspection.

## License

MIT
