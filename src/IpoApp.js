import React from 'react';
import 'antd/dist/antd.css';
import { Layout } from 'antd';
import FilterSelector from './FilterSelector';

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
                        <FilterSelector items={["hey", "hi", "salut", "yo", "coucou"]} />
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