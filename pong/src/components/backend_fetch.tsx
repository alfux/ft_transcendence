export async function backend_fetch(url: string, init?: RequestInit, body?:any) {
  try {
    const default_init = {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: body===undefined ? undefined : JSON.stringify(body)
    }
    const rep = await fetch(url, Object.assign({}, default_init, init))
    if (rep.ok) {
      return (rep)
      // return rep.json()
    } else {
      const json = await rep.json()
      console.trace(`Couldn't fetch ${url}: ${rep.status} : ${JSON.stringify(json,null,2)}`)
      return "error"
    }
  } catch (error) {
    console.trace(`Couldn't fetch ${url}: ${error}`)
  }
  return null
}