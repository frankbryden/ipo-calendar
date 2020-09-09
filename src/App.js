import React from 'react';
import './App.css';
import 'antd/dist/antd.css';
import IpoApp from './IpoApp.js';
import OverviewApp from './OverviewApp.js';
import DataFetcher from './DataFetcher.js';
import Ipo from './Ipo.js';
import { LoadingOutlined } from '@ant-design/icons';

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
		this.cardsPerPage = this.determineInitialCardLoad();
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
		const iposData = await this.dataFetcher.fetchIpos(this.cardsPerPage);
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
								<IpoApp statusOpts={this.state.statusOpts} tags={this.state.tags} ipos={this.state.ipos} cardsPerPage={this.cardsPerPage} dataFetcher={this.dataFetcher} swapOverviewCallback={this.swapOverviewState} />
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