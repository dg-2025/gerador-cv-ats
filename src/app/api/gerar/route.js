import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { baseCv, jobDescription } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Chave do Groq faltando" }, { status: 500 });
    }

    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `
      Você é um Tech Recruiter Sênior e Especialista em Algoritmos de ATS (Applicant Tracking Systems).
      Sua missão é processar as informações brutas de um candidato e transformá-las em um currículo extremamente rico, denso e focado em aprovação de triagem automática.

      DIRETRIZES DE CONTEÚDO (MÉTODO XYZ E DENSIDADE DE PALAVRAS-CHAVE):
      1. VOLUME E DENSIDADE: Escreva descrições completas e robustas. O currículo deve ser denso em informações úteis. Não economize em detalhes técnicos, metodologias e ferramentas.
      2. FOCO EM RESULTADOS: Transforme tarefas em conquistas ("Liderou a refatoração do sistema utilizando React e Node.js, reduzindo o tempo de carregamento em 40% e escalando para mais de 10 mil usuários simultâneos").
      3. VOCABULÁRIO TÉCNICO ATS: Incorpore ativamente termos altamente buscados no mercado atual (ex: Clean Code, CI/CD, AWS, Escalabilidade, Micro-frontends, Performance, Testes Automatizados, Metodologias Ágeis).
      4. TOM PROFISSIONAL IMPLÍCITO: Use verbos de ação fortes (Arquitetou, Desenvolveu, Otimizou). Proibido usar "Eu" ou terceira pessoa.

      ESTRUTURA OBRIGATÓRIA (JSON PURO, SEM MARKDOWN):
      Mantenha exatamente estas chaves. Você tem liberdade para criar textos longos nos valores.
      {
        "tituloVaga": "Nome Estratégico da Vaga",
        "dadosPessoais": { "nome": "", "email": "", "telefone": "", "linkedin": "", "portfolio": "" },
        "resumo": "Um parágrafo profundo e denso, com pelo menos 4 a 5 frases, destacando o perfil completo do candidato, principais stacks dominadas, tempo de experiência e o valor de negócio que ele entrega nas empresas.",
        "experiencias": [
          {
            "empresa": "Nome",
            "periodo": "Data",
            "cargo": "Cargo",
            "bullets": [
              "Bullet 1: Detalhado, com tecnologias usadas e problemas resolvidos.",
              "Bullet 2: Focado em métricas, performance e arquitetura.",
              "Bullet 3: Focado em trabalho em equipe, liderança ou deploy.",
              "Bullet 4: Outra conquista técnica relevante (pode ter até 5 bullets se o candidato tiver muita experiência)."
            ]
          }
        ],
        "projetos": [ { "nome": "", "tech": "", "descricao": "Descrição profunda do projeto" } ],
        "formacao": [ "Lista" ],
        "certificacoes": [ "Lista" ],
        "habilidades": "Lista densa com todas as linguagens, frameworks, cloud, bancos de dados e metodologias que o candidato sabe, separadas por vírgula.",
        "idiomas": "Lista"
      }
    `;

    const userPrompt = `
      DADOS BASE DO CANDIDATO:
      ${baseCv}

      DESCRIÇÃO DA VAGA:
      ${jobDescription}
    `;

    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, 
      response_format: { type: "json_object" } 
    });

    
    const textResponse = chatCompletion.choices[0].message.content;
    const curriculoJson = JSON.parse(textResponse);

    return NextResponse.json({ curriculo: curriculoJson });

  } catch (error) {
    console.error("❌ ERRO NA API (GROQ):", error);
    return NextResponse.json({ error: "Erro interno: " + error.message }, { status: 500 });
  }
}