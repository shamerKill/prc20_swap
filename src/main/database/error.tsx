export type TypeDataBase<T=any> = {
	status: number;
	data?: T;
	msg?: string;
};

export const dataBaseError = (msg: string = 'data error'): TypeDataBase => {
	return {
		status: -1,
		msg,
	};
};

export const dataBaseResult = <T=any>(data: T): TypeDataBase => {
	return {
		status: 200,
		data,
	};
}