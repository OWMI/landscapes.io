
import cx from 'classnames'
import { Tabs, Icon } from 'antd'
import { Loader } from '../../components'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'

const TabPane = Tabs.TabPane

class Deployments extends Component {

    state = {
        animated: true,
        viewEntersAnim: true
    }

    componentDidMount() {
        const { enterLandscapes } = this.props
        enterLandscapes()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }

    render() {
        const { animated, viewEntersAnim } = this.state
        const { loading, landscapes } = this.props

        // if (this.props.landscapes) {
        //     console.log('%c landscapes ', 'background: #1c1c1c; color: deeppink', landscapes)
        // }

        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>

                <a onClick={this.handlesCreateLandscapeClick}>
                    <Icon style={{ fontSize: '20px' }} type='plus'/>
                </a>
                <h2>Deployments</h2>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Template" key="1">Content of Tab Pane 1</TabPane>
                    <TabPane tab="Resources" key="2">Content of Tab Pane 2</TabPane>
                    <TabPane tab="Parameters" key="3">Content of Tab Pane 3</TabPane>
                    <TabPane tab="Mappings" key="4">Content of Tab Pane 3</TabPane>
                    <TabPane tab="Deployments" key="5">Content of Tab Pane 3</TabPane>
                </Tabs>
            </div>
        )
    }

    handlesCreateLandscapeClick = event => {
        const { router } = this.context
        router.push({ pathname: '/landscapes/create' })
    }

    handlesLandscapeClick = event => {
        const { router } = this.context
        router.push({ pathname: '/protected' })
    }
}

Deployments.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

Deployments.contextTypes = {
    router: PropTypes.object
}

export default Deployments
