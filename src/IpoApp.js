import React from 'react';
import 'antd/dist/antd.css';
import { Layout } from 'antd';

const { Header, Footer, Sider, Content } = Layout;

class IpoApp extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            ipos: []
        }
    }

    render() {
        return (
            <div>
                <Layout>
                    <Sider>
                        
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