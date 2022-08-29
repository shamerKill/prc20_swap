import ComponentLayoutModal from '$components/layout/modal';
import { RouterApp } from '$routes';
import { toolInitI18n } from '$tools';
import { FC } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BaseNode: FC = () => {
	return (
		<>
			<RouterApp />
			{/* 弹窗 */}
			<ComponentLayoutModal />
			{/* toast */}
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar />
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
