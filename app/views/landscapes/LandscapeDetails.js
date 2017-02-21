import moment from 'moment'
import cx from 'classnames'
import { compact, orderBy } from 'lodash'
import { Loader } from '../../components'
import React, { Component, PropTypes } from 'react'
import { IoCube, IoClose } from 'react-icons/lib/io'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import { IoEdit, IoAndroidClose, IoIosCloudUploadOutline } from 'react-icons/lib/io'
import { Card, CardHeader, CardText, Dialog, FlatButton, RaisedButton, Tab, Tabs, TextField } from 'material-ui'
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import materialTheme from '../../style/custom-theme.js';

class LandscapeDetails extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showDialog: false,
        currentDeployments: [],
        addedDocuments: []
    }

    componentWillReceiveProps(nextProps) {
        this.handlesFetchingDeploymentStatus(nextProps)
    }

    componentWillMount() {
        this.handlesFetchingDeploymentStatus(this.props)
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

        const self = this

        const { activeLandscape, loading, landscapes, params } = this.props

        const { animated, viewEntersAnim, currentDeployment, currentDeployments, deleteType,
                refetchedLandscapes, cloudFormationParameters, tags, currentLandscape, paramDetails } = this.state

        let _landscapes = landscapes || []

        // for direct request
        // if (activeLandscape && activeLandscape._id !== params.id)

        const parsedCFTemplate = JSON.parse(currentLandscape.cloudFormationTemplate)

        function getDeploymentInfo(deployment) {
            let deploymentInfo = []
            for (let key in deployment) {
                switch (key) {
                    case 'location':
                        deploymentInfo.push({ key: 'Region', value: deployment.location })
                        break
                    case 'createdAt':
                        deploymentInfo.push({ key: 'Created At', value: deployment.createdAt })
                        break
                    case 'stackId':
                        deploymentInfo.push({ key: 'Stack ID', value: deployment.stackId })
                        break
                    default:
                        break
                }
            }

            return deploymentInfo.map((dep, i) => {
                return (
                    <Row key={i}>
                        <label style={{ margin: '0px 15px' }}>{dep.key}</label>
                        <label>{dep.value}</label>
                    </Row>
                )
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
                <Row middle='xs'>
                    <Col xs={2} style={{ textAlign: 'left', marginBottom:30 }}>
                      <Row><h4><strong>Landscape</strong></h4></Row>
                    </Col>
                    <Col xs={10}>
                        <RaisedButton label='Deploy' onClick={this.handlesDeployClick}
                            style={{ float: 'right', marginBottom: '30px' }}
                            labelStyle={{ fontSize: '11px' }} icon={<IoIosCloudUploadOutline/>}/>
                        <RaisedButton label='Edit' onClick={this.handlesEditLandscapeClick}
                            style={{ float: 'right', marginBottom: '30px' }}
                            labelStyle={{ fontSize: '11px' }} icon={<IoEdit/>}/>
                    </Col>
                </Row>

              <Card style={{ padding:20 }}>
                <Row middle='xs'>
                    <Col xs={1} style={{ textAlign: 'left' }}>
                        <img src={currentLandscape.imageUri} style={{ width: 85 }} />
                    </Col>
                    <Col xs={4} style={{ textAlign: 'left', marginLeft:20 }}>
                        <Row><h4>{currentLandscape.name}</h4></Row>
                        <Row><h5>Version: {currentLandscape.version}</h5></Row>

                    </Col>
                    <Col xs={7}>
                    </Col>
                </Row>
                <Row middle='xs' style={{ flex: 1, marginLeft: 10 }}>
                    <Col style={{ textAlign: 'left', flex: 1 }}>
                        <h5>{currentLandscape.description}</h5>
                    </Col>
                </Row>

                <Tabs tabItemContainerStyle={{ backgroundColor: materialTheme.palette.primary1Color }}>
                    <Tab label='Deployments'>
                        <CardHeader style={{ background: '#e6e6e6', padding: '0 25px' }}>
                            <Row between='xs' style={{ marginTop: '-10px' }}>
                                <Col xs={2}><label>Deployment Name</label></Col>
                                <Col xs={2}><label>Deployed By</label></Col>
                                <Col xs={2}><label>Date Created</label></Col>
                                <Col xs={4}><label>Status</label></Col>
                                <Col xs={2}></Col>
                            </Row>
                            <Dialog title={deleteType + ' Deployment'} modal={false} open={this.state.showDialog}
                                titleStyle={{ textTransform: 'uppercase', fontSize: '16px', fontWeight: 'bold' }}
                                onRequestClose={this.handlesDialogToggle.bind(this, currentDeployment)}
                                actions={[
                                    <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle.bind(this, currentDeployment)}/>,
                                    <FlatButton label={deleteType + ''} primary={true} onTouchTap={this.handlesDeleteDeploymentClick.bind(this, currentDeployment)}/>
                                ]}> Are you sure you want to {deleteType} {currentDeployment ? currentDeployment.stackName : ''}?
                            </Dialog>
                        </CardHeader>
                        {
                            currentDeployments.map((deployment, index) => {
                                let _stackStatus = {}
                                deployment.tags = deployment.tags || []

                                if ((deployment && deployment.stackStatus === 'ROLLBACK_COMPLETE') || (deployment && deployment.awsErrors)) {
                                    _stackStatus = {
                                        status: deployment.stackStatus || 'FAILED',
                                        color: 'rgb(236, 11, 67)',
                                        error: (deployment && deployment.awsErrors) ? deployment.awsErrors : 'Check CloudFormation for details'
                                    }
                                } else if (deployment && deployment.isDeleted) {
                                    _stackStatus = {
                                        status: 'DELETED',
                                        color: 'rgb(204, 204, 204)'
                                    }
                                } else if (deployment && deployment.stackStatus === 'CREATE_COMPLETE') {
                                    _stackStatus = {
                                        status: deployment.stackStatus,
                                        color: 'rgb(50, 205, 50)'
                                    }
                                } else if (deployment && deployment.stackStatus.indexOf('IN_PROGRESS') > -1) {
                                    _stackStatus = {
                                        status: deployment.stackStatus,
                                        color: 'rgb(255, 231, 77)'
                                    }
                                }

                                return (
                                    <Card key={index} style={{ padding: '5px 15px' }}>
                                        <CardHeader showExpandableButton={true} style={{ padding: '0px 15px' }}>
                                            <Row middle='xs' between='xs' style={{ marginTop: '-15px' }}>
                                                <Col xs={2}>{deployment.stackName || ''}</Col>
                                                <Col xs={2}>{deployment.createdBy}</Col>
                                                <Col xs={2}>{moment(deployment.createdAt).format('MMM DD YYYY')}</Col>
                                                <Col xs={4} style={{ color: _stackStatus.color }}>
                                                    {_stackStatus.status}
                                                </Col>
                                                <Col xs={2}>
                                                    <FlatButton label={deployment.isDeleted ? 'Purge' : 'Delete'} icon={<IoAndroidClose/>} labelStyle={{ fontSize: '11px' }}
                                                        onTouchTap={this.handlesDialogToggle.bind(this, deployment)}/>
                                                </Col>
                                            </Row>
                                        </CardHeader>
                                        <CardText key={index} expandable={true}>
                                            {
                                                _stackStatus.error
                                                ?
                                                    <Row middle='xs' id='stack-error'>
                                                        <Col id='error-label'>ERROR:</Col>
                                                        <Col>{_stackStatus.error}</Col>
                                                    </Row>
                                                :
                                                    null
                                            }

                                            { getDeploymentInfo(deployment) }

                                            <h5>Parameters</h5>
                                            {
                                                this.state.cloudFormationParameters[deployment._id] && this.state.cloudFormationParameters[deployment._id].length
                                                ?
                                                    this.state.cloudFormationParameters[deployment._id].map(parameter => {
                                                        return (
                                                            <Row key={parameter.ParameterKey}>
                                                                <Col xs={2}>
                                                                  <label style={{ margin: '0px 15px' }}>{parameter.ParameterKey}</label>
                                                                </Col>
                                                                <Col xs={2}>
                                                                  <label>{parameter.ParameterValue}</label>
                                                                </Col>
                                                            </Row>
                                                        )
                                                    })
                                                :
                                                    null
                                            }
                                            <h5>Tags</h5>
                                            {
                                                this.state.tags[deployment._id] && this.state.tags[deployment._id].length
                                                ?
                                                    this.state.tags[deployment._id].map((tag, index) => {
                                                        return (
                                                            <div key={index}>
                                                                {
                                                                    tag
                                                                    ?
                                                                        <Row key={index}>
                                                                            <Col xs={2}>
                                                                                <label style={{ margin: '0px 15px' }}>{tag.Key || ''}</label>
                                                                            </Col>
                                                                            <Col xs={2}>
                                                                                <label>{tag.Value || ''}</label>
                                                                            </Col>
                                                                        </Row>
                                                                    :
                                                                        null
                                                                }
                                                          </div>
                                                        )
                                                    })
                                                :
                                                    null
                                            }
                                        </CardText>
                                    </Card>
                                )
                            })
                        }
                    </Tab>

                    <Tab label='Documents'>
                      {
                          this.state.addedDocuments.length > 0
                          ?
                              <Row style={{ width:'95%', marginLeft: 10, borderBottom: '1px solid #DCDCDC', borderTop: '1px solid #DCDCDC' }}>
                                  <Table selectable={false} fixedHeader={true}>
                                      <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                                          <TableRow>
                                              <TableHeaderColumn>Type</TableHeaderColumn>
                                              <TableHeaderColumn>Name</TableHeaderColumn>
                                              <TableHeaderColumn>URL</TableHeaderColumn>
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody displayRowCheckbox={false}>
                                        {
                                            this.state.addedDocuments.map((document, index) => {
                                                return (
                                                    <TableRow key={index}>
                                                        <TableRowColumn>{document.type}</TableRowColumn>
                                                        <TableRowColumn>{document.name}</TableRowColumn>
                                                        <TableRowColumn><a target="_blank" href={document.url}>{document.url}</a></TableRowColumn>
                                                    </TableRow>
                                                )
                                            })
                                        }
                                      </TableBody>
                                  </Table>
                              </Row>
                          :
                              <div>None</div>
                      }
                    </Tab>

                    <Tab label='Template'>
                        <textarea rows={100} value={currentLandscape.cloudFormationTemplate} readOnly={true}
                            style={{ background: '#f9f9f9', fontFamily: 'monospace', width: '100%' }}/>
                    </Tab>

                    {
                      parsedCFTemplate.Resources
                        ?
                            <Tab label='Resources'>
                                <Table>
                                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                        <TableRow>
                                            <TableHeaderColumn></TableHeaderColumn>
                                            <TableHeaderColumn>Resource</TableHeaderColumn>
                                            <TableHeaderColumn>Resource Type</TableHeaderColumn>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody displayRowCheckbox={false}>
                                        {
                                            Object.keys(parsedCFTemplate.Resources).map((res, index) => {
                                                return (
                                                    <TableRow key={`${index}`}>
                                                        <TableRowColumn>{index + 1}</TableRowColumn>
                                                        <TableRowColumn>{res}</TableRowColumn>
                                                        <TableRowColumn>{parsedCFTemplate.Resources[res].Type}</TableRowColumn>
                                                    </TableRow>
                                                )
                                            })
                                        }
                                    </TableBody>
                                </Table>
                            </Tab>
                        :
                            null
                    }

                    {
                      parsedCFTemplate.Parameters
                      ?
                          <Tab label='Parameters'>
                              {
                                paramDetails.map((p, i) => {
                                    return (
                                      <Card key={i}>
                                        <CardHeader title={p.key} titleStyle={{ fontSize: '13px', paddingRight: 0 }} actAsExpander={true} showExpandableButton={true}/>
                                        <CardText key={i} expandable={true}>
                                            <Row>
                                                <label style={{ margin: '0px 15px' }}>{Object.keys(p)[i]}</label>
                                                <label>{p.Description}</label>
                                            </Row>
                                        </CardText>
                                      </Card>

                                    )
                                })
                              }
                          </Tab>
                      :
                          null
                      }
                  </Tabs>
              </Card>
          </div>
        )
    }

    handlesFetchingDeploymentStatus = props => {

        const self = this
        const { activeLandscape, deploymentsByLandscapeId, deploymentStatus, hasPendingDeployments,
                landscapes, params, pendingDeployments, setPendingDeployments } = props

        let _pendingDeployments = []
        let _landscapes = landscapes || []
        let currentLandscape = activeLandscape
        let cloudFormationParameters = {}
        let tags = {}

        if (!currentLandscape) {
            currentLandscape = _landscapes.find(ls => { return ls._id === params.id })
            if(!currentLandscape){
              currentLandscape = { cloudFormationTemplate: '{}' }
            }
        }

        if (currentLandscape && currentLandscape.documents) {
            self.setState({ addedDocuments: currentLandscape.documents })
        }

        self.setState({ currentLandscape })

        deploymentsByLandscapeId({
            variables: { landscapeId: params.id }
        }).then(({ data }) => {
            return Promise.all(data.deploymentsByLandscapeId.map(deployment => {
                cloudFormationParameters[deployment._id] = deployment.cloudFormationParameters
                tags[deployment._id] = deployment.tags

                self.setState({ cloudFormationParameters, tags })

                if (deployment.isDeleted || deployment.awsErrors) {
                    return {
                        data: { deploymentStatus: deployment }
                    }
                }

                return deploymentStatus({
                    variables: { deployment }
                })
            }))
        }).then(deploymentStatusArray => {

            let currentDeployments = compact(deploymentStatusArray.map(({ data }) => {
                return data.deploymentStatus
            }))

            if (currentDeployments.length) {
                // sort by date
                currentDeployments = orderBy(currentDeployments, value => { return new Date(value.createdAt) }, ['desc'])

                currentDeployments.forEach(deployment => {
                    if (deployment && deployment.stackStatus && deployment.stackStatus.indexOf('IN_PROGRESS') > -1)
                        _pendingDeployments.push(deployment)
                })

                if (!hasPendingDeployments && _pendingDeployments.length && _pendingDeployments !== pendingDeployments) {
                    clearTimeout(self.timeout)
                    setPendingDeployments(_pendingDeployments)
                } else if (_pendingDeployments.length && _pendingDeployments !== pendingDeployments) {
                    clearTimeout(self.timeout)
                    self.handlesPollingDeployments(_pendingDeployments, 10000)
                }

            }

            self.setState({ currentDeployments })

        })

        let paramDetails = []

        if (currentLandscape) {
            let parsedCFTemplate = JSON.parse(currentLandscape.cloudFormationTemplate)
            if (parsedCFTemplate.Parameters) {
                Object.keys(parsedCFTemplate.Parameters).map((key, index) => {
                    let _param = parsedCFTemplate.Parameters[key]
                    for (let k in _param) {
                        if (!paramDetails[index]) {
                            paramDetails[index] = []
                        }

                        paramDetails[index][k] = _param[k]
                        paramDetails[index].key = key
                    }
                })
            }
        }

        self.setState({ paramDetails })
    }

    handlesPollingDeployments = (pendingDeployments, interval) => {
        const self = this
        const { deploymentStatus, setPendingDeployments } = self.props

        self.timeout = setTimeout(() => {
            Promise.all(pendingDeployments.map(deployment => {
                // delete version
                delete deployment.__v

                return deploymentStatus({
                    variables: { deployment }
                })
            })).then(deploymentStatusArray => {

                let statuses = deploymentStatusArray.map(status => status.data.deploymentStatus.stackStatus)

                // poll until all statuses are resolved as CREATE_COMPLETE
                if (statuses.indexOf('CREATE_COMPLETE') > -1) {
                    clearTimeout(self.timeout)
                    setPendingDeployments(pendingDeployments)
                } else if (statuses.indexOf('ROLLBACK_COMPLETE') > -1) {
                    clearTimeout(self.timeout)
                    setPendingDeployments(pendingDeployments)
                } else {
                    self.handlesPollingDeployments(pendingDeployments, interval)
                }
            }).catch(err => console.log(err))

        }, interval)
    }

    handlesDialogToggle = (deployment, event) => {
        this.setState({
            currentDeployment: deployment,
            showDialog: !this.state.showDialog,
            deleteType: deployment.isDeleted ? 'purge' : 'delete'
        })
    }

    handlesEditLandscapeClick = (deployment, event) => {
        const { params } = this.props
        const { router } = this.context
        router.push({ pathname: '/landscapes/edit/' + params.id })
    }

    handlesDeleteDeploymentClick = (deployment, event) => {
        event.preventDefault()
        const self = this
        const { deploymentsByLandscapeId, mutate, params, refetch } = self.props
        const { router } = self.context
        let landscapes = []

        self.handlesDialogToggle(deployment)

        mutate({
            variables: { deployment }
         }).then(({ data }) => {
            return refetch()
         }).then(({ data }) => {
             landscapes = data.landscapes
             return deploymentsByLandscapeId({
                 variables: { landscapeId: params.id }
             })
        }).then(({ data }) => {
            self.setState({
                landscapes,
                currentDeployments: data.deploymentsByLandscapeId.filter(d => { return d.landscapeId === params.id })
            })
            router.push({ pathname: `/landscape/${params.id}` })
        }).catch(error => console.log(error))
    }

    handlesDeployClick = event => {
        const { params } = this.props
        const { router } = this.context
        router.push({ pathname: `${params.id}/deployments/create` })
    }

    handlesLandscapeClick = event => {
        const { router } = this.context
        router.push({ pathname: '/protected' })
    }
}

LandscapeDetails.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

LandscapeDetails.contextTypes = {
    router: PropTypes.object
}

export default LandscapeDetails
