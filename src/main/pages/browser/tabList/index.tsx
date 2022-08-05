import { FC,useEffect,useState } from 'react';
import ComponentFunctionalPagenation from '$components/functional/pagination';
import './index.scss';
const ComponentBrowserTabList: FC<{
  listType?:number
}> = ({
  listType
}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [list, setList] = useState([]);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(123);
	const [pageSizeOptions, setPageSizeOptions] = useState([5, 10, 20, 30]);

	const handleChangePage = (val:number) => {
		setCurrentPage(val)
	};

	const handleChangePageSize = (val:number) => {
		setPageSize(val)
		setCurrentPage(1)
	};

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
          <div className="list-content-detail">
            <div className="list-content-detail-item">PLUGCN 兑换 ETH</div>
            <div className="list-content-detail-item">$ 78.987M</div>
            <div className="list-content-detail-item">3.098 PLUGCN</div>
            <div className="list-content-detail-item">3.098 ETH</div>
            <div className="list-content-detail-item">7Bcdf5...Ok2e4v</div>
            <div className="list-content-detail-item">3秒前</div>
          </div>
          <div className="list-content-detail">
            <div className="list-content-detail-item">PLUGCN 兑换 ETH</div>
            <div className="list-content-detail-item">$ 78.987M</div>
            <div className="list-content-detail-item">3.098 PLUGCN</div>
            <div className="list-content-detail-item">3.098 ETH</div>
            <div className="list-content-detail-item address">7Bcdf5...Ok2e4v</div>
            <div className="list-content-detail-item">3秒前</div>
          </div>
        </div>
			  <ComponentFunctionalPagenation className='overview' currentPage={currentPage} pageSize={pageSize} pageSizeOptions={pageSizeOptions} total={total} totalText={`共${total}条`} handleChangePage={handleChangePage} handleChangePageSize={handleChangePageSize}></ComponentFunctionalPagenation>
      </div>
		</div>
	);
};

export default ComponentBrowserTabList;

