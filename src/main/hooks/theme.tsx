import { useEffect, useState } from "react";

export const enumThemeType: {
	dart: 'dart';
	light: 'light';
} = {
	dart: 'dart',
	light: 'light',
};

export const useCustomThemeSwitch = () => {
	const [ themType, _setThemeType ] = useState<keyof typeof enumThemeType>(enumThemeType.light);

	useEffect(() => {
		var html: HTMLElement = document.getElementsByTagName('html')[0];
		const theme = html.attributes.getNamedItem('theme');
		if (theme?.value !== undefined && theme?.value !== themType) {
			_setThemeType(theme?.value as any);
		}
	}, []);

	const setThemeType = (type: keyof typeof enumThemeType) => {
		const html: HTMLElement = document.getElementsByTagName('html')[0];
		html.setAttribute('theme', type);
		_setThemeType(type);
	}

	const switchThemeType = () => {
		if (themType === enumThemeType.dart) setThemeType(enumThemeType.light);
		else if (themType === enumThemeType.light) setThemeType(enumThemeType.dart);
	};
	
	return { themType, setThemeType, switchThemeType };
};