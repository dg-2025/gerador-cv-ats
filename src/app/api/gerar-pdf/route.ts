// src/app/api/gerar-pdf/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function POST(req: Request) {
  try {
    const { html, filename = "curriculo.pdf" } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "HTML é obrigatório" }, { status: 400 });
    }

    const isLocal = process.env.NODE_ENV === 'development';
    
    // Caminhos locais do Chrome dependendo do seu Sistema Operacional
    const LOCAL_CHROME_EXECUTABLE = process.platform === 'win32' 
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome';

    const browser = await puppeteer.launch({
      args: isLocal 
        ? ['--no-sandbox', '--disable-setuid-sandbox'] 
        : [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: isLocal ? LOCAL_CHROME_EXECUTABLE : await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    
    // Carrega o HTML que o frontend enviou
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    
    // Gera o PDF com texto real
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });

    await browser.close();

    // Retorna o PDF como um arquivo binário para download direto
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json({ error: "Erro interno: " + error.message }, { status: 500 });
  }
}