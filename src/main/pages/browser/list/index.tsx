import { FC,useEffect,useState } from 'react';
import ComponentFunctionalPagenation from '$components/functional/pagination';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { toolApi,toolGet } from '$tools';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { useCustomGetAppVersion } from '$hooks';

type tokenItem = {
	change: string; // 价格变化
	fluidity: string; // 流动性
	logo: string; // logo
	name: string; // 名称
	price: string; // plug价格
	token: string; // 合约
	turnover: string; // 成交额
};
type tokenInfo = {
  logo: string,
  name: string,
  token: string
}
type tridePair = {
  fluidity: string,
  lp: string,
  token_0: tokenInfo[],
  turnover: string,
  turnover_week: string
}

const ComponentBrowserList: FC<{
  listType?:number,
	coinPair: string;
}> = ({
  listType,
  coinPair
}) => {
	const { t } = useTranslation();
	const [ appVersion ] = useCustomGetAppVersion();
	useEffect(() => {
    if (appVersion != undefined) {
      console.log(coinPair)
      if (coinPair == 'pc') {
        getList();
      } else if (coinPair) {
        getTokenList();
      }
    }
	}, [coinPair,appVersion]);
	const [currentPage, setCurrentPage] = useState(1);
	const [list, setList] = useState<tokenItem[]>([]);
	const [list1, setList1] = useState<tridePair[]>([]);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [pageSizeOptions, setPageSizeOptions] = useState([5, 10, 20, 30]);
  const navigate = useNavigate();

	const handleChangePage = (val:number) => {
		setCurrentPage(val)
	};

	const handleChangePageSize = (val:number) => {
		setPageSize(val)
		setCurrentPage(1)
	};
	useEffect(() => {
    if (currentPage) {
      if (coinPair == 'pc') {
        getList();
      } else if (coinPair.length == 41) {
        getTokenList();
      }
    }
	}, [currentPage]);
  const getList = () => {
    if (listType == 1) {
      toolGet(toolApi('/browser/home/hotToken'), {from: currentPage,amount: pageSize,version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
        if (res.errno == 200) {
          setTotal(res.data.total);
          if (res.data.list != null) {
            setList(res.data.list);
          }
        }
      })
    } else {
      toolGet(toolApi('/browser/home/trading_pair'), {from: currentPage,amount: pageSize,version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
        if (res.errno == 200) {
          setTotal(res.data.total);
          if (res.data.list != null) {
            setList1(res.data.list);
          } else {
            setList1([]);
          }
        }
      })
    }
  }
  const getTokenList = () => {
    toolGet(toolApi('/browser/token/trading_pair'), {token: coinPair,from: currentPage,amount: pageSize,version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
      if (res.errno == 200) {
        setTotal(res.data.total);
        if (res.data.list != null) {
          setList1(res.data.list);
        } else {
          setList1([]);
        }
      }
    })
  }
  const goLpDetail = (lp:string) => {
		navigate('/swap/detail/'+lp);
  }
  const goTokens = (token:string) => {
		navigate('/swap/token/'+token);
  }
	return (
		<div className='browser-list'>
      <div className="list-title">
        {listType==1?t('热门代币'):t('交易对')}
      </div>
      <div className="list-content">
        <div className="table-area">
          <div className="list-content-title">
            <div className="list-content-title-item"></div>
            <div className="list-content-title-item">{t('name')}</div>
            <div className="list-content-title-item">{t('liquidity')}</div>
            <div className="list-content-title-item">{t('turnover')} 24H</div>
            <div className="list-content-title-item">{listType == 1 ? t('browser-price') : t('turnover')+' 7D'}</div>
            {/* <div className="list-content-title-item">价格变化</div> */}
          </div>
          {
            listType == 1 && list.map((item, index) => 
              <div className="list-content-detail" key={index} onClick={() => goTokens(item.token)}>
                <div className="list-content-detail-item">
                <img src={item.logo} alt={item.name} />
                </div>
                <div className="list-content-detail-item">{item.name}</div>
                <div className="list-content-detail-item">$ {item.fluidity}</div>
                <div className="list-content-detail-item">$ {Number(item.turnover)}</div>
                <div className="list-content-detail-item">$ {item.price}</div>
                {/* <div className="list-content-detail-item">{item.change}%</div> */}
              </div>
            )}

          {
            listType != 1 && list1.map((item, index) => 
            <div className="list-content-detail" key={index} onClick={() => goLpDetail(item.lp)}>
              <div className="list-content-detail-item">
                <img src={item.token_0[0].logo} alt={item.token_0[0].name} />
                <img src={item.token_0[1].logo} alt={item.token_0[1].name} />
              </div>
              <div className="list-content-detail-item">{item.token_0[0].name}/{item.token_0[1].name}</div>
              <div className="list-content-detail-item">$ {item.fluidity}</div>
              <div className="list-content-detail-item">$ {item.turnover}</div>
              <div className="list-content-detail-item">$ {item.turnover_week}</div>
              {/* <div className="list-content-detail-item">{item.turnover}</div> */}
            </div>
           )}
          
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

export default ComponentBrowserList;

