import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Button } from 'antd';
import FilterSelector from './FilterSelector';

const { Header, Footer, Sider, Content } = Layout;

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
                    <Sider width={300}>
                        <Card title="Filters">
                            <Card title="Tags">
                                <FilterSelector height={400} items={this.props.tags} />
                            </Card>
                            <Card title="Status">
                                <FilterSelector height={400} items={this.props.statusOpts} />
                            </Card>

                        </Card>
                        <Button onClick={() => this.toggleSidebar()}>Toggle</Button>
                    </Sider>
                    <Layout>
                        <Header>IPOs</Header>
                        <Content>
                            <div>
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