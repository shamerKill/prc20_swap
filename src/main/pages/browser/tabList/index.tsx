import { FC,useEffect,useState } from 'react';
import ComponentFunctionalPagenation from '$components/functional/pagination';
import { toolApi,toolGet,toolHideAddressCenter,timestampToTime,toNonExponential } from '$tools';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { useCustomGetAppVersion } from '$hooks';
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
	const { t, i18n } = useTranslation();
	const [ appVersion ] = useCustomGetAppVersion();
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
	useEffect(() => {
    if (appVersion != undefined&&currentPage) {
      if (token) {
        getList();
      }
    }
	}, [token,appVersion,listType,currentPage,i18n.language]);
  const getList = () => {
    toolGet(toolApi('/browser/token/operation'), {from: currentPage,amount: pageSize, token: token,types:listType,version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
      if (res.errno == 200) {
        setTotal(res.data.total);
        if (res.data.list != null) {
          setList(res.data.list);
        } else {
          setList([]);
        }
      }
    })
  }
  const goDetail = (hash:string) => {
    (window as any).open(`https://www.plugchain.network/v2/transDetail?id=${hash}`)
  }
  const goAccount = (address:string) => {
    (window as any).open(`https://www.plugchain.network/v2/addressDetail?id=${address}`)
  }

	return (
		<div className='browser-list'>
      <div className="list1-content">
        <div className="table-area">
          <div className="list1-content-title">
            <div className="list1-content-title-item">#</div>
            <div className="list1-content-title-item">{t('totalAmount')}</div>
            <div className="list1-content-title-item">{t('totalQuantity')}</div>
            <div className="list1-content-title-item">{t('totalQuantity')}</div>
            <div className="list1-content-title-item">{t('account')}</div>
            <div className="list1-content-title-item">{t('time')}</div>
          </div>
          {
            list.map((item, index) => 
              <div className="list1-content-detail" key={index}>
                <div className="list1-content-detail-item" onClick={() => goDetail(item.hash)}>{item.operation}</div>
                <div className="list1-content-detail-item">$ {item.now_balance}</div>
                <div className="list1-content-detail-item">{toNonExponential(item.num_0.split(' ')[0])} {item.num_0.split(' ')[1]}</div>
                <div className="list1-content-detail-item">{toNonExponential(item.num_1.split(' ')[0])} {item.num_1.split(' ')[1]}</div>
                <div className="list1-content-detail-item" onClick={() => goAccount(item.address)}>{toolHideAddressCenter(item.address??'')}</div>
                <div className="list1-content-detail-item">{timestampToTime(item.date??0)}</div>
              </div>
            )
          }
        </div>
        {
          total > 0 && <ComponentFunctionalPagenation className='overview' currentPage={currentPage} pageSize={pageSize} pageSizeOptions={pageSizeOptions} total={total} totalText={`${t('共')}${total}${t('条')}`} handleChangePage={handleChangePage} handleChangePageSize={handleChangePageSize}></ComponentFunctionalPagenation>
        }
        {
          total == 0 && <div className='noDatas'>{t('暂无数据')}</div>
        }
      </div>
		</div>
	);
};

export default ComponentBrowserTabList;

