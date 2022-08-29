import { FC,useEffect,useState } from 'react';
import ComponentFunctionalPagenation from '$components/functional/pagination';
import { toolApi,toolGet } from '$tools';
import './index.scss';
type tradeItem = {
  address: string,
  date: number,
  hash: string,
  now_balance: string,
  num_0: string,
  num_1: string,
  operation: string
}
const ComponentBrowserTabList: FC<{
  listType:string,
  token:string
}> = ({
  listType,
  token
}) => {
	useEffect(() => {
    if (token) {
      getList();
    }
	}, [token]);
	const [currentPage, setCurrentPage] = useState(1);
	const [list, setList] = useState<tradeItem[]>([]);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [pageSizeOptions, setPageSizeOptions] = useState([5, 10, 20, 30]);

	const handleChangePage = (val:number) => {
		setCurrentPage(val)
	};

	const handleChangePageSize = (val:number) => {
		setPageSize(val)
		setCurrentPage(1)
	};
  const getList = () => {
    toolGet(toolApi('/browser/token/operation'), {from: currentPage,amount: pageSize, token: token,types:listType}).then((res:any) => {
      if (res.errno == 200) {
        setTotal(res.data.total);
        if (res.data.list != null) {
          setList(res.data.list);
        }
      }
    })
  }

	return (
		<div className='browser-list'>
      <div className="list-content">
        <div className="table-area">
          <div className="list-content-title">
            <div className="list-content-title-item">#</div>
            <div className="list-content-title-item">总金额</div>
            <div className="list-content-title-item">总数量</div>
            <div className="list-content-title-item">总数量</div>
            <div className="list-content-title-item">账户</div>
            <div className="list-content-title-item">时间</div>
          </div>
          {
            list.map((item, index) => 
              <div className="list-content-detail" key={index}>
                <div className="list-content-detail-item">{item.operation}</div>
                <div className="list-content-detail-item">$ {item.now_balance}</div>
                <div className="list-content-detail-item">{item.num_0}</div>
                <div className="list-content-detail-item">{item.num_1}</div>
                <div className="list-content-detail-item">{item.hash}</div>
                <div className="list-content-detail-item">{item.date}</div>
              </div>
            )
          }
        </div>
        {
          total > 0 && <ComponentFunctionalPagenation className='overview' currentPage={currentPage} pageSize={pageSize} pageSizeOptions={pageSizeOptions} total={total} totalText={`共${total}条`} handleChangePage={handleChangePage} handleChangePageSize={handleChangePageSize}></ComponentFunctionalPagenation>
        }
        {
          total == 0 && <div className='noDatas'>暂无数据</div>
        }
      </div>
		</div>
	);
};

export default ComponentBrowserTabList;

