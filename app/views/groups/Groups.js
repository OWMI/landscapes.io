
import cx from 'classnames'
import { IoEdit, IoLoadC, IoIosPlusEmpty } from 'react-icons/lib/io'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { Row, Col } from 'react-flexbox-grid'
import { Paper , CardHeader, CardActions, CardText, FlatButton } from 'material-ui'

import { Loader } from '../../components'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { auth } from '../../services/auth'
import defaultImage from '../../style/empty-group.png'

import '../landscapes/landscapes.style.scss'
import materialTheme from '../../style/custom-theme.js';

class Groups extends Component {

    state = {
        animated: true,
        viewEntersAnim: true
    }

    componentDidMount() {
        const { enterGroups } = this.props
        enterGroups()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveGroups } = this.props
        leaveGroups()
    }

    render() {
        const { animated, viewEntersAnim } = this.state
        const { loading, groupsByUser } = this.props
        let stateGroups = groupsByUser || []
        const user = auth.getUserInfo();

        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <a onClick={this.handlesCreateGroupClick}>
                    <p style={{ fontSize: '20px', cursor: 'pointer' }}><IoIosPlusEmpty size={30}/>Add Group</p>
                </a>

                <ul>
                {
                    stateGroups.map((group, i) =>

                    <Paper key={i} className={cx({ 'landscape-card': true })} style={{backgroundColor: materialTheme.palette.primary3Color}} zDepth={3} rounded={false} onClick={this.handlesGroupClick.bind(this, group)}>
                            {/* header */}
                            <Row start='xs' middle='xs' style={{ padding: '20px 0px' }}>
                                <Col xs={8}>
                                    <img id='landscapeIcon' src={group.imageUri} style={{width:85}}/>
                                </Col>
                                <Col xs={4}>
                                    <FlatButton id='landscape-edit' onTouchTap={this.handlesEditGroupClick.bind(this, group)}
                                        label='Edit' labelStyle={{ fontSize: '10px' }} icon={<IoEdit/>}/>
                                      <div style={{height:35}}></div>
                                </Col>
                            </Row>
                            <Row style={{ margin: '0px 20px', height: '95px' }}>
                                <div id='landscape-title'>{group.name}</div>
                                {
                                  group.description.length > 120
                                    ?
                                    <div id='landscape-description'>{group.description.substr(0, 120) + '...'}</div>
                                    :
                                    <div id='landscape-description'>{group.description}</div>
                                }
                            </Row>
                    </Paper>)
                }
                </ul>
            </div>
        )
    }

    handlesCreateGroupClick = event => {
        const { router } = this.context
        router.push({ pathname: '/groups/create' })
    }

    handlesEditGroupClick = (group, event) => {
        const { router } = this.context
        router.push({ pathname: '/groups/edit/' + group._id })
    }

    handlesGroupClick = (group, event) => {
        const { router } = this.context
        router.push({ pathname: '/groups/' + group._id })
    }
}

Groups.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterGroups: PropTypes.func.isRequired,
    leaveGroups: PropTypes.func.isRequired
}

Groups.contextTypes = {
    router: PropTypes.object
}

export default Groups
