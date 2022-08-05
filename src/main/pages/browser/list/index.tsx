import { FC,useEffect,useState } from 'react';
import ComponentFunctionalPagenation from '$components/functional/pagination';
import './index.scss';
const ComponentBrowserList: FC<{
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
      <div className="list-title">
        {listType==1?'热门代币':'交易对'}
      </div>
      <div className="list-content">
        <div className="table-area">
          <div className="list-content-title">
            <div className="list-content-title-item"></div>
            <div className="list-content-title-item">名称</div>
            <div className="list-content-title-item">资产流动性</div>
            <div className="list-content-title-item">成交额 24H</div>
            <div className="list-content-title-item">价格</div>
            <div className="list-content-title-item">价格变化</div>
          </div>
          <div className="list-content-detail">
            <div className="list-content-detail-item">1</div>
            <div className="list-content-detail-item">ETH</div>
            <div className="list-content-detail-item">$ 78.987M</div>
            <div className="list-content-detail-item">$ 78.987M</div>
            <div className="list-content-detail-item">$ 0.987</div>
            <div className="list-content-detail-item">-0.405%</div>
          </div>
          <div className="list-content-detail">
            <div className="list-content-detail-item">1</div>
            <div className="list-content-detail-item">ETH</div>
            <div className="list-content-detail-item">$ 78.987M</div>
            <div className="list-content-detail-item">$ 78.987M</div>
            <div className="list-content-detail-item">$ 0.987</div>
            <div className="list-content-detail-item">-0.405%</div>
          </div>
        </div>
			  <ComponentFunctionalPagenation className='overview' currentPage={currentPage} pageSize={pageSize} pageSizeOptions={pageSizeOptions} total={total} totalText={`共${total}条`} handleChangePage={handleChangePage} handleChangePageSize={handleChangePageSize}></ComponentFunctionalPagenation>
      </div>
		</div>
	);
};

export default ComponentBrowserList;

