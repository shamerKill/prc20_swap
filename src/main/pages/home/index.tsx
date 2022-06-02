import { ComponentLayoutBase } from '$components';
import { getDemoData } from '$database';
import { useCustomDataHook } from '$hooks';
import { FC, useEffect } from 'react';

import './index.scss';

const PageHome: FC = () => {
	const { data: listData } = useCustomDataHook(getDemoData, true);

	return (
		<ComponentLayoutBase>
			a simple react project
			<ul>
				{
					listData?.map((item, index) => {
						return (
							<li key={index}>{item}</li>
						);
					})
				}
			</ul>
		</ComponentLayoutBase>
	);
};

export default PageHome;
