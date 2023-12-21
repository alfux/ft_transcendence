const BASE_URL = 'http:localhost:3001/';

export const fetchData = async (endpoint: string, options = {}) => {
	try {
		const response = await fetch(`${BASE_URL}/${endpoint}`, options);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
};
