export const dataBaseError = (data: any) => {
	return {
		status: -1,
		error: data,
		msg: 'data error',
	};
};