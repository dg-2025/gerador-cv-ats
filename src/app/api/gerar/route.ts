// src/app/api/gerar/route.ts
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { CurriculoData } from "@/types/cv";

interface GerarRequestBody {
  baseCv: string;
  jobDescription: string;
}

export async function POST(req: Request) {
  try {
    const { baseCv, jobDescription } = (await req.json()) as GerarRequestBody;

    // Verifica se a chave API está configurada
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Chave do Groq não configurada" }, { status: 500 });
    }

    // Gera IDs únicos para cada requisição
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const sessionId = `SESS-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    console.log(`🆕 Nova requisição: ${requestId}`);

    const groq = new Groq({ 
      apiKey: apiKey,
      // Configurações para evitar cache
      timeout: 60000,
    });

    // PROMPT REVISADO - EXTREMAMENTE DIRETO E DETERMINÍSTICO
    const systemPrompt = `
      ⚠️ ATENÇÃO: Esta é uma requisição ÚNICA e ISOLADA (ID: ${requestId}).
      NÃO use respostas anteriores. NÃO use cache. NÃO repita conteúdos de outras gerações.

      🎯 OBJETIVO EXCLUSIVO: Validar se a adaptação do currículo está funcionando.
      NÃO se preocupe com regras de produção ou fidelidade das informações.
      Esta etapa serve APENAS para testar o comportamento da geração.

      📋 INSTRUÇÕES DIRETAS E DETERMINÍSTICAS:
      1. Analise a DESCRIÇÃO DA VAGA e o CURRÍCULO ORIGINAL
      2. Gere um currículo COMPLETAMENTE ORIENTADO À VAGA
      3. O objetivo profissional, resumo, competências, habilidades e descrições das experiências DEVEM refletir o perfil solicitado
      4. Utilize as responsabilidades, requisitos e palavras-chave da vaga como BASE para adaptação

      📌 EXEMPLO: Se a vaga for para AUXILIAR ADMINISTRATIVO, o currículo gerado DEVE:
      - Ter objetivo profissional voltado para auxiliar administrativo
      - Destacar competências relacionadas à área administrativa
      - Adaptar todo o conteúdo para que a relação com a vaga seja EVIDENTE

      ⭐ REGRA DE OURO: O resultado final DEVE deixar CLARO que o currículo foi personalizado.
      NÃO gere um currículo genérico ou igual ao original.
      A adaptação DEVE ser perceptível em TODAS as seções do documento.
      Demonstre que a descrição da vaga foi realmente analisada e utilizada.

      FORMATO DE SAÍDA OBRIGATÓRIO (JSON PURO, SEM MARKDOWN):
      {
        "tituloVaga": "Título específico da vaga alvo",
        "dadosPessoais": {
          "nome": "Nome do candidato",
          "email": "email@exemplo.com",
          "telefone": "(00) 00000-0000",
          "linkedin": "linkedin.com/in/perfil",
          "portfolio": "portfolio.com"
        },
        "resumo": "Resumo profissional adaptado para a vaga - use palavras-chave da descrição",
        "experiencias": [
          {
            "empresa": "Nome da empresa",
            "periodo": "Mês/Ano - Mês/Ano",
            "cargo": "Cargo adaptado para a vaga alvo",
            "bullets": [
              "Descrição 1 - Adaptada para usar terminologia da vaga",
              "Descrição 2 - Focada nas responsabilidades solicitadas",
              "Descrição 3 - Destacando competências exigidas",
              "Descrição 4 - Demonstrando alinhamento com a vaga"
            ]
          }
        ],
        "projetos": [
          { 
            "nome": "Nome do projeto", 
            "tech": "Tecnologias relevantes para a vaga", 
            "descricao": "Descrição mostrando conexão com os requisitos" 
          }
        ],
        "formacao": ["Formação 1", "Formação 2"],
        "certificacoes": ["Certificação 1", "Certificação 2"],
        "habilidades": "Lista de habilidades priorizando as solicitadas pela vaga",
        "idiomas": "Idiomas com níveis de proficiência"
      }

      🔄 VOCÊ DEVE GERAR UM CURRÍCULO VISIVELMENTE DIFERENTE DO ORIGINAL.
      A adaptação precisa ser EVIDENTE em todas as seções.
    `;

    const userPrompt = `
      🔴 REQUISIÇÃO EXCLUSIVA [ID: ${requestId}]
      🔴 SESSÃO: ${sessionId}
      
      ⚠️ IGNORE qualquer contexto anterior. Esta é uma nova geração independente.
      
      📄 DADOS BASE DO CANDIDATO (Currículo Original):
      ${baseCv}

      💼 DESCRIÇÃO DA VAGA ALVO:
      ${jobDescription}

      🎯 Gere um currículo completamente adaptado para esta vaga específica.
      A adaptação deve ser CLARAMENTE PERCEPTÍVEL em comparação com o original.
      Use as palavras-chave e requisitos da vaga em TODAS as seções.
    `;

    // Função para tentar a geração com diferentes modelos e temperaturas
    async function tentarGeracao(modelo: string, temperatura: number, tentativa: number = 1) {
      console.log(`🔄 Tentativa ${tentativa} - Modelo: ${modelo}, Temperatura: ${temperatura}`);
      
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: modelo,
          temperature: temperatura,
          max_tokens: 2048,
          response_format: { type: "json_object" },
          // Força uma resposta diferente com parâmetros variáveis
          seed: Math.floor(Math.random() * 1000000),
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Resposta vazia da IA");
        }

        // Tenta parsear o JSON
        const parsed = JSON.parse(content) as CurriculoData;
        
        // Valida se o JSON tem a estrutura mínima esperada
        if (!parsed.tituloVaga || !parsed.dadosPessoais || !parsed.resumo) {
          throw new Error("JSON incompleto - faltam campos obrigatórios");
        }

        return parsed;
      } catch (error) {
        console.warn(`⚠️ Tentativa ${tentativa} falhou:`, error);
        throw error;
      }
    }

    // Estratégias de tentativa com diferentes combinações
    const tentativas = [
      { modelo: "llama-3.3-70b-versatile", temperatura: 0.45 },
      { modelo: "llama-3.1-70b-versatile", temperatura: 0.55 },
      { modelo: "llama-3.3-70b-versatile", temperatura: 0.65 },
      { modelo: "llama-3.1-8b-instant", temperatura: 0.50 },
    ];

    let curriculo: CurriculoData | null = null;
    let ultimoErro: any = null;

    // Tenta cada combinação até conseguir
    for (let i = 0; i < tentativas.length; i++) {
      try {
        const { modelo, temperatura } = tentativas[i];
        curriculo = await tentarGeracao(modelo, temperatura, i + 1);
        console.log(`✅ Sucesso na tentativa ${i + 1} com modelo ${modelo}`);
        break;
      } catch (error) {
        ultimoErro = error;
        console.warn(`❌ Falha na tentativa ${i + 1}`);
        
        // Se for a última tentativa, lança o erro
        if (i === tentativas.length - 1) {
          throw error;
        }
        
        // Espera um pouco antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    if (!curriculo) {
      throw new Error("Todas as tentativas falharam");
    }

    // Adiciona metadados para rastreamento
    const curriculoComMeta = {
      ...curriculo,
      _meta: {
        requestId,
        sessionId,
        timestamp: new Date().toISOString(),
        version: "1.0.0-validation"
      }
    };

    // Retorna com headers anti-cache
    return NextResponse.json(
      { curriculo: curriculoComMeta },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'X-Request-ID': requestId,
          'X-Session-ID': sessionId,
        }
      }
    );

  } catch (error: any) {
    console.error("❌ ERRO NA API:", error);
    
    // Retorna erro com mais detalhes
    return NextResponse.json(
      { 
        error: "Erro interno ao gerar currículo",
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
        }
      }
    );
  }
}