import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Button, Input, Space, Affix } from 'antd';
import {Doughnut} from 'react-chartjs-2';
import './card.css';
import './sider.css';

const { Footer, Sider, Content, Header } = Layout;

class OverviewApp extends React.Component {
    constructor(props) {
        super(props);
        this.sidebarNoMargin = "0vw";
        let formattedData = this.breakdownStats(this.props.stats.tagCounts);
        console.log(formattedData)
        this.state = {
            sidebarLeftMargin: "22vw",
            data: {
                labels: formattedData.labels,
                datasets: [
                    {
                        label: 'My First dataset',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: formattedData.counts
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

    breakdownStats(data) {
        //from an object of the form
        // {"SPAC":7,"Fintech":3,"Healthcare":2,"Cannabis":1,"Deep Learning":3,"Biotech":1,"Machine Learning":1,"EV":2,"AI":1}
        //produce
        // {"labels": ["SPAC", "Fintech", "Healthcare"...], counts: [7, 3, 2, 1...]}
        let formattedData = {
            labels: [],
            counts: []
        };
        
        for (let tag of Object.keys(data)) {
            formattedData.labels.push(tag);
            formattedData.counts.push(data[tag]);
        }
        return formattedData;
    }

    render() {
        return (
            <div>
                <h1>Currently tracking {this.props.stats.ipoCount} IPOs</h1>
                <Doughnut data={this.state.data} />
                <Button onClick={this.props.swapOverviewCallback}>Swap</Button>
            </div>
        )
    }
}

export default OverviewApp;