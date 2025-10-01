import PocketBase from 'pocketbase';
import { serializeNonPOJOs } from '$lib/utils';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { POCKETBASE_URL } from '$env/static/public';
import type { TypedPocketBase } from '$lib/pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase

	// load the store data from the request cookie string
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		// get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('users').authRefresh();
			event.locals.user = serializeNonPOJOs(event.locals.pb.authStore.record);
		} else {
			event.locals.user = undefined;
		}
	} catch (_) {
		// clear the auth store on failed refresh
		event.locals.pb.authStore.clear();
		event.locals.user = undefined;
	}

	const response = await resolve(event);

	// send back the default 'pb_auth' cookie to the client with the latest store state
	response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie({ secure: !dev, sameSite: 'lax', path:"/" }));

	return response;
};
