import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildImagePrompt,
  DEFAULT_BRIEF,
  recommendModel,
} from '../lib/image-prompt-engine.ts';

const base = {
  ...DEFAULT_BRIEF,
  purpose: 'Create a clear editorial illustration for a feature story.',
  contents: 'One cyclist crossing a bright geometric city intersection.',
  relationships: 'The cyclist is centered while the streets form a precise diagonal grid.',
  appearance: 'Flat paper-cut shapes, crisp edges, cobalt and warm yellow palette.',
  checks: 'Exactly one cyclist. No text, logos, watermarks, or extra vehicles.',
};

test('recommends Flare for straightforward everyday generation', () => {
  const brief = {
    ...base,
    relationships: 'The cyclist is centered while the streets form a clean diagonal grid.',
    checks: 'No text, logos, watermarks, or extra vehicles.',
    quality: 'medium',
  };
  assert.equal(recommendModel(brief), 'flare');

  const result = buildImagePrompt(brief);
  assert.equal(result.model, 'gpt-image-2.5-flare');
  assert.match(result.prompt, /PURPOSE/);
  assert.match(result.prompt, /FINAL CHECK/);
  assert.doesNotMatch(result.prompt, /gpt-image-2\.5-flare/);
  assert.equal(result.settings.model, 'gpt-image-2.5-flare');
});

test('recommends Sunburst and writes a strict edit contract', () => {
  const brief = {
    ...base,
    mode: 'edit',
    exactText: 'NORTH STAR',
    references: 'Image 1 controls identity, crop, and lighting.',
    target: 'The front label.',
    change: 'Replace the headline with the exact supplied text.',
    preserve: 'Product geometry, camera, crop, shadows, and every unselected region.',
    allow: 'Letter spacing may adjust to fit the original label safely.',
  };

  const result = buildImagePrompt(brief);
  assert.equal(result.model, 'gpt-image-2.5-sunburst');
  assert.match(result.prompt, /CHANGE \/ PRESERVE \/ ALLOW/);
  assert.match(result.prompt, /Preserve: Product geometry/);
  assert.match(result.prompt, /"NORTH STAR"/);
  assert.match(result.recommendation, /Sunburst is recommended/);
});

test('keeps API controls separate and uses an alpha-safe format', () => {
  const result = buildImagePrompt({
    ...base,
    background: 'transparent',
    outputFormat: 'jpeg',
    variations: 9,
  });

  assert.equal(result.settings.background, 'transparent');
  assert.equal(result.settings.output_format, 'png');
  assert.equal(result.settings.n, 4);
  assert.doesNotMatch(result.prompt, /output_format|background.*transparent/i);
});

test('rejects unsupported custom dimensions', () => {
  assert.throws(
    () => buildImagePrompt({ ...base, size: '1000x1000' }),
    /multiples of 16/,
  );
});

test('generates Portuguese structure and validation messages', () => {
  const result = buildImagePrompt({
    ...base,
    promptLanguage: 'pt',
    mode: 'repair',
    target: 'A mão direita da pessoa.',
    change: 'Corrigir a anatomia da mão.',
    preserve: 'Rosto, identidade, pose, roupa, câmera, luz e fundo.',
    allow: 'Pequenas mudanças no punho para anatomia natural.',
  });

  assert.match(result.prompt, /PROPÓSITO/);
  assert.match(result.prompt, /VERIFICAÇÃO FINAL/);
  assert.match(result.prompt, /Preservar: Rosto/);

  assert.throws(
    () => buildImagePrompt({ ...base, promptLanguage: 'pt', purpose: '' }),
    /Descreva o que a imagem deve realizar/,
  );
});
