import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'antd/dist/antd.css';
import IpoApp from './IpoApp.js';
import DataFetcher from './DataFetcher.js';
import Ipo from './Ipo.js';
import IpoCard from './IpoCard';
import { LoadingOutlined } from '@ant-design/icons';



//Hey max
class App extends React.Component {
	constructor() {
        super();
        this.state = {
            loading: true,
            ipos: []
		}
		this.dataToFetch = 0;
        this.dataFetcher = new DataFetcher();
        
	}
	
	componentDidMount() {
		setTimeout(() => {
           this.fetchData();
        }, 2000);
        //this.getIpos();
	}

	async fetchData() {
		this.getIpos();
		this.dataToFetch++;
		this.getStatusOpts();
		this.dataToFetch++;
		this.getTags();
		this.dataToFetch++;
	}

    async getIpos() {
        const iposData = await this.dataFetcher.fetchIpos();
        let ipoObjs = iposData.ipos.map(ipo => new Ipo(ipo));
        let ipoComponents = ipoObjs.map((ipoObj, index) => <IpoCard key={index} ipo={ipoObj} />);
		this.ipos = ipoComponents;
		this.dataReceived();
	}
	
	async getStatusOpts() {
		this.statusOpts = await this.dataFetcher.fetchStatusOpts();
		this.dataReceived();
	}

	async getTags() {
		this.tags = await this.dataFetcher.fetchTags();
		this.dataReceived();
	}

	dataReceived() {
		this.dataToFetch--;
		console.log(`Data received! ${this.dataToFetch} to go!`);
		if (this.dataToFetch == 0) {
			console.log("Setting state...")
			this.setState({ 
				loading: false,
				ipos: this.ipos,
				statusOpts: this.statusOpts,
				tags: this.tags
			});
		} else {
			console.log(`${this.dataToFetch} == ${0} -> ${this.dataToFetch == 0}`)
		}
	}

	render() {
		return (
			<div className="App">
				{this.state.loading ?
					<div> <LoadingOutlined /> Loading </div> :

					<div>
						<IpoApp statusOpts={this.state.statusOpts} tags={this.state.tags} ipos={this.state.ipos} />
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