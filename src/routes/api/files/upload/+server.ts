import { getImageURL } from '$lib/pocketbase.js';
import { error } from '@sveltejs/kit';
import { z } from 'zod/v4';

const FileSchema = z.object({
	file: z
		.instanceof(Blob)
		.refine((file) => file.size <= 5 * 1024 * 1024, {
			message: 'File size should be less than 5MB'
		})
		// Update the file type based on the kind of files you want to accept
		.refine((file) => ['image/jpeg', 'image/png', 'text/plain'].includes(file.type), {
			message: 'File type should be TXT, JPEG or PNG'
		})
});

export async function POST({ request, locals }) {
	if (!locals.pb.authStore.isValid) {
		error(401, 'Unauthorized');
	}

	if (request.body === null) {
		error(400, 'Empty file received');
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return error(400, 'No file uploaded');
		}

		console.log('Uploading file:', file.name, file.type, file.size);

		const validatedFile = FileSchema.safeParse({ file });

		if (!validatedFile.success) {
			// const errorMessage = validatedFile.error.errors.map((error) => error.message).join(', ');
			const errorMessage = validatedFile.error.message;
			return error(400, errorMessage);
		}

		// Get filename from formData since Blob doesn't have name property
		const filename = file.name;
		// const fileBuffer = await file.arrayBuffer();
		// const fileBlob = new Blob([fileBuffer], { type: file.type });

		try {
			const data = {
				type: 'file',
				filename: filename,
				image: file,
				mediaType: file.type,
				data: undefined, // Use data to store non-image files
				userId: locals.user?.id
			};

			const record = await locals.pb.collection('documents').create(data);

			return Response.json(record);
		} catch (e) {
			console.error(e);
			return error(500, 'Upload failed');
		}
	} catch (e) {
		console.error(e);
		return error(500, 'Failed to process request');
	}
}
