// src/utils/pdfGenerator.ts
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { CurriculoData } from "@/types/cv";

// =======================================================
// CONFIGURAÇÃO DE FONTES
// =======================================================

const configureFonts = () => {
  const pdfMakeAny = pdfMake as any;
  
  if (pdfMakeAny._fontsConfigured) return;
  
  try {
    if (pdfFonts && (pdfFonts as any).pdfMake) {
      const vfs = (pdfFonts as any).pdfMake.vfs;
      if (vfs) {
        pdfMakeAny.vfs = vfs;
      }
    }
    
    pdfMakeAny.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };
    
    pdfMakeAny._fontsConfigured = true;
  } catch (error) {
    console.error('Erro ao configurar fontes:', error);
    pdfMakeAny.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };
    pdfMakeAny._fontsConfigured = true;
  }
};

// =======================================================
// HELPERS
// =======================================================

const buildContatos = (cv: CurriculoData) => {
  const c = cv.dadosPessoais;
  const parts = [c.email, c.telefone, c.linkedin, c.portfolio].filter(Boolean);
  return parts.join(' • ');
};

// =======================================================
// CONSTRUTORES DE SEÇÕES
// =======================================================

const buildResumo = (cv: CurriculoData): any[] => {
  if (!cv.resumo) return [];
  return [
    { text: 'Resumo Profissional', style: 'sectionTitle' },
    { text: cv.resumo, style: 'text', margin: [0, 4, 0, 12] }
  ];
};

const buildExperiencias = (cv: CurriculoData): any[] => {
  if (!cv.experiencias?.length) return [];
  
  const items: any[] = [
    { text: 'Experiência Profissional', style: 'sectionTitle' }
  ];
  
  cv.experiencias.forEach((exp) => {
    items.push({
      stack: [
        {
          columns: [
            { text: exp.empresa, style: 'itemHeader' },
            { text: exp.periodo, alignment: 'right', style: 'itemDate' }
          ]
        },
        { text: exp.cargo, style: 'itemSub' },
        {
          ul: exp.bullets?.length ? exp.bullets : ['Descrição não fornecida'],
          style: 'list'
        }
      ],
      margin: [0, 4, 0, 14]
    });
  });
  
  return items;
};

const buildProjetos = (cv: CurriculoData): any[] => {
  if (!cv.projetos?.length) return [];
  
  const items: any[] = [
    { text: 'Projetos em Destaque', style: 'sectionTitle' }
  ];
  
  cv.projetos.forEach((proj) => {
    items.push({
      stack: [
        {
          columns: [
            { text: proj.nome, style: 'itemHeader' },
            { text: proj.tech, alignment: 'right', style: 'itemDate' }
          ]
        },
        { text: proj.descricao, style: 'text', margin: [0, 4, 0, 0] }
      ],
      margin: [0, 4, 0, 14]
    });
  });
  
  return items;
};

const buildHabilidades = (cv: CurriculoData): any[] => {
  if (!cv.habilidades) return [];
  return [
    { text: 'Habilidades Técnicas', style: 'sectionTitle' },
    { text: cv.habilidades, style: 'text', margin: [0, 4, 0, 12] }
  ];
};

const buildFormacao = (cv: CurriculoData): any[] => {
  if (!cv.formacao?.length && !cv.certificacoes?.length) return [];
  
  const items: any[] = [
    { text: 'Formação e Certificações', style: 'sectionTitle' }
  ];
  
  const listItems: string[] = [];
  if (cv.formacao) listItems.push(...cv.formacao);
  if (cv.certificacoes) listItems.push(...cv.certificacoes);
  
  items.push({
    ul: listItems,
    style: 'list',
    margin: [0, 4, 0, 12]
  });
  
  return items;
};

const buildIdiomas = (cv: CurriculoData): any[] => {
  if (!cv.idiomas) return [];
  return [
    { text: 'Idiomas', style: 'sectionTitle' },
    { text: cv.idiomas, style: 'text', margin: [0, 4, 0, 12] }
  ];
};

// =======================================================
// TEMPLATES
// =======================================================

const getTemplateStyles = (templateId: string): any => {
  const baseStyles = {
    name: { fontSize: 22, bold: true, margin: [0, 0, 0, 4] },
    contact: { fontSize: 10, color: '#475569', margin: [0, 0, 0, 16] },
    sectionTitle: { fontSize: 11, bold: true, margin: [0, 10, 0, 6] },
    itemHeader: { bold: true, fontSize: 11 },
    itemDate: { fontSize: 10, color: '#64748b' },
    itemSub: { fontSize: 10, italics: true, margin: [0, 2, 0, 4] },
    text: { fontSize: 10, lineHeight: 1.5 },
    list: { margin: [0, 4, 0, 0], lineHeight: 1.5 }
  };

  switch (templateId) {
    case 'padrao':
      return {
        ...baseStyles,
        name: { ...baseStyles.name, fontSize: 24, textTransform: 'uppercase' as const, letterSpacing: 1 },
        sectionTitle: { ...baseStyles.sectionTitle, textTransform: 'uppercase' as const }
      };

    case 'moderno':
      return {
        ...baseStyles,
        name: { ...baseStyles.name, fontSize: 26, color: '#0284c7' },
        sectionTitle: { ...baseStyles.sectionTitle, color: '#0284c7', textTransform: 'uppercase' as const, letterSpacing: 1 },
        itemSub: { ...baseStyles.itemSub, color: '#0284c7', bold: true, italics: false }
      };

    case 'colunas':
      return {
        ...baseStyles,
        name: { ...baseStyles.name, fontSize: 22, alignment: 'center' as const },
        sectionTitle: { ...baseStyles.sectionTitle, fontSize: 10, textTransform: 'uppercase' as const }
      };

    case 'executivo':
      return {
        ...baseStyles,
        name: { ...baseStyles.name, fontSize: 24, textTransform: 'uppercase' as const, letterSpacing: 2 },
        sectionTitle: { ...baseStyles.sectionTitle, fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: 1, alignment: 'center' as const }
      };

    case 'tecnico':
      return {
        ...baseStyles,
        name: { ...baseStyles.name, fontSize: 22 },
        sectionTitle: { ...baseStyles.sectionTitle, color: '#059669' },
        itemSub: { ...baseStyles.itemSub, italics: false }
      };

    case 'minimalista':
      return {
        ...baseStyles,
        name: { ...baseStyles.name, fontSize: 24, fontWeight: 300 as const, letterSpacing: -1 },
        sectionTitle: { ...baseStyles.sectionTitle, fontSize: 10, color: '#a1a1aa', textTransform: 'uppercase' as const, letterSpacing: 2 },
        text: { ...baseStyles.text, fontWeight: 350 as const }
      };

    case 'corporativo':
      return {
        ...baseStyles,
        name: { ...baseStyles.name, fontSize: 24, color: '#ffffff' },
        contact: { ...baseStyles.contact, color: '#bfdbfe' },
        sectionTitle: { ...baseStyles.sectionTitle, color: '#1e3a8a', fontSize: 11, textTransform: 'uppercase' as const }
      };

    case 'criativo':
      return {
        ...baseStyles,
        name: { ...baseStyles.name, fontSize: 26, fontWeight: 900 as const, letterSpacing: -1 },
        sectionTitle: { ...baseStyles.sectionTitle, color: '#f43f5e', fontSize: 12, textTransform: 'lowercase' as const },
        itemSub: { ...baseStyles.itemSub, color: '#f43f5e', bold: true, italics: false }
      };

    case 'lateral':
      return {
        ...baseStyles,
        name: { ...baseStyles.name, fontSize: 24, color: '#ffffff' },
        contact: { ...baseStyles.contact, color: '#cbd5e1' },
        sectionTitle: { ...baseStyles.sectionTitle, color: '#0f172a', fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: 1 }
      };

    case 'elegante':
      return {
        ...baseStyles,
        name: { ...baseStyles.name, fontSize: 26, fontWeight: 500 as const, color: '#1f1b16', letterSpacing: -0.5 },
        contact: { ...baseStyles.contact, color: '#6b6359', italics: true },
        sectionTitle: { ...baseStyles.sectionTitle, color: '#8b765a', fontSize: 12, fontWeight: 500 as const, letterSpacing: 1 },
        text: { ...baseStyles.text, fontSize: 10.5 }
      };

    default:
      return baseStyles;
  }
};

// =======================================================
// FUNÇÃO PRINCIPAL
// =======================================================

export const exportarPDF = (cv: CurriculoData, templateId: string = 'padrao') => {
  configureFonts();

  const name = cv.dadosPessoais?.nome || "Nome Omitido";
  const contacts = buildContatos(cv);
  const styles = getTemplateStyles(templateId);

  // Estrutura base do documento
  let docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { fontSize: 10, color: '#1e293b', lineHeight: 1.5 },
    styles,
    content: []
  };

  // =======================================================
  // CONSTRUÇÃO DO CONTEÚDO POR TEMPLATE
  // =======================================================

  switch (templateId) {
    case 'padrao':
      docDefinition.content = [
        { text: name, style: 'name', alignment: 'center' },
        { text: contacts, style: 'contact', alignment: 'center' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#0f172a' }], margin: [0, 0, 0, 16] },
        ...buildResumo(cv),
        ...buildExperiencias(cv),
        ...buildProjetos(cv),
        ...buildHabilidades(cv),
        ...buildFormacao(cv),
        ...buildIdiomas(cv)
      ];
      break;

    case 'moderno':
      docDefinition.content = [
        {
          columns: [
            { width: 4, canvas: [{ type: 'rect', x: 0, y: 0, w: 4, h: 45, color: '#0284c7' }] },
            { width: '*', stack: [{ text: name, style: 'name' }, { text: contacts, style: 'contact' }], margin: [10, 0, 0, 0] }
          ]
        },
        ...buildResumo(cv),
        ...buildExperiencias(cv),
        ...buildProjetos(cv),
        ...buildHabilidades(cv),
        ...buildFormacao(cv),
        ...buildIdiomas(cv)
      ];
      break;

    case 'colunas':
      docDefinition.content = [
        {
          table: {
            widths: ['*'],
            body: [[{
              stack: [
                { text: name, style: 'name', alignment: 'center' },
                { text: contacts, style: 'contact', alignment: 'center' }
              ],
              fillColor: '#f8fafc',
              border: [false, false, false, false],
              margin: [20, 16, 20, 16]
            }]]
          },
          margin: [0, 0, 0, 16]
        },
        {
          columns: [
            {
              width: '65%',
              stack: [
                ...buildResumo(cv),
                ...buildExperiencias(cv),
                ...buildProjetos(cv)
              ]
            },
            {
              width: '35%',
              stack: [
                ...buildHabilidades(cv),
                ...buildFormacao(cv),
                ...buildIdiomas(cv)
              ]
            }
          ]
        }
      ];
      break;

    case 'executivo':
      docDefinition.content = [
        { text: name, style: 'name', alignment: 'center' },
        { text: contacts, style: 'contact', alignment: 'center' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#111827' }], margin: [0, 8, 0, 16] },
        ...buildResumo(cv),
        ...buildExperiencias(cv),
        ...buildProjetos(cv),
        ...buildHabilidades(cv),
        ...buildFormacao(cv),
        ...buildIdiomas(cv)
      ];
      break;

    case 'tecnico':
      docDefinition.content = [
        { text: name, style: 'name' },
        { text: contacts, style: 'contact' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#9ca3af', dash: { length: 4 } }], margin: [0, -4, 0, 16] },
        ...buildResumo(cv).map((item: any) => 
          item.style === 'sectionTitle' ? { ...item, text: '// ' + item.text } : item
        ),
        ...buildExperiencias(cv),
        ...buildProjetos(cv),
        ...buildHabilidades(cv).map((item: any) =>
          item.style === 'sectionTitle' ? { ...item, text: '> ' + item.text } : item
        ),
        ...buildFormacao(cv),
        ...buildIdiomas(cv)
      ];
      break;

    case 'minimalista':
      docDefinition.content = [
        { text: name, style: 'name' },
        { text: contacts, style: 'contact' },
        ...buildResumo(cv),
        ...buildExperiencias(cv),
        ...buildProjetos(cv),
        ...buildHabilidades(cv),
        ...buildFormacao(cv),
        ...buildIdiomas(cv)
      ];
      break;

    case 'corporativo':
      docDefinition.pageMargins = [0, 0, 0, 40];
      docDefinition.content = [
        {
          table: {
            widths: ['*'],
            body: [[{
              stack: [
                { text: name, style: 'name', alignment: 'center' },
                { text: contacts, style: 'contact', alignment: 'center' }
              ],
              fillColor: '#1e3a8a',
              border: [false, false, false, false],
              margin: [40, 32, 40, 24]
            }]]
          },
          margin: [0, 0, 0, 16]
        },
        {
          stack: [
            ...buildResumo(cv).map((item: any) => 
              item.style === 'sectionTitle' ? { ...item, background: '#f3f4f6', padding: [8, 4, 8, 4] } : item
            ),
            ...buildExperiencias(cv),
            ...buildProjetos(cv),
            ...buildHabilidades(cv).map((item: any) =>
              item.style === 'sectionTitle' ? { ...item, background: '#f3f4f6', padding: [8, 4, 8, 4] } : item
            ),
            ...buildFormacao(cv),
            ...buildIdiomas(cv)
          ],
          margin: [40, 0, 40, 0]
        }
      ];
      break;

    case 'criativo':
      docDefinition.content = [
        {
          stack: [
            { text: name, style: 'name', alignment: 'center' },
            { text: contacts, style: 'contact', alignment: 'center' }
          ],
          background: '#fef2f2',
          padding: [20, 16, 20, 16],
          margin: [0, 0, 0, 16]
        },
        ...buildResumo(cv),
        ...buildExperiencias(cv).map((item: any, index: number) => {
          if (index === 0) return item;
          if (item.stack) {
            return {
              ...item,
              border: [true, false, false, false],
              borderColor: ['#f43f5e', '#fff', '#fff', '#fff'],
              padding: [8, 0, 0, 0]
            };
          }
          return item;
        }),
        ...buildProjetos(cv),
        ...buildHabilidades(cv),
        ...buildFormacao(cv),
        ...buildIdiomas(cv)
      ];
      break;

    case 'lateral':
      docDefinition.pageMargins = [0, 0, 0, 40];
      docDefinition.content = [
        {
          table: {
            widths: ['*'],
            body: [[{
              stack: [
                { text: name, style: 'name', alignment: 'center' },
                { text: contacts, style: 'contact', alignment: 'center' }
              ],
              fillColor: '#0f172a',
              border: [false, false, false, false],
              margin: [40, 32, 40, 24]
            }]]
          },
          margin: [0, 0, 0, 16]
        },
        {
          columns: [
            {
              width: '32%',
              stack: [
                {
                  table: {
                    widths: ['*'],
                    body: [[{
                      stack: [
                        ...buildHabilidades(cv),
                        ...buildFormacao(cv),
                        ...buildIdiomas(cv)
                      ],
                      fillColor: '#f8fafc',
                      border: [false, false, false, false],
                      margin: [12, 12, 12, 12]
                    }]]
                  }
                }
              ]
            },
            {
              width: '68%',
              padding: [16, 0, 0, 0],
              stack: [
                ...buildResumo(cv),
                ...buildExperiencias(cv),
                ...buildProjetos(cv)
              ]
            }
          ],
          margin: [40, 0, 40, 0]
        }
      ];
      break;

    case 'elegante':
      docDefinition.content = [
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2dcd0' }] },
        { text: name, style: 'name', alignment: 'center', margin: [0, 12, 0, 4] },
        { text: contacts, style: 'contact', alignment: 'center' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2dcd0' }], margin: [0, 0, 0, 16] },
        ...buildResumo(cv),
        ...buildExperiencias(cv),
        ...buildProjetos(cv),
        ...buildHabilidades(cv),
        ...buildFormacao(cv),
        ...buildIdiomas(cv)
      ];
      break;

    default:
      // Fallback para template padrão
      docDefinition.content = [
        { text: name, style: 'name', alignment: 'center' },
        { text: contacts, style: 'contact', alignment: 'center' },
        ...buildResumo(cv),
        ...buildExperiencias(cv),
        ...buildProjetos(cv),
        ...buildHabilidades(cv),
        ...buildFormacao(cv),
        ...buildIdiomas(cv)
      ];
  }

  // Nome do arquivo
  const nomeLimpo = (cv.dadosPessoais?.nome || 'Curriculo')
    .trim()
    .replace(/\s+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  try {
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.download(`Curriculo_${nomeLimpo}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    // Fallback simples
    const fallbackDoc: any = {
      content: [
        { text: name, fontSize: 20, bold: true, alignment: 'center' },
        { text: contacts, alignment: 'center', margin: [0, 8, 0, 16] },
        { text: cv.resumo || '' }
      ]
    };
    pdfMake.createPdf(fallbackDoc).download(`Curriculo_${nomeLimpo}.pdf`);
  }
};

export const gerarPDFBuffer = (cv: CurriculoData, templateId: string = 'padrao'): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      configureFonts();
      
      const name = cv.dadosPessoais?.nome || "Nome Omitido";
      const contacts = buildContatos(cv);
      const styles = getTemplateStyles(templateId);

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        defaultStyle: { fontSize: 10, color: '#1e293b', lineHeight: 1.5 },
        styles,
        content: [
          { text: name, style: 'name', alignment: 'center' },
          { text: contacts, style: 'contact', alignment: 'center' },
          ...buildResumo(cv),
          ...buildExperiencias(cv),
          ...buildProjetos(cv),
          ...buildHabilidades(cv),
          ...buildFormacao(cv),
          ...buildIdiomas(cv)
        ]
      };

      const pdfDoc = pdfMake.createPdf(docDefinition);
      (pdfDoc as any).getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
};