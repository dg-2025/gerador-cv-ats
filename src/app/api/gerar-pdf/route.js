
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";




const LOCAL_CHROME_EXECUTABLE = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
export async function POST(req) {
    try {
        const { html, filename = "curriculo.pdf" } = await req.json();

        if (!html) {
            return NextResponse.json({ error: "HTML é obrigatório" }, { status: 400 });
        }

        
        const isLocal = process.env.NODE_ENV === 'development';

        const browser = await puppeteer.launch({
            args: isLocal ? [] : chromium.args,
            defaultViewport: chromium.defaultViewport,
            
            executablePath: isLocal ? LOCAL_CHROME_EXECUTABLE : await chromium.executablePath(),
            headless: isLocal ? true : chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: 'networkidle0' });

        
        
        await page.emulateMediaType('screen');

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, 
            margin: {
                top: '0px', 
                bottom: '0px',
                left: '0px',
                right: '0px'
            },
            preferCSSPageSize: true,
        });

        await browser.close();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        return NextResponse.json({ error: "Erro interno ao gerar PDF: " + error.message }, { status: 500 });
    }
}