export type ImageMode = 'generate' | 'edit' | 'reconstruct' | 'remix' | 'repair';
export type ModelChoice = 'auto' | 'flare' | 'sunburst';
export type PromptLanguage = 'en' | 'pt';
export type Quality = 'auto' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';
export type Background = 'auto' | 'opaque' | 'transparent';
export type OutputFormat = 'png' | 'webp' | 'jpeg';

export type ImageBrief = {
  mode: ImageMode;
  useCase: string;
  purpose: string;
  canvas: string;
  contents: string;
  relationships: string;
  appearance: string;
  exactText: string;
  references: string;
  target: string;
  change: string;
  preserve: string;
  allow: string;
  checks: string;
  model: ModelChoice;
  quality: Quality;
  size: string;
  background: Background;
  outputFormat: OutputFormat;
  variations: number;
  promptLanguage: PromptLanguage;
};

export type PromptResult = {
  prompt: string;
  model: 'gpt-image-2.5-flare' | 'gpt-image-2.5-sunburst';
  recommendation: string;
  settings: {
    model: string;
    quality: Quality;
    size: string;
    background: Background;
    output_format: OutputFormat;
    n: number;
  };
  checks: string[];
  score: number;
};

export const DEFAULT_BRIEF: ImageBrief = {
  mode: 'generate',
  useCase: 'custom',
  purpose: '',
  canvas: '',
  contents: '',
  relationships: '',
  appearance: '',
  exactText: '',
  references: '',
  target: '',
  change: '',
  preserve: '',
  allow: '',
  checks: '',
  model: 'auto',
  quality: 'auto',
  size: '1536x1024',
  background: 'auto',
  outputFormat: 'png',
  variations: 1,
  promptLanguage: 'en',
};

const clean = (value: string) => value.trim().replace(/\r\n/g, '\n');
const quoteLines = (value: string) =>
  clean(value)
    .split('\n')
    .filter(Boolean)
    .map((line) => `"${line.replace(/^["“]|["”]$/g, '')}"`)
    .join('\n');

export function recommendModel(brief: ImageBrief) {
  const demanding =
    brief.mode !== 'generate' ||
    Boolean(clean(brief.references)) ||
    Boolean(clean(brief.exactText)) ||
    /identity|precise|preserv|diagram|infographic|interface|typography/i.test(
      [
        brief.purpose,
        brief.contents,
        brief.relationships,
        brief.preserve,
      ].join(' '),
    ) ||
    ['high', 'xhigh', 'max'].includes(brief.quality);

  return demanding ? 'sunburst' : 'flare';
}

function validateSize(size: string) {
  if (size === 'auto') return;
  const match = size.match(/^(\d+)x(\d+)$/);
  if (!match) throw new Error('Use auto or WIDTHxHEIGHT for the image size.');
  const width = Number(match[1]);
  const height = Number(match[2]);
  const pixels = width * height;
  if (
    width > 3840 ||
    height > 3840 ||
    width % 16 !== 0 ||
    height % 16 !== 0 ||
    Math.max(width, height) / Math.min(width, height) > 3 ||
    pixels < 655360 ||
    pixels > 8294400
  ) {
    throw new Error(
      'Custom dimensions must use multiples of 16, stay within 3,840 px per edge and a 3:1 ratio, and contain 655,360–8,294,400 pixels.',
    );
  }
}

const modeLead = {
  en: {
    generate: 'Create a new image from this specification.',
    edit: 'Edit the supplied source image according to this specification.',
    reconstruct:
      'Reconstruct the supplied image as a new render. Match only what is visible or explicitly specified; treat hidden details as new design decisions.',
    remix:
      'Create a new image by combining the assigned roles from the supplied references.',
    repair:
      'Repair the best accepted image with the smallest change that resolves the diagnosed failure.',
  },
  pt: {
    generate: 'Crie uma nova imagem a partir desta especificação.',
    edit: 'Edite a imagem de origem fornecida de acordo com esta especificação.',
    reconstruct:
      'Reconstrua a imagem fornecida como uma nova renderização. Corresponda apenas ao que está visível ou explicitamente especificado; trate detalhes ocultos como novas decisões de design.',
    remix:
      'Crie uma nova imagem combinando as funções atribuídas às referências fornecidas.',
    repair:
      'Repare a melhor imagem aceita com a menor alteração que resolva a falha diagnosticada.',
  },
} as const;

const labels = {
  en: {
    purpose: 'PURPOSE',
    canvas: 'CANVAS',
    contents: 'SUBJECTS AND CONTENT',
    relationships: 'COMPOSITION AND RELATIONSHIPS',
    references: 'REFERENCE ROLES',
    edit: 'CHANGE / PRESERVE / ALLOW',
    appearance: 'APPEARANCE',
    text: 'EXACT TEXT',
    constraints: 'CONSTRAINTS',
    finish: 'FINAL CHECK',
  },
  pt: {
    purpose: 'PROPÓSITO',
    canvas: 'TELA',
    contents: 'ASSUNTOS E CONTEÚDO',
    relationships: 'COMPOSIÇÃO E RELAÇÕES',
    references: 'FUNÇÕES DAS REFERÊNCIAS',
    edit: 'ALTERAR / PRESERVAR / PERMITIR',
    appearance: 'APARÊNCIA',
    text: 'TEXTO EXATO',
    constraints: 'RESTRIÇÕES',
    finish: 'VERIFICAÇÃO FINAL',
  },
} as const;

function section(title: string, body: string) {
  return body ? `${title}\n${body}` : '';
}

export function buildImagePrompt(brief: ImageBrief): PromptResult {
  const purpose = clean(brief.purpose);
  const contents = clean(brief.contents);
  if (purpose.length < 10) {
    throw new Error(
      brief.promptLanguage === 'pt'
        ? 'Descreva o que a imagem deve realizar em pelo menos 10 caracteres.'
        : 'Describe what the image should accomplish in at least 10 characters.',
    );
  }
  if (contents.length < 10) {
    throw new Error(
      brief.promptLanguage === 'pt'
        ? 'Descreva os assuntos ou o conteúdo visível em pelo menos 10 caracteres.'
        : 'Describe the visible subjects or content in at least 10 characters.',
    );
  }
  validateSize(brief.size);

  const language = brief.promptLanguage;
  const t = labels[language];
  const recommended = recommendModel(brief);
  const selected = brief.model === 'auto' ? recommended : brief.model;
  const model =
    selected === 'sunburst'
      ? 'gpt-image-2.5-sunburst'
      : 'gpt-image-2.5-flare';

  const editParts =
    brief.mode === 'generate'
      ? ''
      : [
          clean(brief.target) &&
            `${language === 'en' ? 'Target' : 'Alvo'}: ${clean(brief.target)}`,
          clean(brief.change) &&
            `${language === 'en' ? 'Change' : 'Alterar'}: ${clean(brief.change)}`,
          clean(brief.preserve) &&
            `${language === 'en' ? 'Preserve' : 'Preservar'}: ${clean(brief.preserve)}`,
          clean(brief.allow) &&
            `${language === 'en' ? 'Allow' : 'Permitir'}: ${clean(brief.allow)}`,
        ]
          .filter(Boolean)
          .join('\n');

  const textBlock = clean(brief.exactText)
    ? language === 'en'
      ? `Render the following text exactly as written, with no extra copy:\n${quoteLines(brief.exactText)}\nSpecify it once unless the composition explicitly requires repetition. Keep every character legible.`
      : `Renderize o texto abaixo exatamente como escrito, sem conteúdo adicional:\n${quoteLines(brief.exactText)}\nUse-o uma vez, salvo quando a composição exigir repetição. Mantenha todos os caracteres legíveis.`
    : language === 'en'
      ? 'Do not add text, lettering, logos, labels, or watermarks unless explicitly requested above.'
      : 'Não adicione texto, letras, logotipos, rótulos ou marcas-d’água, salvo quando solicitado acima.';

  const finish =
    language === 'en'
      ? `Before returning the final image, inspect every required object, relationship, protected detail, and exact text item. Treat each as pass, fail, or uncertain. Preserve a clean source for later edits. Return only the finished image.`
      : `Antes de retornar a imagem final, inspecione cada objeto obrigatório, relação, detalhe protegido e texto exato. Trate cada item como aprovado, reprovado ou incerto. Preserve uma fonte limpa para edições posteriores. Retorne apenas a imagem final.`;

  const prompt = [
    modeLead[language][brief.mode],
    section(t.purpose, purpose),
    section(
      t.canvas,
      [
        clean(brief.canvas),
        language === 'en'
          ? `Output size: ${brief.size}. Intended use: ${brief.useCase}.`
          : `Tamanho de saída: ${brief.size}. Uso pretendido: ${brief.useCase}.`,
      ]
        .filter(Boolean)
        .join('\n'),
    ),
    section(t.contents, contents),
    section(t.relationships, clean(brief.relationships)),
    section(t.references, clean(brief.references)),
    section(t.edit, editParts),
    section(t.appearance, clean(brief.appearance)),
    section(t.text, textBlock),
    section(t.constraints, clean(brief.checks)),
    section(t.finish, finish),
  ]
    .filter(Boolean)
    .join('\n\n');

  const checks = [
    purpose && (language === 'en' ? 'Purpose is explicit' : 'Propósito explícito'),
    contents && (language === 'en' ? 'Visible content is defined' : 'Conteúdo visível definido'),
    clean(brief.relationships) &&
      (language === 'en' ? 'Relationships are inspectable' : 'Relações verificáveis'),
    clean(brief.appearance) &&
      (language === 'en' ? 'Appearance uses visible details' : 'Aparência usa detalhes visíveis'),
    clean(brief.exactText) &&
      (language === 'en' ? 'Exact copy is isolated' : 'Texto exato isolado'),
    brief.mode !== 'generate' &&
      clean(brief.preserve) &&
      (language === 'en' ? 'Protected details are named' : 'Detalhes protegidos nomeados'),
    clean(brief.checks) &&
      (language === 'en' ? 'Failure checks are defined' : 'Critérios de falha definidos'),
  ].filter(Boolean) as string[];

  const score = Math.min(
    100,
    35 +
      (clean(brief.relationships) ? 15 : 0) +
      (clean(brief.appearance) ? 15 : 0) +
      (clean(brief.checks) ? 15 : 0) +
      (clean(brief.exactText) ? 10 : 0) +
      (brief.mode !== 'generate' && clean(brief.preserve) ? 10 : 0),
  );

  const recommendation =
    recommended === 'sunburst'
      ? language === 'en'
        ? 'Sunburst is recommended because this brief emphasizes precision, editing, preservation, or exact text.'
        : 'Sunburst é recomendado porque este briefing enfatiza precisão, edição, preservação ou texto exato.'
      : language === 'en'
        ? 'Flare is recommended for fast, high-quality everyday generation. Test Sunburst if quality requirements are not met.'
        : 'Flare é recomendado para geração cotidiana rápida e de alta qualidade. Teste Sunburst se os requisitos de qualidade não forem atendidos.';

  return {
    prompt,
    model,
    recommendation,
    settings: {
      model,
      quality: brief.quality,
      size: brief.size,
      background: brief.background,
      output_format:
        brief.background === 'transparent' && brief.outputFormat === 'jpeg'
          ? 'png'
          : brief.outputFormat,
      n: Math.max(1, Math.min(4, brief.variations)),
    },
    checks,
    score,
  };
}
