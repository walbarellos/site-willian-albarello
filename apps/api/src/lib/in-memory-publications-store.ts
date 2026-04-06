export type StoreEditorialStatus =
  | 'draft'
  | 'review'
  | 'ready_to_publish'
  | 'published'
  | 'archived';

export type StoreCategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type StoreTagRef = {
  id: string;
  name: string;
  slug: string;
};

export type StoreSeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
};

export type StorePublicationRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: StoreEditorialStatus;
  categoryId?: string | null;
  tagIds: string[];
  category?: StoreCategoryRef | null;
  tags: StoreTagRef[];
  seo?: StoreSeoFields;
  publishedAt?: string | null;
  updatedAt?: string;
  readingTimeMinutes?: number | null;
};

export type InMemoryPublicationsStore = {
  categories: StoreCategoryRef[];
  tags: StoreTagRef[];
  records: Map<string, StorePublicationRecord>;
};

const STORE_KEY = '__WA_IN_MEMORY_PUBLICATIONS_STORE__';

function buildSeedStore(): InMemoryPublicationsStore {
  const artigosCategory: StoreCategoryRef = {
    id: 'cat-001',
    name: 'Artigos',
    slug: 'artigos',
  };

  const governancaCategory: StoreCategoryRef = {
    id: 'cat-002',
    name: 'Governança',
    slug: 'governanca',
  };

  const institucionalTag: StoreTagRef = {
    id: 'tag-001',
    name: 'Institucional',
    slug: 'institucional',
  };

  const estrategiaTag: StoreTagRef = {
    id: 'tag-002',
    name: 'Estratégia',
    slug: 'estrategia',
  };

  const editorialTag: StoreTagRef = {
    id: 'tag-003',
    name: 'Editorial',
    slug: 'editorial',
  };

  const categories: StoreCategoryRef[] = [artigosCategory, governancaCategory];
  const tags: StoreTagRef[] = [institucionalTag, estrategiaTag, editorialTag];
  const records = new Map<string, StorePublicationRecord>();

  records.set('pub-001', {
    id: 'pub-001',
    title: 'A inteligência relacional como eixo de presença institucional',
    slug: 'inteligencia-relacional-eixo-presenca-institucional',
    summary:
      'Como transformar presença digital em confiança pública: menos ruído visual, mais clareza estratégica e consistência editorial.',
    content: `## Presença pública não é volume, é direção
Uma presença institucional forte não nasce de excesso de posts, nem de layout barulhento. Ela nasce de um eixo editorial claro: o que publicar, por que publicar e como sustentar continuidade sem improviso.

> Autoridade pública se constrói por consistência, não por explosão de conteúdo.

## O que a inteligência relacional resolve
A inteligência relacional conecta mensagem, publicação e experiência de leitura. Isso significa que o leitor entra no site, entende a proposta em segundos e encontra conteúdos organizados para navegar sem fricção.

![Leitura editorial com foco em clareza](https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80){w=54}

## Três critérios práticos para não perder qualidade
- Publicar apenas o que está pronto para ser público.
- Manter padrão visual e ritmo de leitura em todas as publicações.
- Evitar mudanças aleatórias que desalinham a narrativa institucional.

Quando esses três critérios são respeitados, cada novo conteúdo reforça reputação em vez de gerar ruído.

## Conclusão
O objetivo não é parecer moderno por efeito visual. O objetivo é criar legibilidade pública, previsibilidade editorial e percepção de competência institucional.`,
    status: 'published',
    categoryId: artigosCategory.id,
    tagIds: [institucionalTag.id, estrategiaTag.id],
    category: artigosCategory,
    tags: [institucionalTag, estrategiaTag],
    seo: {
      metaTitle:
        'A inteligência relacional como eixo de presença institucional',
      metaDescription:
        'Introdução pública ao posicionamento institucional do projeto.',
    },
    publishedAt: '2026-04-01T12:00:00.000Z',
    updatedAt: '2026-04-01T12:00:00.000Z',
    readingTimeMinutes: 4,
  });

  records.set('pub-002', {
    id: 'pub-002',
    title: 'Fluxo editorial, clareza pública e consistência de publicação',
    slug: 'fluxo-editorial-clareza-publica-consistencia-publicacao',
    summary:
      'Um fluxo editorial bem definido reduz retrabalho, evita ruído e aumenta a confiança de quem lê.',
    content: `## Publicar sem método degrada a percepção
Quando cada publicação nasce de um processo diferente, a leitura perde ritmo e o site parece inconsistente. O leitor sente isso mesmo sem conseguir explicar tecnicamente.

## Fluxo mínimo de qualidade
- Rascunho com tese clara.
- Revisão para corte de ruído.
- Ajuste de leitura (título, subtítulo, escaneabilidade).
- Revisão de SEO público.
- Publicação somente após validação final.

## O que muda para o leitor
O leitor não vê o bastidor, mas percebe o resultado: texto mais claro, mídia no contexto certo e estrutura que favorece entendimento rápido.

![Fluxo editorial disciplinado](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80){w=52}

## Continuidade e escala
Com fluxo editorial disciplinado, publicar três textos ou trezentos segue o mesmo padrão. Isso é o que permite escalar presença sem perder qualidade.`,
    status: 'published',
    categoryId: governancaCategory.id,
    tagIds: [editorialTag.id],
    category: governancaCategory,
    tags: [editorialTag],
    seo: {
      metaTitle:
        'Fluxo editorial, clareza pública e consistência de publicação',
      metaDescription:
        'Como a governança editorial sustenta qualidade e consistência.',
    },
    publishedAt: '2026-04-03T10:30:00.000Z',
    updatedAt: '2026-04-03T10:30:00.000Z',
    readingTimeMinutes: 5,
  });

  records.set('pub-003', {
    id: 'pub-003',
    title: 'Teste salvar agora 2',
    slug: 'teste-salvar-agora-2',
    summary:
      'Publicação de demonstração com texto real, imagem contextual e estrutura de leitura para validar a experiência da página.',
    content: `## Cenário de validação da experiência
Esta publicação existe para demonstrar leitura real no frontend público. O foco não é o tema em si, e sim comprovar que a página sustenta boa experiência com texto, seções e mídia.

## Blocos que um leitor precisa encontrar
- Contexto rápido no topo.
- Título forte e fácil de escanear.
- Corpo com largura confortável.
- Imagem que não estoura o layout.
- Fechamento com próxima ação clara.

## Exemplo de mídia integrada
![Demonstração de publicação com imagem e texto](https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=80){w=50}

## Fechamento
Se esta página estiver legível em desktop e mobile, com ritmo visual coerente e sem “caixas brigando”, então a experiência do leitor está no caminho certo.`,
    status: 'published',
    categoryId: artigosCategory.id,
    tagIds: [institucionalTag.id, editorialTag.id],
    category: artigosCategory,
    tags: [institucionalTag, editorialTag],
    seo: {
      metaTitle: 'Teste salvar agora 2',
      metaDescription:
        'Publicação de demonstração para validar a experiência de leitura no site público.',
    },
    publishedAt: '2026-04-05T13:10:00.000Z',
    updatedAt: '2026-04-05T13:10:00.000Z',
    readingTimeMinutes: 3,
  });

  return { categories, tags, records };
}

export function getInMemoryPublicationsStore(): InMemoryPublicationsStore {
  const globalObj = globalThis as typeof globalThis & {
    [STORE_KEY]?: InMemoryPublicationsStore;
  };

  if (!globalObj[STORE_KEY]) {
    globalObj[STORE_KEY] = buildSeedStore();
  }

  return globalObj[STORE_KEY] as InMemoryPublicationsStore;
}
