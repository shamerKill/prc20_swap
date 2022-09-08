import { ComponentFunctionalButton } from '$components/functional/button';
import { layoutModalHide, layoutModalStore } from '$database/layout-data';
import classNames from 'classnames';
import { FC, ReactNode, useEffect, useState } from 'react';
import { map } from 'rxjs';

import './index.scss';

const ComponentLayoutModal: FC = () => {
	// 是否渲染
	const [ showModal, setShowModal ] = useState<boolean>(false);
	// 判断进入还是跳出
	const [ hideModal, setHideModal ] = useState<boolean>(false);
	// 子节点
	const [ children, setChildren ] = useState<ReactNode|ReactNode[]|null>(null);
	// 标题
	const [ title, setTitle ] = useState<string|null>(null);
	// 返回按钮事件
	const [ backBtnHandle, setBackBtnHandle ] = useState<(() => void)|undefined>(undefined);
	// 背景是否关闭
	const [ bgCanClose, setBgCanClose ] = useState<boolean>(false);
	// 盒子padding
	const [ padding, setPadding ] = useState<number>();
	
	// 订阅显示状态
	useEffect(() => {
		let timer;
		const sub = layoutModalStore.pipe(map(data => data.showStatus)).subscribe((showStatus) => {
			if (showStatus == false) {
				timer = setTimeout(() => setShowModal(showStatus), 500);
				setHideModal(!showStatus);
			} else {
				setHideModal(!showStatus);
				setShowModal(showStatus);
			}
		});
		return () => sub.unsubscribe();
	}, []);

	// 订阅子节点
	useEffect(() => {
		const sub = layoutModalStore.pipe(map(data => data.children)).subscribe((children) => {
			if (children) setChildren(children);
		});
		return () => sub.unsubscribe();
	}, []);
	
	// 订阅更多数据
	useEffect(() => {
		const sub = layoutModalStore.pipe(map(data => data.options)).subscribe((options) => {
			if (options) {
				if (options.backBtnHandle) {
					setBackBtnHandle(() => options.backBtnHandle);
				}
				if (options.title) setTitle(options.title);
				if (options.bgClose) setBgCanClose(options.bgClose);
			}
		});
		return () => sub.unsubscribe();
	}, []);

	// 关闭弹窗
	const closeModal = () => {
		layoutModalHide();
	};


	if (showModal === false) return <></>;
	return (
		<div className={classNames('com-modal', hideModal ? 'com-modal-out' : 'com-modal-in')}>
			<div onClick={bgCanClose ? closeModal : undefined} className={classNames('com-modal-bg')}></div>
			<div className={classNames('com-modal-content')}>
				<div className={classNames('com-modal-head')}>
					<div onClick={backBtnHandle} className={classNames('com-modal-head-left', backBtnHandle&&'com-modal-head-click')}>
						{
							backBtnHandle && <i className={classNames('com-modal-back', 'iconfont', 'icon-jiantou_xiangzuo')}></i>
						}
						<h3 className={classNames('com-model-title')}>{ title }</h3>
					</div>
					<ComponentFunctionalButton onClick={closeModal} className={classNames('com-modal-close', 'iconfont', 'icon-guanbi')}></ComponentFunctionalButton>
				</div>
				{ children }
			</div>
		</div>
	);
};

export default ComponentLayoutModal;
