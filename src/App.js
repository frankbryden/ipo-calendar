import React from 'react';
import './App.css';
import 'antd/dist/antd.css';
import IpoApp from './IpoApp.js';
import OverviewApp from './OverviewApp.js';
import DataFetcher from './DataFetcher.js';
import Ipo from './Ipo.js';
import { LoadingOutlined } from '@ant-design/icons';

let ipos = {"ipos":[{"name":"KE Holdings Inc.","marketcap":"2.120.000.000,00 $","description":"Our Mission Admirable service, joyful living","tags":[],"status":"Priced","date":"08/13/2020"},{"name":"NetSTREIT Corp.","marketcap":"491.357.610,00 $","description":"We are an internally-managed real estate company that acquires, owns and manages a diversified portfolio of single-tenant, retail commercial real estate subject  to long-term net leases with high credit quality tenants across the United  States","tags":[{"name":"SPAC","keywords":["SPAC","blank check","acquisition"],"color":"#51bbfe"}],"status":"Priced","date":"08/13/2020"},{"name":"Harmony Biosciences Holdings, Inc.","marketcap":"1.259.610.800,00 $","description":"We are a commercial-stage pharmaceutical company focused on developing and commercializing innovative therapies for patients living with rare neurological disorders who have unmet medical needs","tags":[],"status":"Filed","date":"08/19/2020"},{"name":"Inhibrx, Inc.","marketcap":"570.473.696,00 $","description":"We are a clinical-stage biotechnology company with a pipeline of novel biologic therapeutic candidates, developed using our protein engineering expertise and proprietary single domain antibody, or sdAb, platform","tags":[{"name":"Biotech","keywords":["biotechnology","biotech"],"color":"#5EA570"}],"status":"Filed","date":"08/19/2020"},{"name":"Broadstone Acquisition Corp.","marketcap":"375.000.000,00 $","description":"We are a newly incorporated blank check company incorporated as a Cayman Islands exempted company and incorporated for the purpose of effecting a merger, share exchange, asset acquisition, share purchase, reorganization or similar business combination with one or more businesses","tags":[{"name":"SPAC","keywords":["SPAC","blank check","acquisition"],"color":"#51bbfe"}],"status":"Filed","date":"No date set"},{"name":"Prime Impact Acquisition I","marketcap":"375.000.000,00 $","description":"Prime Impact Acquisition I is a blank check company domiciled in the Cayman Islands whose business purpose is to effect a merger, capital stock exchange, asset acquisition, stock purchase, reorganization or similar business combination with one or more businesses","tags":[{"name":"SPAC","keywords":["SPAC","blank check","acquisition"],"color":"#51bbfe"}],"status":"Filed","date":"No date set"}]};
let status = [{"name":"Priced","color":"#d2fdff"},{"name":"Upcoming","color":"#3abeff"},{"name":"Filed","color":"#29bf12"}];
let tags = [{"name":"Fintech","keywords":["financial technology","fintech"],"color":"#f2dc5d"},{"name":"Machine Learning","keywords":["machine learning","ml"],"color":"#f2a359"},{"name":"Blockchain","keywords":["blockchain","ledger"],"color":"#db9065"},{"name":"Deep Learning","keywords":["deep learning","dl"],"color":"#a4031f"},{"name":"Cryptocurrency","keywords":["cryptocurrency","crypto","wallet"],"color":"#240b36"},{"name":"SPAC","keywords":["SPAC","blank check","acquisition"],"color":"#51bbfe"},{"name":"EV","keywords":["ev","electric vehicle"],"color":"#9055a2"},{"name":"Biotech","keywords":["biotechnology","biotech"],"color":"#5EA570"}];
//Hey max
class App extends React.Component {
	constructor() {
		super();
		this.swapOverviewState = this.swapOverviewState.bind(this);
        this.state = {
			loading: true,
			overview: false,
			ipos: []
		}
		this.dataToFetch = 1;
		this.dataFetcher = new DataFetcher();
		/*this.ipos = ipos;
		this.statusOpts = status;
		this.tags = tags;
        */
	}
	
	componentDidMount() {
		setTimeout(() => {
		   //this.fetchData();
		   //this.dataToFetch = 1;
		   //this.getIpos();
        }, 1);
        this.fetchData();
	}

	async fetchData() {
		this.dataToFetch = 4;
		this.getIpos();
		this.getStatusOpts();
		this.getTags();
		this.getStats();
	}

    async getIpos() {
		const iposData = await this.dataFetcher.fetchIpos(this.determineInitialCardLoad());
		console.log(iposData);
        let ipoObjs = iposData.ipos.map(ipo => new Ipo(ipo));
		this.ipos = ipoObjs;//ipoComponents;
		this.dataReceived();
	}

	determineInitialCardLoad() {
		let height = window.innerHeight;
		let width = window.innerWidth; // as a user can minimize sider instantly we cannot calculate this depending on sider size
		let card_height = 250;
		let card_width = 400;
		let height_ratio = height / card_height; //there is a gap between cards I'm going to disregard now.
		let width_ratio = width / card_width;
		return height_ratio * width_ratio
	}
	
	async getStatusOpts() {
		this.statusOpts = await this.dataFetcher.fetchStatusOpts();
		console.log(this.statusOpts);
		this.dataReceived();
	}

	async getTags() {
		this.tags = await this.dataFetcher.fetchTags();
		this.dataReceived();
	}

	async getStats() {
		this.stats = await this.dataFetcher.fetchStats();
		this.dataReceived();
	}

	dataReceived() {
		this.dataToFetch--;
		console.log(`Data received! ${this.dataToFetch} to go!`);
		if (this.dataToFetch == 0) {
			console.log("Setting state...")
			console.log(this.statusOpts);
			this.setState({ 
				loading: false,
				ipos: this.ipos,
				statusOpts: this.statusOpts,
				tags: this.tags,
				stats: this.stats
			});
		} else {
			console.log(`${this.dataToFetch} == ${0} -> ${this.dataToFetch == 0}`)
		}
	}

	swapOverviewState() {
		console.log("Swap!")
		this.setState({
			overview: !this.state.overview
		});
	}

	render() {
		return (
			<div className="App">
				{this.state.loading ?
					
					<div className="loadingScreen">
						<div className="logo">IPO<span>c</span> <br></br><LoadingOutlined/></div>	
					</div> :
					<div>

						{this.state.overview ?
							<div>
								<OverviewApp stats={this.state.stats} tags={this.state.tags} ipos={this.state.ipos} swapOverviewCallback={this.swapOverviewState} />
							</div> :
							<div>
								<IpoApp statusOpts={this.state.statusOpts} tags={this.state.tags} ipos={this.state.ipos} dataFetcher={this.dataFetcher} swapOverviewCallback={this.swapOverviewState} />
							</div>
						}
					</div>
				}

			</div>
		)
	}
}

export default App;

/*
{
  "name": String,
  "market-cap": int,
  "description": string
  "tags": [Tags],
  "status": [Status]
}

{
  "ipos": [IpoInfo]
}

{
  "status"
}
*/