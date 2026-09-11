'use client';

import {
  Aperture,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Download,
  Gauge,
  Image as ImageIcon,
  Layers3,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  buildImagePrompt,
  DEFAULT_BRIEF,
  type ImageBrief,
  type ImageMode,
  type PromptResult,
} from '@/lib/image-prompt-engine';

type Locale = 'en' | 'pt';

const copy = {
  en: {
    product: 'GPT Image 2.5 Prompt Studio',
    helper: 'Turn visual decisions into prompts you can inspect, test, and repair.',
    brief: 'Visual brief',
    output: 'Compiled prompt',
    mode: 'What are you making?',
    modes: {
      generate: 'New image',
      edit: 'Edit',
      reconstruct: 'Reconstruct',
      remix: 'Combine references',
      repair: 'Repair result',
    },
    starter: 'Start from a proven pattern',
    purpose: 'Purpose',
    purposeHint: 'What should someone understand, feel, or do?',
    useCase: 'Use case',
    canvas: 'Canvas and viewing context',
    contents: 'Subjects and visible content',
    relationships: 'Composition and relationships',
    appearance: 'Appearance, materials, light, and type',
    exactText: 'Exact text',
    exactTextHint: 'One required line per row. Leave blank when the image should contain no text.',
    references: 'Reference roles',
    referencesHint: 'Assign each image a job: identity, layout, subject, material, palette, or finish.',
    editContract: 'Edit contract',
    target: 'Target',
    change: 'Change',
    preserve: 'Preserve',
    allow: 'Allow necessary consequences',
    checks: 'Hard constraints and failure checks',
    settings: 'Model and API settings',
    model: 'Model',
    quality: 'Quality',
    size: 'Size',
    background: 'Background',
    format: 'Format',
    variations: 'Variations',
    promptLanguage: 'Prompt language',
    generate: 'Build prompt',
    regenerate: 'Rebuild prompt',
    copyPrompt: 'Copy prompt',
    copySettings: 'Copy settings',
    download: 'Download',
    copied: 'Copied',
    reset: 'Reset',
    recommended: 'Recommended',
    promptScore: 'Brief coverage',
    checklist: 'Visible decisions captured',
    empty: 'Complete the purpose and visible content to build the prompt.',
    source: 'Built from the official OpenAI GPT Image 2.5 prompting guide and the supplied field workflow.',
    official: 'Official guide',
    flare: 'Fast, high-quality everyday generation',
    sunburst: 'Maximum quality and precise editing',
    auto: 'Let the brief choose',
    apiNote: 'API settings stay separate from the prompt.',
    error: 'Check the brief',
    interfaceLanguage: 'Interface language',
    eyebrow: 'VISUAL SPECIFICATION BUILDER',
    decide: 'Decide',
    decideText: 'what belongs in the image.',
    describe: 'Describe',
    describeText: 'how the parts relate.',
    check: 'Check',
    checkText: 'what survived.',
    useCaseHint: 'Format, audience, or destination',
    textPlaceholder: 'HEADLINE\nSupporting line',
    referencePlaceholder: 'Image 1: product identity. Image 2: layout only.',
    promptLabel: 'IMAGE PROMPT',
    settingsLabel: 'API SETTINGS',
    ready: 'Ready',
    changed: 'Brief changed',
  },
  pt: {
    product: 'GPT Image 2.5 Prompt Studio',
    helper: 'Transforme decisões visuais em prompts que você pode inspecionar, testar e reparar.',
    brief: 'Briefing visual',
    output: 'Prompt compilado',
    mode: 'O que você está criando?',
    modes: {
      generate: 'Nova imagem',
      edit: 'Editar',
      reconstruct: 'Reconstruir',
      remix: 'Combinar referências',
      repair: 'Reparar resultado',
    },
    starter: 'Comece com um padrão comprovado',
    purpose: 'Propósito',
    purposeHint: 'O que alguém deve entender, sentir ou fazer?',
    useCase: 'Caso de uso',
    canvas: 'Tela e contexto de visualização',
    contents: 'Assuntos e conteúdo visível',
    relationships: 'Composição e relações',
    appearance: 'Aparência, materiais, luz e tipografia',
    exactText: 'Texto exato',
    exactTextHint: 'Uma linha obrigatória por linha. Deixe vazio quando a imagem não deve ter texto.',
    references: 'Funções das referências',
    referencesHint: 'Dê um papel a cada imagem: identidade, layout, assunto, material, paleta ou acabamento.',
    editContract: 'Contrato de edição',
    target: 'Alvo',
    change: 'Alterar',
    preserve: 'Preservar',
    allow: 'Permitir consequências necessárias',
    checks: 'Restrições e critérios de falha',
    settings: 'Modelo e configurações da API',
    model: 'Modelo',
    quality: 'Qualidade',
    size: 'Tamanho',
    background: 'Fundo',
    format: 'Formato',
    variations: 'Variações',
    promptLanguage: 'Idioma do prompt',
    generate: 'Criar prompt',
    regenerate: 'Recriar prompt',
    copyPrompt: 'Copiar prompt',
    copySettings: 'Copiar ajustes',
    download: 'Baixar',
    copied: 'Copiado',
    reset: 'Limpar',
    recommended: 'Recomendado',
    promptScore: 'Cobertura do briefing',
    checklist: 'Decisões visuais capturadas',
    empty: 'Preencha o propósito e o conteúdo visível para criar o prompt.',
    source: 'Baseado no guia oficial de prompting do GPT Image 2.5 e no fluxo de campo fornecido.',
    official: 'Guia oficial',
    flare: 'Geração cotidiana rápida e de alta qualidade',
    sunburst: 'Qualidade máxima e edição precisa',
    auto: 'Deixe o briefing escolher',
    apiNote: 'As configurações da API ficam separadas do prompt.',
    error: 'Revise o briefing',
    interfaceLanguage: 'Idioma da interface',
    eyebrow: 'CONSTRUTOR DE ESPECIFICAÇÃO VISUAL',
    decide: 'Decida',
    decideText: 'o que pertence à imagem.',
    describe: 'Descreva',
    describeText: 'como as partes se relacionam.',
    check: 'Verifique',
    checkText: 'o que foi preservado.',
    useCaseHint: 'Formato, público ou destino',
    textPlaceholder: 'TÍTULO\nLinha de apoio',
    referencePlaceholder: 'Imagem 1: identidade do produto. Imagem 2: apenas layout.',
    promptLabel: 'PROMPT DE IMAGEM',
    settingsLabel: 'AJUSTES DA API',
    ready: 'Pronto',
    changed: 'Briefing alterado',
  },
} as const;

const presets: Array<{
  id: string;
  label: { en: string; pt: string };
  patch: Partial<ImageBrief>;
}> = [
  {
    id: 'product',
    label: { en: 'Product shot', pt: 'Foto de produto' },
    patch: {
      mode: 'generate',
      useCase: 'e-commerce product image',
      purpose: 'Create a premium e-commerce product photograph for a new ceramic pour-over coffee maker.',
      canvas: 'Landscape product page hero, readable on desktop and mobile.',
      contents: 'One matte cobalt ceramic dripper and one matching carafe, completely inside the frame, with no additional products.',
      relationships: 'The dripper sits securely on the carafe, centered slightly right, with deliberate empty space on the left for page copy.',
      appearance: 'Tactile matte ceramic, clear glass, soft upper-left studio light, natural contact shadow, restrained cool-gray background, realistic materials.',
      checks: 'Exactly two connected product pieces. No coffee beans, plants, hands, logos, text, floating parts, fake glow, or watermark.',
      size: '1536x1024',
    },
  },
  {
    id: 'ui',
    label: { en: 'UI mockup', pt: 'Mockup de UI' },
    patch: {
      mode: 'generate',
      useCase: 'desktop interface preview',
      purpose: 'Create a credible, shipped-looking desktop dashboard for an independent podcast studio.',
      canvas: 'Front-facing 16:9 desktop interface without browser chrome or device mockups.',
      contents: 'A compact sidebar, episode list, selected episode details, waveform, status, duration, and one primary Publish button.',
      relationships: 'Sidebar on the left, scannable episode list in the center, selected episode details on the right. Publish is the single dominant action.',
      appearance: 'Near-black interface, warm white text, electric coral accent, precise grid, realistic data density, clear typography, no concept-art treatment.',
      exactText: 'Studio Queue\nReady to publish\nPublish',
      checks: 'All text legible. Consistent spacing and controls. No gibberish copy, gradients, floating cards, decorative charts, device frame, or watermark.',
      size: '1536x1024',
      quality: 'high',
    },
  },
  {
    id: 'poster',
    label: { en: 'Poster with type', pt: 'Pôster com texto' },
    patch: {
      mode: 'generate',
      useCase: 'print poster',
      purpose: 'Design a finished exhibition poster that reads clearly from a distance.',
      canvas: 'Portrait 2:3 flat poster, generous safe margins, no wall or frame mockup.',
      contents: 'One folded brushed-aluminum sculpture as the central visual and a compact event information block.',
      relationships: 'Large title in the upper quarter, sculpture in the middle half, event details aligned to the same left margin at the bottom.',
      appearance: 'Pale blue paper, near-black condensed sans-serif type, silver tactile metal, restrained editorial art direction.',
      exactText: 'FORM IN MOTION\n08—24 NOV 2026\nNORTH GALLERY',
      checks: 'Render each line exactly once. No other text, logos, gradients, 3D lettering, ornamental borders, or watermark.',
      size: '1024x1536',
      quality: 'high',
    },
  },
  {
    id: 'edit',
    label: { en: 'Local edit', pt: 'Edição local' },
    patch: {
      mode: 'edit',
      useCase: 'precise product edit',
      purpose: 'Change one product detail while preserving the accepted photograph.',
      canvas: 'Keep the source dimensions, crop, camera position, and aspect ratio.',
      contents: 'Use the supplied product photograph as image 1.',
      relationships: 'Keep the product in its exact position and preserve every surrounding object.',
      appearance: 'Photorealistic integration with the source material, lighting, reflections, and texture.',
      references: 'Image 1 controls product identity, composition, camera, lighting, and background.',
      target: 'The product cap.',
      change: 'Change only the cap color to charcoal black.',
      preserve: 'Cap geometry and texture; product body, label, exact text, camera, crop, background, and every unselected region.',
      allow: 'Cap highlights, reflection, and contact shadow may adjust naturally to the darker color.',
      checks: 'No redesign, new objects, extra text, identity drift, geometry changes, or watermark.',
      model: 'sunburst',
      quality: 'high',
    },
  },
  {
    id: 'diagram',
    label: { en: 'Infographic', pt: 'Infográfico' },
    patch: {
      mode: 'generate',
      useCase: 'educational infographic',
      purpose: 'Explain a four-stage process clearly to a non-technical audience.',
      canvas: 'Portrait 4:5 editorial infographic with generous white space.',
      contents: 'Four numbered stages with one simple icon, one heading, and one short explanatory line per stage.',
      relationships: 'Stages read from top to bottom and connect with one continuous directional path. All icons share one visual system.',
      appearance: 'White background, near-black type, cobalt accents, flat geometric icons, precise alignment, presentation-quality finish.',
      exactText: '01 DISCOVER\n02 DEFINE\n03 CREATE\n04 VERIFY',
      checks: 'Exactly four stages in the correct order. No extra numbers, tiny copy, stock photography, 3D icons, decorative clutter, or watermark.',
      size: '1024x1536',
      quality: 'high',
    },
  },
];

const initialBrief: ImageBrief = {
  ...DEFAULT_BRIEF,
  ...presets[0].patch,
};

const useCases = [
  'product image',
  'advertisement',
  'UI mockup',
  'poster',
  'thumbnail',
  'logo',
  'architecture',
  'portrait',
  'diagram',
  'editorial',
  'custom',
];

const sizes = [
  'auto',
  '1024x1024',
  '1536x1024',
  '1024x1536',
  '2048x2048',
  '2048x1152',
  '3840x2160',
  '2160x3840',
];

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [brief, setBrief] = useState<ImageBrief>(initialBrief);
  const [result, setResult] = useState<PromptResult>(() => buildImagePrompt(initialBrief));
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'prompt' | 'settings' | ''>('');
  const [stale, setStale] = useState(false);
  const t = copy[locale];

  const setField = <K extends keyof ImageBrief>(key: K, value: ImageBrief[K]) => {
    setBrief((current) => ({ ...current, [key]: value }));
    setStale(true);
    setError('');
  };

  const applyPreset = (patch: Partial<ImageBrief>) => {
    const next = { ...DEFAULT_BRIEF, ...patch, promptLanguage: brief.promptLanguage };
    setBrief(next);
    setResult(buildImagePrompt(next));
    setStale(false);
    setError('');
  };

  const generate = () => {
    try {
      setResult(buildImagePrompt(brief));
      setError('');
      setStale(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to build the prompt.');
    }
  };

  const settingsText = useMemo(
    () => JSON.stringify(result.settings, null, 2),
    [result.settings],
  );

  const copyText = async (kind: 'prompt' | 'settings') => {
    await navigator.clipboard.writeText(kind === 'prompt' ? result.prompt : settingsText);
    setCopied(kind);
    window.setTimeout(() => setCopied(''), 1600);
  };

  const download = () => {
    const blob = new Blob(
      [result.prompt, '\n\nAPI SETTINGS\n', settingsText],
      { type: 'text/plain;charset=utf-8' },
    );
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'gpt-image-2-5-prompt.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const reset = () => {
    setBrief(initialBrief);
    setResult(buildImagePrompt(initialBrief));
    setStale(false);
    setError('');
  };

  return (
    <main onKeyDown={(event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        generate();
      }
    }}>
      <header className="site-header">
        <a className="brand" href="#workspace" aria-label={t.product}>
          <span className="brand-mark"><Aperture size={20} /></span>
          <span>
            <strong>Image 2.5</strong>
            <small>Prompt Studio</small>
          </span>
        </a>
        <div className="header-meta">
          <span className="model-pill"><span /> GPT Image 2.5</span>
          <a href="https://developers.openai.com/api/docs/guides/image-prompting" target="_blank" rel="noreferrer">
            {t.official}<ArrowUpRight size={14} />
          </a>
          <div className="language-switch" aria-label={t.interfaceLanguage}>
            {(['en', 'pt'] as Locale[]).map((value) => (
              <button
                key={value}
                className={locale === value ? 'active' : ''}
                onClick={() => setLocale(value)}
              >
                {value.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow"><WandSparkles size={15} /> {t.eyebrow}</p>
          <h1>{t.product}</h1>
          <p>{t.helper}</p>
        </div>
        <div className="principle">
          <span>01</span>
          <p><strong>{t.decide}</strong> {t.decideText}</p>
          <span>02</span>
          <p><strong>{t.describe}</strong> {t.describeText}</p>
          <span>03</span>
          <p><strong>{t.check}</strong> {t.checkText}</p>
        </div>
      </section>

      <section className="workspace" id="workspace">
        <div className="brief-panel">
          <div className="panel-header">
            <div><span>01</span><h2>{t.brief}</h2></div>
            <button className="text-button" onClick={reset}><RotateCcw size={14} />{t.reset}</button>
          </div>

          <fieldset className="mode-field">
            <legend>{t.mode}</legend>
            <div className="mode-grid">
              {(Object.keys(t.modes) as ImageMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={brief.mode === mode ? 'selected' : ''}
                  onClick={() => setField('mode', mode)}
                >
                  {mode === 'generate' && <Sparkles size={15} />}
                  {mode === 'edit' && <ImageIcon size={15} />}
                  {mode === 'reconstruct' && <Layers3 size={15} />}
                  {mode === 'remix' && <Aperture size={15} />}
                  {mode === 'repair' && <ShieldCheck size={15} />}
                  {t.modes[mode]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="preset-row">
            <span>{t.starter}</span>
            <div>
              {presets.map((preset) => (
                <button key={preset.id} onClick={() => applyPreset(preset.patch)}>
                  {preset.label[locale]}
                </button>
              ))}
            </div>
          </div>

          <div className="field-grid two">
            <label className="field">
              <span>{t.purpose}</span>
              <small>{t.purposeHint}</small>
              <textarea
                value={brief.purpose}
                onChange={(event) => setField('purpose', event.target.value)}
                rows={3}
              />
            </label>
            <label className="field">
              <span>{t.useCase}</span>
              <small>{t.useCaseHint}</small>
              <select value={brief.useCase} onChange={(event) => setField('useCase', event.target.value)}>
                {useCases.map((item) => <option key={item}>{item}</option>)}
              </select>
              <span className="mini-label">{t.canvas}</span>
              <textarea
                value={brief.canvas}
                onChange={(event) => setField('canvas', event.target.value)}
                rows={2}
              />
            </label>
          </div>

          <label className="field">
            <span>{t.contents}</span>
            <textarea value={brief.contents} onChange={(event) => setField('contents', event.target.value)} rows={4} />
          </label>

          <label className="field">
            <span>{t.relationships}</span>
            <textarea value={brief.relationships} onChange={(event) => setField('relationships', event.target.value)} rows={3} />
          </label>

          <label className="field">
            <span>{t.appearance}</span>
            <textarea value={brief.appearance} onChange={(event) => setField('appearance', event.target.value)} rows={3} />
          </label>

          <div className="field-grid two">
            <label className="field">
              <span>{t.exactText}</span>
              <small>{t.exactTextHint}</small>
              <textarea value={brief.exactText} onChange={(event) => setField('exactText', event.target.value)} rows={4} placeholder={t.textPlaceholder} />
            </label>
            <label className="field">
              <span>{t.references}</span>
              <small>{t.referencesHint}</small>
              <textarea value={brief.references} onChange={(event) => setField('references', event.target.value)} rows={4} placeholder={t.referencePlaceholder} />
            </label>
          </div>

          {brief.mode !== 'generate' && (
            <details className="edit-contract" open>
              <summary>{t.editContract}<ChevronDown size={16} /></summary>
              <div className="field-grid two">
                {([
                  ['target', t.target],
                  ['change', t.change],
                  ['preserve', t.preserve],
                  ['allow', t.allow],
                ] as const).map(([key, label]) => (
                  <label className="field" key={key}>
                    <span>{label}</span>
                    <textarea value={brief[key]} onChange={(event) => setField(key, event.target.value)} rows={2} />
                  </label>
                ))}
              </div>
            </details>
          )}

          <label className="field">
            <span>{t.checks}</span>
            <textarea value={brief.checks} onChange={(event) => setField('checks', event.target.value)} rows={3} />
          </label>

          <details className="settings" open>
            <summary><span><Gauge size={16} />{t.settings}</span><ChevronDown size={16} /></summary>
            <div className="model-grid">
              {([
                ['auto', t.auto, WandSparkles],
                ['flare', t.flare, Zap],
                ['sunburst', t.sunburst, Sparkles],
              ] as const).map(([value, description, Icon]) => (
                <button
                  key={value}
                  className={brief.model === value ? 'selected' : ''}
                  onClick={() => setField('model', value)}
                >
                  <Icon size={17} />
                  <span><strong>{value === 'auto' ? 'Auto' : value === 'flare' ? 'Flare' : 'Sunburst'}</strong><small>{description}</small></span>
                </button>
              ))}
            </div>
            <div className="settings-grid">
              <label>{t.quality}
                <select value={brief.quality} onChange={(event) => setField('quality', event.target.value as ImageBrief['quality'])}>
                  {['auto', 'low', 'medium', 'high', 'xhigh', 'max'].map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>{t.size}
                <select value={brief.size} onChange={(event) => setField('size', event.target.value)}>
                  {sizes.map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>{t.background}
                <select value={brief.background} onChange={(event) => setField('background', event.target.value as ImageBrief['background'])}>
                  {['auto', 'opaque', 'transparent'].map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>{t.format}
                <select value={brief.outputFormat} onChange={(event) => setField('outputFormat', event.target.value as ImageBrief['outputFormat'])}>
                  {['png', 'webp', 'jpeg'].map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>{t.variations}
                <select value={brief.variations} onChange={(event) => setField('variations', Number(event.target.value))}>
                  {[1, 2, 3, 4].map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>{t.promptLanguage}
                <select value={brief.promptLanguage} onChange={(event) => setField('promptLanguage', event.target.value as ImageBrief['promptLanguage'])}>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </label>
            </div>
            <p className="api-note"><ShieldCheck size={14} />{t.apiNote}</p>
          </details>

          {error && <div className="error-box" role="alert"><strong>{t.error}</strong>{error}</div>}
          <button className="generate-button" onClick={generate}>
            <Sparkles size={18} />
            {stale ? t.regenerate : t.generate}
            <span>⌘ ↵</span>
          </button>
        </div>

        <aside className="output-panel">
          <div className="panel-header">
            <div><span>02</span><h2>{t.output}</h2></div>
            <span className={stale ? 'status stale' : 'status'}><span />{stale ? t.changed : t.ready}</span>
          </div>

          <div className="recommendation">
            <div className="model-orb"><Sparkles size={19} /></div>
            <div>
              <span>{t.recommended}</span>
              <strong>{result.model.replace('gpt-image-2.5-', '').toUpperCase()}</strong>
              <p>{result.recommendation}</p>
            </div>
          </div>

          <div className="score-card">
            <div className="score-label"><span>{t.promptScore}</span><strong>{result.score}%</strong></div>
            <div className="score-track"><span style={{ width: `${result.score}%` }} /></div>
          </div>

          <label className="prompt-box">
            <span>{t.promptLabel}</span>
            <textarea value={result.prompt} onChange={(event) => setResult({ ...result, prompt: event.target.value })} />
          </label>

          <div className="action-grid">
            <button onClick={() => copyText('prompt')} disabled={stale}>
              {copied === 'prompt' ? <Check size={16} /> : <Copy size={16} />}
              {copied === 'prompt' ? t.copied : t.copyPrompt}
            </button>
            <button onClick={download} disabled={stale}><Download size={16} />{t.download}</button>
          </div>

          <div className="settings-output">
            <div>
              <span>{t.settingsLabel}</span>
              <button onClick={() => copyText('settings')} disabled={stale}>
                {copied === 'settings' ? <Check size={14} /> : <Clipboard size={14} />}
                {copied === 'settings' ? t.copied : t.copySettings}
              </button>
            </div>
            <pre>{settingsText}</pre>
          </div>

          <div className="checklist">
            <span>{t.checklist}</span>
            <ul>
              {result.checks.map((item) => <li key={item}><Check size={13} />{item}</li>)}
            </ul>
          </div>
        </aside>
      </section>

      <footer>
        <p>{t.source}</p>
        <a href="https://developers.openai.com/api/docs/guides/image-prompting" target="_blank" rel="noreferrer">
          developers.openai.com <ArrowUpRight size={13} />
        </a>
      </footer>
    </main>
  );
}
