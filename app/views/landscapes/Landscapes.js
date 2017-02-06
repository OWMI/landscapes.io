import cx from 'classnames'
import axios from 'axios'
import { compact, findIndex } from 'lodash'
import { Row, Col } from 'react-flexbox-grid'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit, IoIosCloudUploadOutline, IoIosPlusEmpty } from 'react-icons/lib/io'
import { Paper , CardHeader, CardActions, CardText, FlatButton } from 'material-ui'

import './landscapes.style.scss'
import { Loader } from '../../components'
import { auth } from '../../services/auth'

class Landscapes extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        viewLandscapes: []
    }

    componentDidMount() {
        const { enterLandscapes } = this.props
        enterLandscapes()
    }

    componentWillReceiveProps(nextProps) {
        const self = this
        const { landscapes } = nextProps
        let _viewLandscapes = landscapes || []

        let runningStatus = ['CREATE_COMPLETE', 'ROLLBACK_COMPLETE', 'ROLLBACK_COMPLETE', 'DELETE_COMPLETE', 'UPDATE_COMPLETE', 'UPDATE_ROLLBACK_COMPLETE']
        let pendingStatus = ['CREATE_IN_PROGRESS', 'ROLLBACK_IN_PROGRESS', 'DELETE_IN_PROGRESS', 'UPDATE_IN_PROGRESS', 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS', 'UPDATE_ROLLBACK_IN_PROGRESS', 'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS', 'REVIEW_IN_PROGRESS']

        function StatusModel() {
            this.pending = 0
            this.running = 0
            this.failed = 0
            this.deleted = 0
        }

        /////////// STATUS ////////////
        // if (_viewLandscapes.length > 1 && 'status' in _viewLandscapes[0]) {
        if (_viewLandscapes.length) {

            let landscapesDetails = []

            // instantiate statuses
            _viewLandscapes.forEach(landscape => {
                landscape.status = new StatusModel()
            })

            // create promise array to gather all deployments
            let _promises = _viewLandscapes.map((landscape, index) => {
                return new Promise((resolve, reject) => {
                    axios.get(`http://localhost:8080/api/landscapes/${landscape._id}/deployments`).then(res => {
                        resolve(res.data)
                    }).catch(err => {
                        console.log(err)
                        reject(err)
                    })
                })
            })

            Promise.all(_promises).then(landscapes => {

                landscapesDetails = landscapes

                // count deleted/purged/failed landscapes
                landscapes.forEach((landscape, i) => {
                    landscape.forEach(deployment => {
                        if (deployment && deployment.isDeleted) {
                            _viewLandscapes[i].status.deleted++
                        } else if (deployment && deployment.awsErrors) {
                            _viewLandscapes[i].status.failed++
                        }
                    })
                })

                // gather status for other landscapes
                let _promises = []

                let _promiseAll = landscapes.map((landscape, x) => {
                    if (landscape.length) {
                        _promises[x] = landscape.map(stack => {
                            if (!stack.isDeleted && !stack.awsErrors) {
                                return new Promise((resolve, reject) => {
                                    axios.get(`http://localhost:8080/api/deployments/describe/${stack.stackName}/${stack.location}/${stack.accountName}`)
                                    .then(res => {
                                        console.log(res)
                                        resolve(res.data)
                                    }).catch(err => {
                                        console.log(err)
                                        reject(err)
                                    })
                                })
                            }
                            return []
                        })
                        return Promise.all(_promises[x])
                    }
                    return []
                })

                return Promise.all(_promiseAll)

            }).then(landscapesStatus => {

                // flatten deployments in landscapesStatus
                landscapesStatus = landscapesStatus.map(stack => {
                    return compact(stack.map(dep => {
                        return (dep && dep.Stacks) ? dep.Stacks[0] : {}
                    }))
                })

                // loop through each deployment and increment the running/pending statuses
                landscapesStatus.forEach((ls, index) => {
                    ls.forEach(deployment => {
                        if (runningStatus.indexOf(deployment.StackStatus) > -1) {
                            _viewLandscapes[index].status.running++
                        } else if (pendingStatus.indexOf(deployment.StackStatus) > -1) {
                            _viewLandscapes[index].status.pending++

                            // derive the index of the pending deployment and poll AWS until its resolved
                            // let _pendingIndex = findIndex(landscapesDetails[index], { stackName: deployment.StackName })
                            // let _pendingDeployment = landscapesDetails[index][_pendingIndex]
                            // poll(index, 5000, _pendingDeployment.stackName, _pendingDeployment.location, _pendingDeployment.accountName)
                        }
                    })
                })

                self.setState({ viewLandscapes: _viewLandscapes })

            }).catch(err => {
                console.log(err)
            })
        } else if (_viewLandscapes.length) {
            self.setState({ viewLandscapes: _viewLandscapes })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }

    render() {

        const { loading, landscapes, users, groups } = this.props
        const { animated, viewEntersAnim, viewLandscapes } = this.state
        const user = auth.getUserInfo()

        let userGroups = [],
            userLandscapes = {}

        let _viewLandscapes = viewLandscapes

        if (user.role !== 'admin') {
            if (groups) {
                groups.map(group => group.users.map(user => {
                    console.log(user.userId)
                    if (user.userId === auth.getUserInfo()._id) {
                        userGroups.push(group)
                        if (landscapes) {
                            landscapes.map(landscape => {
                                group.landscapes.map(landscapeId => {
                                    if (landscapeId === landscape._id) {
                                        userLandscapes[landscapeId] = landscape
                                    }
                                })
                            })
                        }
                    }
                }))

                _viewLandscapes = Object.keys(userLandscapes).map(key => {
                    return userLandscapes[key]
                })
            }
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

                <a onClick={this.handlesCreateLandscapeClick}>
                    <p style={{ fontSize: '20px' }}><IoIosPlusEmpty size={30}/>Add Landscape</p>
                </a>

                <ul>
                    {
                        _viewLandscapes.map((landscape, i) =>

                        <Paper key={i} className={cx({ 'landscape-card': true })} zDepth={3} rounded={false} onClick={this.handlesLandscapeClick.bind(this, landscape)}>
                                {/* header */}
                                <Row start='xs' top='xs' style={{ padding: '20px 0px' }}>
                                    <Col xs={8}>
                                        <img id='landscapeIcon' src={landscape.imageUri}/>
                                    </Col>
                                    <Col xs={4}>
                                        <FlatButton id='landscape-edit' onTouchTap={this.handlesEditLandscapeClick.bind(this, landscape)}
                                            label='Edit' labelStyle={{ fontSize: '10px' }} icon={<IoEdit/>}/>
                                        <FlatButton id='landscape-deploy' onTouchTap={this.handlesDeployClick.bind(this, landscape)}
                                            label='Deploy' labelStyle={{ fontSize: '10px' }} icon={<IoIosCloudUploadOutline/>}/>
                                    </Col>
                                </Row>

                                <Row style={{ margin: '0px 20px', height: '95px' }}>
                                    <div id='landscape-title'>{landscape.name}</div>
                                    <div id='landscape-description'>{landscape.description}</div>
                                </Row>

                                <Row end='xs' bottom='xs' id='icon-container'>
                                    <Col xs={6}>
                                        <Row center='xs'>
                                            {
                                                landscape.status
                                                ?
                                                    Object.keys(landscape.status).map((status, i) => {
                                                        let _iconClassname = {}
                                                        _iconClassname[`icon-${status}`] = true
                                                        return (
                                                            <Col key={i} xs={3}>
                                                                {landscape.status[status]}
                                                                <div className={cx(_iconClassname)}/>
                                                            </Col>
                                                        )
                                                    })
                                                :
                                                    null
                                            }
                                        </Row>
                                    </Col>
                                    {/* <Col xs={3}>
                                        <img style={{ marginLeft: '20px', filter: 'hue-rotate(-30deg) brightness(1)' }} height='50px' src='/public/untitled.png'/>
                                    </Col> */}
                                </Row>

                        </Paper>)
                    }
                </ul>
            </div>
        )
    }

    handlesCreateLandscapeClick = event => {
        const { router } = this.context
        router.push({ pathname: '/landscapes/create' })
    }

    handlesEditLandscapeClick = (landscape, event) => {
        const { router } = this.context
        router.push({ pathname: '/landscapes/edit/' + landscape._id })
    }

    handlesLandscapeClick = (landscape, event) => {
        const { router } = this.context
        const { setActiveLandscape } = this.props
        setActiveLandscape(landscape)
        router.push({ pathname: '/landscape/' + landscape._id })
    }

    handlesDeployClick = (landscape, event) => {
        const { router } = this.context
        router.push({ pathname: `/landscape/${landscape._id}/deployments/create` })
    }
}

Landscapes.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired,
    setActiveLandscape: PropTypes.func.isRequired
}

Landscapes.contextTypes = {
    router: PropTypes.object
}

export default Landscapes
