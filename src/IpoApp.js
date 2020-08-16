import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Button } from 'antd';
import FilterSelector from './FilterSelector';
import './card.css';
import './sider.css';

const { Footer, Sider, Content } = Layout;

class IpoApp extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            ipos: [],
            collapsed: false
        }
    }

    toggleSidebar() {
        console.log("toggleee");
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        return (
            <div>
                <Layout trigger={null} collapsible collapsed={this.state.collapsed}>
                    <Sider 
                        width='22vw'
                        breakpoint='lg'
                        collapsedWidth="0">
                        <Card title="Filters" className="filterContainer">
                            <Card title="Tags" className="filter">
                                <FilterSelector height={400} items={this.props.tags}/>
                            </Card>
                            <Card title="Status" className="filter">
                                <FilterSelector height={400} items={this.props.statusOpts} />
                            </Card>

                        </Card>
                        <Button onClick={() => this.toggleSidebar()}>Toggle</Button>
                    </Sider>
                    <Layout>
                        <Content>
                            <div className="content-wrapper">
                                {this.props.ipos}
                            </div>
                        </Content>
                        <Footer>Footer</Footer>
                    </Layout>
                </Layout>

            </div>
        )
    }
}

export default IpoApp;