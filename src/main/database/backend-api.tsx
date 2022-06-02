import { dataBaseError } from "./error";

// get demo data
export const getDemoData = async (): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (Math.random() < 1) {
				resolve([
					'1',
					'2',
				]);
			} else {
				reject(dataBaseError('error'));
			}
		}, 0);
	});
};