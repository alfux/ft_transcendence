import React, { useState } from 'react'
import './failable_button.css'

export function FailableButton(props: {
	onClick: () => Promise<any>,
	children?: React.ReactNode,
}) {

	const [error, setError] = useState(false)

	function button_click() {
		props.onClick()
		.then(() => setError(false))
		.catch(() => { console.log("Failable button failed"); setError(true); setTimeout(() => { setError(false) }, 1000) })
	}

	return (
		<button onClick={button_click} className={error ? "button-error" : "button-ok"} >
			{props.children}
		</button>
	)
}
