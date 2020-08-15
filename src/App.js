import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'antd/dist/antd.css';
import IpoApp from './IpoApp.js';
import IpoFetcher from './IpoFetcher.js';
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
        this.ipoFetcher = new IpoFetcher();
        setTimeout(() => {
            this.getIpos()
        }, 2000);
        //this.getIpos();
    }

    async getIpos() {
        const iposData = await this.ipoFetcher.fetchIpos();
        console.log(iposData)
        let ipoObjs = iposData.ipos.map(ipo => new Ipo(ipo));
        let ipoComponents = ipoObjs.map(ipoObj => <IpoCard ipo={ipoObj} />);
        this.setState({ loading: false, ipos: ipoComponents });
    }
	render() {
		return (
			<div className="App">
				{this.state.loading ?
					<div> <LoadingOutlined /> Loading </div> :

					<div>
						<IpoApp ipos={this.state.ipos} />
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