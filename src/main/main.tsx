import ComponentLayoutModal from '$components/layout/modal';
import { RouterApp } from '$routes';
import { toolInitI18n } from '$tools';
import { FC } from 'react';
import { createRoot } from 'react-dom/client';

const BaseNode: FC = () => {
	return (
		<>
			<RouterApp />
			{/* 弹窗 */}
			<ComponentLayoutModal />
		</>
	);
};


const main = async () => {
	createRoot(
		document.getElementById('root') ||
		document.body.appendChild(document.createElement('div'))
	).render(
		<BaseNode />
	);
};

toolInitI18n();
main();
