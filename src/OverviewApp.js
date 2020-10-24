import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Button, Input, Space, Affix } from 'antd';
import {Doughnut, Bar} from 'react-chartjs-2';
import './card.css';
import './sider.css';
import './overview.css';
import Title from 'antd/lib/skeleton/Title';

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

const stringFormat = {
    scales: {
        xAxes: [{  // for the months
            ticks: {
            callback(value) {
                const monthNames = ["January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"];
                let date = value.split("/");
                let datetest = new Date();
                datetest.setMonth(date[0] - 1);
                return monthNames[datetest.getMonth()].substr(0, 3) + " " + date[1].substr(2, 4);

            }
        }
        }],
        yAxes: [{
            ticks: {
                min: 0,
                callback(value) {
                    return "$ " + (value / 1000000000).toLocaleString() + "B"
                }
            }
        }],
    },
    tooltips: {
        callbacks: {
            label: function(value) {
                return "$ " + (value.value / 1000000000).toLocaleString() + "B"
            },
        }
    }
};

class OverviewApp extends React.Component {
    constructor(props) {
        super(props);
        this.sidebarNoMargin = "0vw";
        let formattedData = this.breakdownStats(this.props.stats.tagCounts, this.props.tags);
        let formattedMarketcapData = this.breakdownMarketcap(this.props.stats.marketcapData);
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
                labels: formattedMarketcapData.labels,
                datasets: [
                  {
                    label: 'Sum',
                    backgroundColor: 'rgba(255,99,132,0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 3,
                    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                    hoverBorderColor: 'rgba(255,99,132,1)',
                    data: formattedMarketcapData.sum, 
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

    breakdownMarketcap(data) {
        //from an object of the form
        // {"09/2020": 12388501, "08/2020": 192439}
        //produce
        // {"Sep 20": 12388501, "Aug 20": 192439}
        let formattedData = {
            labels: [],
            sum: []
        }
        let currentDate = new Date();
        for (let i = 6; i > -1; i--) {
            let previousDate = new Date();
            previousDate.setMonth(currentDate.getMonth() - i);
            let month = String(previousDate.getMonth() + 1).padStart(2, "0");
            let year = previousDate.getFullYear();
            if (data[month + "/" + year]) {
                formattedData.labels.push(month + "/" + year);
                formattedData.sum.push(data[month + "/" + year]);
            }
        }
        return formattedData;

    }

    render() {
        return (  
        <div>
            <Header className="statHeader">
                <div className="logo" style={{ color: "white", position: "fixed", fontSize: "3rem", left: 35, top: 10}}onClick={this.props.swapOverviewCallback}>&lt; Go Bac<span>c</span></div>
            </Header>
            <div className="statpage">       
                <div className="overview">
                    <h1 className="headline">Currently tracking {this.props.stats.ipoCount} IPOs</h1>
                    <Doughnut data={this.state.data} legend={this.state.legend} height={70} width={50}/>
                </div>
                
                <div className="overview">
                    <h1 className="headline">Total market cap priced in over time</h1>
                    <Bar data={this.state.marketCapData} options={stringFormat} height={60} width={50}/>
                </div>
            </div>
        </div>
        )
    }
}

export default OverviewApp;