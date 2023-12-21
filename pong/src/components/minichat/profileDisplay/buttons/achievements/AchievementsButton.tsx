import React, { useRef, useEffect, useState } from 'react'
import './AchievementsButton.css'


const AchievementsButton: React.FC = () => {

	return (
		<>
			<button className='glowing-btn'>
				<span className='glowing-txt'>Achiev
					<span className='faulty-letter'>ements</span>
				</span>
			</button>
		</>
	);
};

export default AchievementsButton;
