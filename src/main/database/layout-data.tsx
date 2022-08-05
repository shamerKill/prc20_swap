import { ReactNode } from "react";
import { BehaviorSubject } from "rxjs";


const layoutModalStoreInit: {
	showStatus: boolean;
	children?: ReactNode | ReactNode[],
	options?: {
		title?: string;
		bgClose?: boolean;
		backBtnHandle?: () => void;
	};
} = {
	showStatus: false,
};

export const layoutModalStore = new BehaviorSubject(layoutModalStoreInit);
export const layoutModalShow = (state?: Partial<typeof layoutModalStoreInit>) => layoutModalStore.next({...state, showStatus: true});
export const layoutModalHide = (state?: Partial<typeof layoutModalStoreInit>) => layoutModalStore.next({...state, showStatus: false});