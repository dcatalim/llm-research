import type { RequestHandler } from './$types';
import { PDFParse } from 'pdf-parse';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		if (file.type !== 'application/pdf') {
			return json({ error: 'File must be a PDF' }, { status: 400 });
		}

		// Read the file as ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Parse the PDF
		const parser = new PDFParse({ data: buffer });
		const textResult = await parser.getText();
		const infoResult = await parser.getInfo();

		return json({
			text: textResult.text,
			pages: textResult.total,
			info: infoResult.info
		});
	} catch (error) {
		console.error('Error parsing PDF:', error);
		return json({ error: 'Failed to parse PDF' }, { status: 500 });
	}
};