import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Button, Input, Space, Affix } from 'antd';
import {Doughnut, Bar} from 'react-chartjs-2';
import './card.css';
import './sider.css';
import './overview.css';

const { Footer, Sider, Content, Header } = Layout;
const legendOpts = {
    display: true,
    position: 'bottom',
    fullWidth: true,
    reverse: false,
    labels: {
      fontColor: 'rgb(255, 99, 132)'
    }
};

class OverviewApp extends React.Component {
    constructor(props) {
        super(props);
        this.sidebarNoMargin = "0vw";
        let formattedData = this.breakdownStats(this.props.stats.tagCounts, this.props.tags);
        console.log("yo")
        console.log(this.props.stats.marketcapData);
        this.state = {
            sidebarLeftMargin: "22vw",
            legend: legendOpts,
            data: {
                labels: formattedData.labels,
                datasets: [
                    {
                        label: 'My First dataset',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        backgroundColor: formattedData.colors,
                        borderWidth: 0,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: formattedData.counts
                    }
                ]
            },
            marketCapData: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', "June", "August", "September", "October", "November", "December"],
                datasets: [
                  {
                    label: 'Sum',
                    backgroundColor: 'rgba(255,99,132,0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                    hoverBorderColor: 'rgba(255,99,132,1)',
                    data: this.props.stats.marketcapData,
                  }
                ]
            }
        }
    }

    componentDidMount() {
        this.handleResize();
        window.addEventListener("resize", () => this.handleResize());

    }

    handleResize() {
        if (window.innerWidth < 1200) {
            this.setState({sidebarLeftMargin: "32vw"})
            this.handleMobile()
        } if (window.innerWidth >= 1200) {
            this.setState({sidebarLeftMargin: "22vw"})
        }
    }
    
    handleMobile() {
        if (window.innerWidth <= 768) {
            this.setState({collapsed: true, sidebarLeftMargin: "90vw"});
        } else {
            this.setState({collapsed: false});
        }
    }

    breakdownStats(data, tags) {
        //from an object of the form
        // {"SPAC":7,"Fintech":3,"Healthcare":2,"Cannabis":1,"Deep Learning":3,"Biotech":1,"Machine Learning":1,"EV":2,"AI":1}
        //produce
        // {"labels": ["SPAC", "Fintech", "Healthcare"...], counts: [7, 3, 2, 1...], colors: ['red', 'blue'...]}
        let formattedData = {
            labels: [],
            counts: [],
            colors: [],
        };
        
        for (let tag of Object.keys(data)) {
            formattedData.labels.push(tag);
            formattedData.counts.push(data[tag]);
            for (let tagObj of tags) {
                if (tagObj.name == tag) {
                    formattedData.colors.push(tagObj.color);
                    break;
                }
            }
        }
        return formattedData;
    }

    render() {
        return (
            <div className="statpage">
                <div className="overview">
                    <h1 className="headline">Currently tracking {this.props.stats.ipoCount} IPOs</h1>
                    <Doughnut data={this.state.data} width={50} height={50} options={{cutoutPercentage: 50}} legend={this.state.legend}/>
                </div>
                
                <div className="overview">
                    <h1 className="headline">Total market cap priced in over time</h1>
                    <Bar data={this.state.marketCapData} width={50} height={50}/>
                </div>

                <div className="overview">
                    <h1 className="headline">Currently tracking {this.props.stats.ipoCount} IPOs</h1>
                    <Doughnut data={this.state.data} width={50} height={50}  options={{cutoutPercentage: 0}} legend={this.state.legend}/>
                    <Button onClick={this.props.swapOverviewCallback}>Swap</Button>
                </div>
            </div>
        )
    }
}

export default OverviewApp;