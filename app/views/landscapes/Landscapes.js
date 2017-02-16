import cx from 'classnames'
import axios from 'axios'
import { compact, findIndex, isEqual } from 'lodash'
import { Row, Col } from 'react-flexbox-grid'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit, IoIosCloudUploadOutline, IoIosPlusEmpty } from 'react-icons/lib/io'
import { CardHeader, CardActions, CardText, FlatButton, Paper } from 'material-ui'

import './landscapes.style.scss'
import { Loader } from '../../components'
import { auth } from '../../services/auth'
import materialTheme from '../../style/custom-theme.js';
import defaultLandscapeImage from '../../style/AWS.png';

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
        const { currentUser, deploymentsByLandscapeId, deploymentStatus, hasPendingDeployments, landscapes,
                pendingDeployments, userAccess, setPendingDeployments, setUserAccess } = nextProps
        let _viewLandscapes = []

        // set landscapes based on permissions
        if (landscapes && landscapes.length && currentUser.isGlobalAdmin) {
            _viewLandscapes = landscapes
        } else if (landscapes && landscapes.length && !userAccess) {
            setUserAccess('landscapes', { landscapes })
        } else if (userAccess && userAccess.landscapes) {
            _viewLandscapes = userAccess.landscapes
        }

        function StatusModel() {
            this.pending = 0
            this.running = 0
            this.failed = 0
            this.deleted = 0
        }

        if (_viewLandscapes.length) {

            let landscapesDetails = []

            // instantiate statuses
            _viewLandscapes.forEach(landscape => {
                landscape.status = new StatusModel()
            })

            // create promise array to gather all deployments
            let _promises = _viewLandscapes.map((landscape, index) => {
                return new Promise((resolve, reject) => {
                    axios.get(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/landscapes/${landscape._id}/deployments`).then(res => {
                        resolve(res.data)
                    }).catch(err => {
                        reject(err)
                    })
                })
            })

            Promise.all(_promises).then(_landscapes => {

                landscapesDetails = _landscapes

                // count deleted/purged/failed _landscapes
                _landscapes.forEach((landscape, i) => {
                    landscape.forEach(deployment => {
                        if (deployment && deployment.isDeleted) {
                            _viewLandscapes[i].status.deleted++
                        } else if (deployment && deployment.awsErrors) {
                            _viewLandscapes[i].status.failed++
                        }
                    })
                })

                // gather status for other _landscapes
                let _promises = []

                let _promiseAll = _landscapes.map((landscape, x) => {
                    if (landscape.length) {
                        _promises[x] = landscape.map(stack => {
                            if (!stack.isDeleted && !stack.awsErrors) {
                                return new Promise((resolve, reject) => {
                                    axios.get(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/deployments/describe/${stack.stackName}/${stack.location}/${stack.accountName}`)
                                    .then(res => {
                                        resolve(res.data)
                                    }).catch(err => {
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
                        return (dep && dep.Stacks) ? dep.Stacks[0] : null
                    }))
                })

                let _pendingDeployments = []

                // loop through each deployment and increment the running/pending statuses
                landscapesStatus.forEach((ls, index) => {
                    ls.forEach(deployment => {
                        if (deployment && deployment.StackStatus === 'CREATE_COMPLETE') {
                            _viewLandscapes[index].status.running++
                        } else if (deployment && deployment.StackStatus && deployment.StackStatus.indexOf('IN_PROGRESS') > -1) {
                            _viewLandscapes[index].status.pending++

                            // derive the index of the pending deployment and poll AWS until its resolved
                            let _pendingIndex = findIndex(landscapesDetails[index], { stackName: deployment.StackName })
                            let _pendingDeployment = landscapesDetails[index][_pendingIndex]

                            delete _pendingDeployment.__v

                            _pendingDeployments.push(_pendingDeployment)
                        } else {
                            // ROLLBACK_COMPLETE
                            _viewLandscapes[index].status.failed++
                        }
                    })
                })


                if (!hasPendingDeployments && _pendingDeployments.length && _pendingDeployments !== pendingDeployments) {
                    clearTimeout(self.timeout)
                    setPendingDeployments(_pendingDeployments)
                } else if (_pendingDeployments.length && _pendingDeployments !== pendingDeployments) {
                    clearTimeout(self.timeout)
                    self.handlesPollingDeployments(_pendingDeployments, 10000)
                }

                self.setState({ viewLandscapes: _viewLandscapes })

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

        const { currentUser, loading, landscapes, users, groups, userAccess } = this.props
        const { animated, viewEntersAnim, viewLandscapes } = this.state

        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>

                {
                    currentUser.isGlobalAdmin || userAccess && userAccess.canCreate
                    ?
                        <a onClick={this.handlesCreateLandscapeClick}>
                            <p style={{ fontSize: '20px', cursor: 'pointer' }}><IoIosPlusEmpty size={30}/>Add Landscape</p>
                        </a>
                    :
                        null
                }

                <ul>
                    {
                        viewLandscapes.map((landscape, i) =>

                        <Paper key={i} className={cx({ 'landscape-card': true })} style={{backgroundColor: materialTheme.palette.primary1Color}} zDepth={3} rounded={false} onClick={this.handlesLandscapeClick.bind(this, landscape)}>
                                {/* header */}
                                <Row start='xs' top='xs' style={{ padding: '20px 0px' }}>
                                    <Col xs={8}>
                                        <img id='landscapeIcon' src={landscape.imageUri || defaultLandscapeImage}/>
                                    </Col>
                                    <Col xs={4}>
                                        {
                                            currentUser.isGlobalAdmin || currentUser.permissions[landscape._id].indexOf('u') > -1
                                            ?
                                                <FlatButton id='landscape-edit' onTouchTap={this.handlesEditLandscapeClick.bind(this, landscape)}
                                                    label='Edit' labelStyle={{ fontSize: '10px' }} icon={<IoEdit/>}/>
                                            :
                                                null
                                        }

                                        {
                                            currentUser.isGlobalAdmin || currentUser.permissions[landscape._id].indexOf('x') > -1
                                            ?
                                                <FlatButton id='landscape-deploy' onTouchTap={this.handlesDeployClick.bind(this, landscape)}
                                                    label='Deploy' labelStyle={{ fontSize: '10px' }} icon={<IoIosCloudUploadOutline/>}/>
                                            :
                                                null
                                        }
                                    </Col>
                                </Row>

                                <Row style={{ margin: '0px 20px', height: '95px' }}>
                                    <div id='landscape-title'>{landscape.name}</div>
                                    {
                                      landscape.description.length > 120
                                        ?
                                        <div id='landscape-description'>{landscape.description.substr(0, 120) + '...'}</div>
                                        :
                                        <div id='landscape-description'>{landscape.description}</div>
                                    }
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

    handlesPollingDeployments = (pendingDeployments, interval) => {

        const self = this
        const { deploymentStatus } = this.props

        this.timeout = setTimeout(() => {
            Promise.all(pendingDeployments.map(deployment => {
                // delete version
                delete deployment.__v

                return deploymentStatus({
                    variables: { deployment }
                })
            })).then(deploymentStatusArray => {
                let statuses = deploymentStatusArray.map(status => status.data.deploymentStatus.stackStatus)
                if (statuses.indexOf('CREATE_COMPLETE') > -1) {
                    clearTimeout(self.timeout)
                }
            }).catch(err => console.log(err))

        }, interval)
    }

    handlesCreateLandscapeClick = event => {
        const { router } = this.context
        router.push({ pathname: '/landscapes/create' })
    }

    handlesEditLandscapeClick = (landscape, event) => {
        const { router } = this.context
        const { setActiveLandscape } = this.props
        setActiveLandscape(landscape)
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
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired,
    setActiveLandscape: PropTypes.func.isRequired
}

Landscapes.contextTypes = {
    router: PropTypes.object
}

export default Landscapes
