import { numberToPercentage } from '$tools';
import classNames from 'classnames';
import { FC, MouseEventHandler, useEffect, useRef, useState } from 'react';

import './index.scss';

const ComFunctionSlider: FC<{
	value: number; // 0 - 100
	onChange: (data: number) => void;
}> = ({ value, onChange }) => {
	const outerRef = useRef<HTMLDivElement|null>(null);
	const innerRef = useRef<HTMLSpanElement|null>(null);
	// 按下时鼠标左侧距离
	const clickedMouseLeft = useRef<number>(0);
	// 按下时滑块左侧距离
	const innerMouseLeft = useRef<number>(0);
	// 是否点击状态
	const clicked = useRef<boolean>(false);
	// 比例
	const [ leftScale, setLeftScale ] = useState<number>(value);
	// 滑块左侧距离
	const [ sliderLeft, setSliderLeft ] = useState<number>(0);
	// 按下滑块
	const onMouseDown: MouseEventHandler<HTMLSpanElement> = (event) => {
		clickedMouseLeft.current = event.clientX + 0;
		innerMouseLeft.current = event.currentTarget.offsetLeft;
		clicked.current = true;
	}
	// 抬起滑块
	const onMouseUp = () => {
		clicked.current = false;
	}
	// 拖动滑块
	const onMouseMove = (event: MouseEvent) => {
		if (!clicked.current) return;
		const boxWidth = outerRef.current?.clientWidth ?? 0;
		const innerWith = innerRef.current?.clientWidth ?? 0;
		const mouseMove = event.clientX - clickedMouseLeft.current;
		let left = innerMouseLeft.current + mouseMove;
		if (left < 0) {
			left =  0;
		} else if ((left + innerWith / 2) > boxWidth) {
			left = boxWidth - innerWith / 2;
		}
		setLeftScale(() => {
			const value = parseFloat(numberToPercentage(((left + innerWith / 2) / boxWidth).toFixed(2), false));
			return value;
		});
	}
	// 点击跳转
	const onClickChange: MouseEventHandler<HTMLDivElement> = (event) => {
		const targetLeft = event.currentTarget.getClientRects()[0].left;
		const targetWidth = event.currentTarget.clientWidth;
		const scale = (event.clientX - targetLeft) / targetWidth;
		setLeftScale(() => {
			let scaleNum = parseFloat(scale.toFixed(2));
			if (scaleNum > 1) scaleNum = 1;
			else if (scaleNum < 0) scaleNum = 0;
			const scaleP = parseFloat(numberToPercentage(scaleNum, false));
			return scaleP;
		});
	}

	useEffect(() => {
		setLeftScale(value);
	}, [value]);

	useEffect(() => {
		onChange(leftScale);
		const outerWidth = outerRef.current?.clientWidth ?? 0;
		const innerWidth = innerRef.current?.clientWidth ?? 0;
		setSliderLeft(outerWidth * leftScale / 100 - innerWidth / 2);
	}, [leftScale]);

	useEffect(() => {
		window.addEventListener('mouseup', onMouseUp);
		window.addEventListener('mousemove', onMouseMove);
		return () => {
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('mousemove', onMouseMove);
		};
	}, []);

	return (
		<div
			className={classNames('com-functional-slider')}
			onClick={onClickChange}
			ref={outerRef}>
			<span
				className={classNames('com-functional-slider-input')}
				onMouseDown={onMouseDown}
				style={{left: `${sliderLeft}px`}}
				ref={innerRef}></span>
		</div>
	);
};

export default ComFunctionSlider;
