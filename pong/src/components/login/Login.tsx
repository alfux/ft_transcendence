import React from 'react'
import usePayload from '../../react_hooks/use_auth'
import { config } from '../../config';
import { clock } from "../../THREE/Utils"

import './Login.css'

const Login: React.FC = () => {
	const [payload, updatePayload, handleUpdate] = usePayload();
	const fetchData = async () => {
		try {
			const authEndpoint = `${config.backend_url}/api/auth/login`;
			handleUpdate();
			window.location.href = authEndpoint;
		}
		catch (error) {
			console.error('Error fetching data:', error);
		}
	}

	return (
		<div className="glass-container-login"
			style={
				clock.clock.getElapsedTime() > 1 ?
					{ animation: "slideInOnAfter 0.5s ease forwards, colorChangeLogin 3s ease infinite" } :
					{ animation: "slideInOnStart 3s ease forwards, colorChangeLogin 3s ease infinite" }
			}>
			<div className="navbar">
				<img className="logo-42" src="https://meta.intra.42.fr/assets/42_logo-7dfc9110a5319a308863b96bda33cea995046d1731cebb735e41b16255106c12.svg" />
				<button onClick={fetchData} className="oauth-button">Login with OAuth</button>
			</div>
		</div>
	);
};

export default Login;

{/* Login Form */ }
{ /* <form className="login-form"> */ }
{ /* <label htmlFor="username">Username:</label> */ }
{ /* <input type="text" id="username" name="username" required /> */ }
{ /* <label htmlFor="password">Password:</label> */ }
{ /* <input type="password" id="password" name="password" required /> */ }
{ /* <button type="submit">Login</button> */ }
{ /* </form> */ }
{/* OAuth Login Button */ }
