import moment from 'moment'
import cx from 'classnames'
import { Loader } from '../../components'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import { IoEdit, IoAndroidClose, IoIosCloudUploadOutline } from 'react-icons/lib/io'
import { Card, CardHeader, CardText, Dialog, FlatButton, RaisedButton, Tab, Tabs, TextField } from 'material-ui'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

class LandscapeDetails extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showDialog: false,
        currentDeployments: []
    }

    componentWillMount() {
        let self = this
        const { deploymentsByLandscapeId, deploymentStatus, params } = this.props

        deploymentsByLandscapeId({
            variables: { landscapeId: params.id }
        }).then(({ data }) => {
            return Promise.all(data.deploymentsByLandscapeId.map(deployment => {
                if (deployment.isDeleted || deployment.awsErrors) {
                    return {
                        data: {
                            deploymentStatus: deployment
                        }
                    }
                }
                return deploymentStatus({
                    variables: { deployment }
                })
            }))
        }).then(deploymentStatusArray => {
            self.setState({
                currentDeployments: deploymentStatusArray.map(({ data }) => { return data.deploymentStatus })
            })
        })
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

        const { activeLandscape, loading, landscapes, deploymentsByLandscapeId, params } = this.props
        const { animated, viewEntersAnim, currentDeployment, currentDeployments, deleteType, refetchedLandscapes } = this.state

        let _landscapes = refetchedLandscapes || landscapes
        let currentLandscape = activeLandscape
        let runningStatus = ['CREATE_COMPLETE', 'ROLLBACK_COMPLETE', 'ROLLBACK_COMPLETE', 'DELETE_COMPLETE', 'UPDATE_COMPLETE', 'UPDATE_ROLLBACK_COMPLETE']
        let pendingStatus = ['CREATE_IN_PROGRESS', 'ROLLBACK_IN_PROGRESS', 'DELETE_IN_PROGRESS', 'UPDATE_IN_PROGRESS', 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS', 'UPDATE_ROLLBACK_IN_PROGRESS', 'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS', 'REVIEW_IN_PROGRESS']

        // for direct request
        if (activeLandscape && activeLandscape._id !== params.id)
            currentLandscape = _landscapes.find(ls => { return ls._id === params.id })

        const parsedCFTemplate = JSON.parse(currentLandscape.cloudFormationTemplate)

        let paramDetails = []

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
                    <Col xs={4} style={{ textAlign: 'left' }}>
                        <h4>Landscape: {currentLandscape.name}</h4>
                    </Col>
                    <Col xs={8}>
                        <RaisedButton label='Deploy' onClick={this.handlesDeployClick}
                            style={{ float: 'right', marginBottom: '30px' }}
                            labelStyle={{ fontSize: '11px' }} icon={<IoIosCloudUploadOutline/>}/>
                        <RaisedButton label='Edit' onClick={this.handlesEditLandscapeClick}
                            style={{ float: 'right', marginBottom: '30px' }}
                            labelStyle={{ fontSize: '11px' }} icon={<IoEdit/>}/>
                    </Col>
                </Row>
                <Tabs>
                    <Tab label='Deployments'>
                        <CardHeader style={{ background: '#e6e6e6', padding: '0 25px' }}>
                            <Row between='xs' style={{ marginTop: '-10px' }}>
                                <Col xs={2}><label>Deployment Name</label></Col>
                                <Col xs={2}><label>Region</label></Col>
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

                                let _color
                                if (deployment && deployment.isDeleted) {
                                    _color = 'rgb(204, 204, 204)'
                                } else if (deployment && deployment.awsErrors) {
                                    _color = 'rgb(236, 11, 67)'
                                } else {
                                    if (deployment && runningStatus.indexOf(deployment.stackStatus) > -1) {
                                        _color = 'rgb(50, 205, 50)'
                                    } else {
                                        _color = 'rgb(255, 231, 77)'
                                    }
                                }

                                return (
                                    <Card key={index} style={{ padding: '5px 15px' }}>
                                        <CardHeader actAsExpander={true} showExpandableButton={true} style={{ padding: '0px 15px' }}>
                                            <Row middle='xs' between='xs' style={{ marginTop: '-15px' }}>
                                                <Col xs={2}>{deployment.stackName}</Col>
                                                <Col xs={2}>{deployment.location}</Col>
                                                <Col xs={2}>{moment(deployment.createdAt).format('MMM DD YYYY')}</Col>
                                                <Col xs={4} style={{ color: _color }}>
                                                    {deployment.isDeleted ? 'DELETED' : deployment.stackStatus}
                                                </Col>
                                                <Col xs={2}>
                                                    <FlatButton label={deployment.isDeleted ? 'Purge' : 'Delete'} icon={<IoAndroidClose/>} labelStyle={{ fontSize: '11px' }}
                                                        onTouchTap={this.handlesDialogToggle.bind(this, deployment)}/>
                                                </Col>
                                            </Row>
                                        </CardHeader>
                                        <CardText key={index} expandable={true}>
                                            { getDeploymentInfo(deployment) }
                                        </CardText>
                                    </Card>
                                )
                            })
                        }
                    </Tab>

                    <Tab label='Template'>
                        <textarea rows={100} value={currentLandscape.cloudFormationTemplate} readOnly={true}
                            style={{ background: '#f9f9f9', fontFamily: 'monospace', width: '100%' }}/>
                    </Tab>

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

                    <Tab label='Parameters'>
                        {
                            Object.keys(parsedCFTemplate.Parameters).map((key, index) => {
                                let _param = parsedCFTemplate.Parameters[key]

                                for (let k in _param) {

                                    if (!paramDetails[index]) {
                                        paramDetails[index] = []
                                    }

                                    paramDetails[index][k] = _param[k]
                                }

                                return (
                                    <Card key={index}>
                                        <CardHeader title={key} titleStyle={{ fontSize: '13px', paddingRight: 0 }} actAsExpander={true} showExpandableButton={true}/>

                                        {
                                            paramDetails.map((p, i) => {
                                                return (
                                                    <CardText key={i} expandable={true}>
                                                        <Row>
                                                            <label style={{ margin: '0px 15px' }}>{Object.keys(p)[i]}</label>
                                                            <label>{p.Description}</label>
                                                        </Row>
                                                    </CardText>
                                                )
                                            })
                                        }
                                    </Card>
                                )
                            })
                        }
                    </Tab>

                    <Tab label='Mappings'>

                    </Tab>
                </Tabs>
            </div>
        )
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
        const { deploymentsByLandscapeId, mutate, params, refetch } = this.props
        const { router } = this.context
        let landscapes = []

        this.handlesDialogToggle(deployment)

        mutate({
            variables: { deployment }
         }).then(({ data }) => {
            console.log('deleted', data)
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
        }).catch(error => {
            console.log('there was an error sending the query', error)
        })
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
