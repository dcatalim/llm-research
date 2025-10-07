import { serializeNonPOJOs } from '$lib/utils';
import { error } from 'console';
import type { PageServerLoad } from './$types';

export const load = (async ({locals, params}) => {

    const getModel = async (modelId) => {
		try {
			const result = serializeNonPOJOs(await locals.pb.collection('models').getOne(modelId));
			return result;
		} catch (err) {
			console.log('Error: ', err);
			throw error(err.status, err.message);
		}
	};

    return {
        model: getModel(params.modelId)
    };
}) satisfies PageServerLoad;