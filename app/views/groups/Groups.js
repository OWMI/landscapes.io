
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
        const { loading, groups } = this.props
        console.log('GROUPS - ', groups)

        let stateGroups = groups || []
        const user = auth.getUserInfo();

        if(user.role !== 'admin'){
          if(groups){
            stateGroups = []
            groups.map(group => group.users.map(user => {
              console.log('userID', user.userId)
              if(user.userId === auth.getUserInfo()._id){
                if(!group.imageUri)
                group.imageUri = defaultImage;
                stateGroups.push(group)
              }
              })
            )
          // viewLandscapes.filter(landscape)
            console.log('stateGroups', stateGroups)
          }
        }
        else{
          stateGroups.map(group => {
            if(!group.imageUri){
              group.imageUri = defaultImage;
            }
          })
        }



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
                    <p style={{ fontSize: '20px' }}><IoIosPlusEmpty size={30}/>Add Group</p>
                </a>

                <ul>
                {
                    stateGroups.map((group, i) =>

                    <Paper key={i} className={cx({ 'landscape-card': true })} zDepth={3} rounded={false} onClick={this.handlesGroupClick.bind(this, group)}>
                            {/* header */}
                            <Row start='xs' middle='xs' style={{ padding: '20px 0px' }}>
                                <Col xs={4}>
                                    <img id='landscapeIcon' src={group.imageUri} style={{width:50, borderRadius:50}}/>
                                </Col>
                                <Col xs={4}>
                                    <span>{group.name}</span><br/>
                                </Col>
                                <Col xs={4}>
                                    <FlatButton id='landscape-edit' onTouchTap={this.handlesEditGroupClick.bind(this, group)}
                                        label='Edit' labelStyle={{ fontSize: '10px' }} icon={<IoEdit/>}/>
                                </Col>
                            </Row>

                            <CardText id="landscape-description" style={{ fontSize: '12px' }}>
                              {group.description}
                            </CardText>
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
