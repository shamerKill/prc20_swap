import { RouterApp } from '$routes';
import { createRoot } from 'react-dom/client';

const main = async () => {
	createRoot(
		document.getElementById('root') ||
		document.body.appendChild(document.createElement('div'))
	).render(
		<RouterApp />
	);
};

main();
