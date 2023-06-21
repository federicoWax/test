import { useEffect, useState } from 'react';
import { get } from "../services";

const useGet = (url, wait) => {
	const [loading, setLoading] = useState(true);
	const [response, setResponse] = useState();

	useEffect(() => {
		if (wait) return;

		const controller = new AbortController();

		const init = async () => {
			setLoading(true);

			try {
				const _response = await get(url, controller);

				setResponse(_response);
			} catch (error) {
				if (typeof error === "string") {
					alert(error);
					return;
				}

				console.log(error);
			} finally {
				setLoading(false);
			}
		}

		init();

		return () => {
			controller.abort();
		}
	}, [url, wait]);

	return { loading, response };
}

export default useGet;