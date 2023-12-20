export class FetchError extends Error {

	url: string
	status: number

	constructor(url: string, status: number, msg: string) {
		super(msg);

		Object.setPrototypeOf(this, FetchError.prototype);

		this.url = url
		this.status = status
	}

	what() {
		return `${this.url} returned : ${this.status}, ${this.message}`;
	}
}

export async function backend_fetch(
	url: string,
	init: RequestInit & { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' },
	body?: any,
	log: boolean = true
): Promise<any | undefined> {

	const default_init = {
		method: "GET",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: body === undefined ? undefined : JSON.stringify(body)
	}

	const rep = await fetch(url, Object.assign({}, default_init, init))

	if (rep.ok) {
		return rep.json().catch((e) => { if (e instanceof SyntaxError) { return undefined } else throw e })
	} else {

		try {
			const json = await rep.json()
			if (log)
				console.trace(`Couldn't fetch ${url}: ${rep.status} : ${JSON.stringify(json, null, 2)}`)
			throw new FetchError(url, rep.status, json.error)
		} catch {
			throw new FetchError(url, rep.status, 'No info')
		}

	}
}