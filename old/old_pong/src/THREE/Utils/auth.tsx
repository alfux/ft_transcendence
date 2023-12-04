export function getHeaders(): {}
{
  const token = localStorage.getItem('token')
  return token ? {
    Authorization: `Bearer ${token}`,
  } : {}
}
