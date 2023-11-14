import React, { useEffect } from 'react'
import { chat_socket, chatSocketAuth } from '../Chat';

export function getHeaders(): {}
{
  const token = localStorage.getItem('token');
  if (!token)
    return {}
  const headers = {
    Authorization: `Bearer ${token}`,
    // You can add other headers as needed.
  };
  return headers;
}

interface AuthComponentProps
{
  Authenticated: () => JSX.Element
  NotAuthenticated: () => JSX.Element
}

export function AuthComponent(props: AuthComponentProps): JSX.Element {

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('code')
    if (token) {
      localStorage.setItem('token', token)
      const newURL = window.location.href.replace(window.location.search, '')
      window.history.replaceState({}, document.title, newURL)
    }
  }, [])

  const token = localStorage.getItem('token')

  if (token !== null) {
    chatSocketAuth(token)
    return props.Authenticated()
  } else {
    return props.NotAuthenticated()
  }
};