import React from 'react';
import 'antd/dist/antd.css';
import { Layout } from 'antd';
import FilterSelector from './FilterSelector';
import './card.css'

const { Footer, Sider, Content } = Layout;

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
                    <Sider 
                    width='20vw' 
                    breakpoint='lg'
                    collapsedWidth="0">
                        <FilterSelector items={["hey", "hi", "salut", "yo", "coucou"]} />
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