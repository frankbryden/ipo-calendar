import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Button, Input, Space, Affix, Switch } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, SearchOutlined, CalculatorFilled } from '@ant-design/icons';
import FilterSelector from './FilterSelector';
import IpoCard from './IpoCard';
import Ipo from './Ipo.js';
import './card.css';
import './sider.css';
import { motion, AnimateSharedLayout } from 'framer-motion';

const { Footer, Sider, Content, Header } = Layout;
const IPOS_PER_PAGE = 20;

class IpoApp extends React.Component {
    constructor(props) {
        super(props);
        this.statusFilterChange = this.statusFilterChange.bind(this);
        this.tagFilterChange = this.tagFilterChange.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.saveIPOLocally = this.saveIPOLocally.bind(this);
        this.toggleVisibilitySavedIPOs = this.toggleVisibilitySavedIPOs.bind(this);
        this.toggleMinimizedCards = this.toggleMinimizedCards.bind(this);
        this.trackScrolling = this.trackScrolling.bind(this);
        this.unlockIpoFetching = this.unlockIpoFetching.bind(this);
        this.sidebarNoMargin = "0vw";
        this.state = {
            loading: true,
            ipos: this.getImportedIPOs(this.props.ipos),
            sidebarLeftMargin: "22vw",
            collapsed: false,
            tagFilters: [],
            statusFilters: [],
            showOnlySaved: false,
            searchValue: "",
            showCardsMinimized: true,
            fetchedAllData: false
        }
        this.ipoFetchingLocked = false;
    }

    addIpos(ipos) {
        let stateIpos = this.state.ipos;
        stateIpos.push(...this.getImportedIPOs(ipos));
        this.setState({
            ipos: stateIpos
        });
        this.applySavedIPOs();
    }

    filterExistingIPOs(ipos) {
        if (!this.state) {
            return ipos;
        }
        console.log(`Started with ${ipos.length} ipos`);
        let filtered = ipos.filter(ipo => {
            for (let loadedIpo of this.state.ipos) {
                if (loadedIpo.ipo.id == ipo.id) {
                    return false;
                } else {
                    console.log(`${loadedIpo.ipo.id} == ${ipo} -> ${loadedIpo.ipo.id == ipo}`)
                }
            }
            return true;
        });
        return filtered;
    }

    getImportedIPOs(ipos) {
        console.log("getImportedIPOs");
        console.log(ipos);
        ipos = this.filterExistingIPOs(ipos);
        let lastIndex = this.state == undefined ? 0 : (this.state.ipos[this.state.ipos.length - 1].cardId + 1);
        return ipos.map((ipo, index) => {
            return {
                ipo: new Ipo(ipo),
                cardId: lastIndex + index,
                tags: ipo.tags.map(tag => tag.name),
                status: ipo.status,
                visible: true,
                saved: false,
            }
        });
    }

    unlockIpoFetching(){
        this.ipoFetchingLocked = false;
    }

    toggleSidebar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }


    tagFilterChange(filter, toggle) {
        //toggle = true means filter was added
        let tagFilters = this.state.tagFilters;
        if (toggle) {
            tagFilters.push(filter);
        } else {
            tagFilters.splice(tagFilters.indexOf(filter), 1);
        }
        let self = this;
        this.props.dataFetcher.fetchIpos(-1, undefined, undefined, tagFilters).then(ipos => {
            self.addIpos(ipos.ipos);
        });

        this.setState({
            tagFilters: tagFilters
        });
    }

    statusFilterChange(filter, toggle) {
        //toggle = true means filter was added
        let statusFilters = this.state.statusFilters;
        if (toggle) {
            statusFilters.push(filter);
        } else {
            statusFilters.splice(statusFilters.indexOf(filter), 1);
        }
        this.setState({
            statusFilters: statusFilters
        });
    }

    toggleVisibilitySavedIPOs() {
        if (!this.state.showOnlySaved) {
            let self = this;
            this.props.dataFetcher.fetchIpos(-1, undefined, Object.keys(localStorage)).then(ipos => {
                console.log(ipos);
                self.addIpos(ipos.ipos);
            });
        }
        this.setState({
            showOnlySaved: !this.state.showOnlySaved
        });
    }

    toggleMinimizedCards() {
        this.setState({
            showCardsMinimized: !this.state.showCardsMinimized
        })
    }

    determineIPOVisibility(ipo) {
        let includeStatusFilters = this.state.statusFilters.length > 0;
        let includeTagFilters = this.state.tagFilters.length > 0;
        let includeSearch = this.state.searchValue.length > 0;

        let visible = true;

        if (this.state.showOnlySaved) {
            if (!ipo.saved) {
                visible = false;
            }
        }

        if (includeStatusFilters) {
            if (!this.state.statusFilters.includes(ipo.status)) {
                visible = false;
            }

        }
        if (includeTagFilters) {
            if (!ipo.tags.map(tag => this.state.tagFilters.includes(tag)).includes(true)) {
                visible = false;
            }
        }
        if (includeSearch) {
            let companyName = ipo.ipo.name.toLowerCase();
            if (!companyName.includes(this.searchValue)) {
                visible = false;
            } 

            let ticker = ipo.ipo.ticker.toLowerCase(); //beta version
            if (ticker.includes(this.searchValue)) {
                visible = true;
            } 
        }

        return visible;
    }

    saveIPOLocally(id) {
        console.log(`Save ipo with id ${id}`);
        let ipos = this.state.ipos;
        let savedItem;
        for (let item of ipos) {
            if (item.cardId == id) {
                savedItem = item
            }
        }
        savedItem.saved = !savedItem.saved


        //As Max pointed out, to save we simply need to store the dealIds.
        //I do not have that information for now, so off to bed....
        if (savedItem.saved) {
            //save
            localStorage.setItem(savedItem.ipo.id, "")
        } else {
            //unsave
            localStorage.removeItem(savedItem.ipo.id, "")
        }
        this.setState({ ipos: ipos });
    }

    filterBySearch(input) {
        let self = this;
        this.props.dataFetcher.fetchIpos(-1, input, undefined).then(ipos => {
            self.addIpos(ipos.ipos);
        });
        this.setState({
            "searchValue": input
        });
        this.searchValue = input;
    }

    componentDidMount() {
        this.handleResize();
        window.addEventListener("resize", () => this.handleResize());
        document.addEventListener('scroll', this.trackScrolling);

        this.applySavedIPOs();
    }

    applySavedIPOs() {
        //Handle saved IPOs
        let ipos = this.state.ipos;
        for (let ipo of ipos) {
            if (localStorage.getItem(ipo.ipo.id) != null) {
                ipo.saved = true
            }
        }
        this.setState({ ipos: ipos });
    }

    isBottom(el) {
        return el.getBoundingClientRect().bottom-5 <= window.innerHeight;
    }


    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
    }

    trackScrolling() {
        const wrappedElement = document.getElementById('ipoBody');
        if (!this.ipoFetchingLocked && !this.state.fetchedAllData && this.isBottom(wrappedElement)) {
            console.log('header bottom reached');
            let self = this;
            //lock fetching of IPOs, this is needed as this event fires multiple times for one scroll-to-bottom.
            //So lock temporarily, letting a timeout unlock it.
            this.ipoFetchingLocked = true;
            setTimeout(this.unlockIpoFetching, 1000);
            this.props.dataFetcher.fetchIpos(10).then(ipos => {
                console.log(ipos);
                if (ipos.isEnd) {
                    self.setState({fetchedAllData: true});
                }
                self.addIpos(ipos.ipos);
            });
            //document.removeEventListener('scroll', this.trackScrolling);
        }
    }

    handleResize() {
        if (window.innerWidth < 1200) {
            this.setState({ sidebarLeftMargin: "32vw" })
            this.handleMobile()
        } if (window.innerWidth >= 1200) {
            this.setState({ sidebarLeftMargin: "22vw" })
        }
    }

    handleMobile() {
        if (window.innerWidth <= 768) {
            this.setState({ collapsed: true, sidebarLeftMargin: "90vw" });
        } else {
            this.setState({ collapsed: false });
        }
    }

    render() {
        return (
            <div>
                <Layout>
                    <Sider
                        width={this.state.sidebarLeftMargin}
                        bordered={false}
                        breakpoint='sm'
                        onBreakpoint={() => this.handleMobile()}
                        trigger={null}
                        collapsed={this.state.collapsed}
                        collapsible collapsedWidth="0vw"
                        style={{
                            position: 'fixed',
                            overflow: 'scroll',
                            height: "100%",
                            left: 0,
                        }}>
                        <MenuFoldOutlined
                            style={{
                                color: "white", position: "fixed", fontSize: "2rem",
                                left: this.state.collapsed ? -50 : `calc(${this.state.sidebarLeftMargin} - 50px)`,
                                top: 10, zIndex: 2
                            }}
                            onClick={() => this.toggleSidebar()} />

                        <div onClick={this.props.swapOverviewCallback} className="logo">IPO
                            <span>c</span></div>
                        
                        <div>
                            <p className="siteDescription">Discover and track the newest IPOs</p>
                        </div>

                        <Space>
                            <Input
                                placeholder="Search IPOs"
                                onInput={value => this.filterBySearch(value.target.value.toLowerCase())}
                                value={this.searchValue}
                                style={{ width: "80%", margin: 10 }}>
                            </Input>
                        </Space>
                        
                        <Card title="Filters" className="filterContainer" bordered={false}>

                            <div className="sliderWrapper">
                                <span>Show Saved</span>
                                <Switch onChange={this.toggleVisibilitySavedIPOs}></Switch>
                                <span>Expand Cards</span>
                                <Switch onChange={this.toggleMinimizedCards}></Switch>
                            </div>

                            <Card title="Tags" className="filter" bordered={false}>
                                <FilterSelector items={this.props.tags} needColor={true} filterChangeCallback={this.tagFilterChange} />
                            </Card>
                            <Card title="Status" className="filter" bordered={false}>
                                <FilterSelector items={this.props.statusOpts} needColor={false} filterChangeCallback={this.statusFilterChange} />
                            </Card>

                        </Card>
                        <div>
                            <p className="credits">Made by Frank Bryden and Maximilian von Bonsdorff</p>
                        </div>    
                    </Sider>
                    <Layout className="site-layout" style={{ marginLeft: this.state.collapsed ? this.sidebarNoMargin : this.state.sidebarLeftMargin }}>
                        {this.state.collapsed ?
                            <Affix>
                                <Header style={{ backgroundColor: "black" }}>
                                    <MenuUnfoldOutlined style={{ color: "white", fontSize: "2rem", position: "fixed", left: 10, top: 15 }}
                                        onClick={() => this.toggleSidebar()} />
                                    <div className="logo">IPO<span>c</span></div>
                                </Header></Affix> : <></>}

                        <Content id="ipoBody" style={{ margin: '0px 0px 0', overflow: 'initial' }}>
                            {this.state.ipos.filter(ipo => ipo.visible).length > 0 ?
                                <div className="content-wrapper">
                                    {this.state.ipos.reduce((acc, ipo, index) => {
                                        if (this.determineIPOVisibility(ipo) && acc.length < IPOS_PER_PAGE) { acc.push(<IpoCard key={index} cardId={ipo.cardId} minimized={this.state.showCardsMinimized} saved={ipo.saved} ipo={ipo.ipo} onSave={this.saveIPOLocally} />) }
                                        return acc
                                    }, [])}
                                </div> :
                                <div className="noContent">
                                    <span>Nothing matched your search!</span>
                                </div>
                            }

                        </Content>
                        
                        {/* <Footer style={{ minHeight: "5vh" }}>Footer</Footer> */}
                        
                        
                    </Layout>
                </Layout>

            </div>
        )
    }
}

export default IpoApp;