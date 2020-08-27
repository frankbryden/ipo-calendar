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
        this.state = {
            sidebarLeftMargin: "22vw",
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                    {
                        label: 'My First dataset',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: [65, 59, 80, 81, 56, 55, 40]
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

    render() {
        return (
            <div>
                <Doughnut data={this.state.data} />
                <Button onClick={this.props.swapOverviewCallback}>Swap</Button>
            </div>
        )
    }
}

export default OverviewApp;