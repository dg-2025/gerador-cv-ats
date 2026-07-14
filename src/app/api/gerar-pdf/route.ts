// src/app/api/gerar-pdf/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

interface GerarPdfRequestBody {
  html: string;
  filename?: string;
}

const LOCAL_CHROME_EXECUTABLE = process.platform === 'win32' 
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : '/usr/bin/google-chrome';

export async function POST(req: Request) {
  try {
    const { html, filename = "curriculo.pdf" } = (await req.json()) as GerarPdfRequestBody;

    if (!html) {
      return NextResponse.json({ error: "HTML é obrigatório" }, { status: 400 });
    }

    const isLocal = process.env.NODE_ENV === 'development';

    const browser = await puppeteer.launch({
      args: isLocal 
        ? ['--no-sandbox', '--disable-setuid-sandbox'] 
        : [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
      defaultViewport: {
        width: 794,
        height: 1123,
        deviceScaleFactor: 1,
      },
      executablePath: isLocal ? LOCAL_CHROME_EXECUTABLE : await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    
    // 1. Define o conteúdo utilizando as opções aceitas pelos tipos nativos ('domcontentloaded')
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded',
      timeout: 35000 
    });
    
    // 2. Aguarda explicitamente via avaliação no browser que as fontes externas (Google Fonts) estejam carregadas
    // Isso substitui o 'networkidle0' de forma ainda mais focada na renderização de texto vetorial
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // Emulamos 'print' para manter as regras de impressão de texto vetorial
    await page.emulateMediaType('print');
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm'
      },
      preferCSSPageSize: false,
    });

    await browser.close();

    const buffer = Buffer.from(pdfBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json({ 
      error: "Erro interno ao gerar PDF: " + error.message 
    }, { status: 500 });
  }
}