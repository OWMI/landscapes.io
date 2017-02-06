import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import { IoIosCloudUploadOutline } from 'react-icons/lib/io'
import { Card, CardHeader, CardText, MenuItem, RaisedButton, SelectField, TextField, Toggle } from 'material-ui'

import './deployments.style.scss'
import { Loader } from '../../components'

class CreateDeployment extends Component {

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

        const { loading, accounts } = this.props
        const { animated, viewEntersAnim, templateParameters, templateDescription, secretAccessKey, signatureBlock } = this.state

        const menuItems = [
            { text: 'Gov Cloud', value: 'us-gov-west-1' },
            { text: 'US East (Northern Virginia) Region', value: 'us-east-1' },
            { text: 'US West (Northern California) Region', value: 'us-west-1' },
            { text: 'US West (Oregon) Region', value: 'us-west-2' },
            { text: 'EU (Ireland) Region', value: 'eu-west-1' },
            { text: 'Asia Pacific (Singapore) Region', value: 'ap-southeast-1' },
            { text: 'Asia Pacific (Sydney) Region', value: 'ap-southeast-2' },
            { text: 'Asia Pacific (Tokyo) Region', value: 'ap-northeast-1' },
            { text: 'South America (Sao Paulo) Region', value: 'sa-east-1' }
        ]

        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <Row center='xs' middle='xs'>
                    <Col xs={6} lg={9} className={cx( { 'create-deployment': true } )}>
                        <Row middle='xs'>
                            <Col xs={4} style={{ textAlign: 'left' }}>
                                <h4>New Deployment</h4>
                            </Col>
                            <Col xs={8}>
                                <RaisedButton label='Deploy' onClick={this.handlesDeployClick}
                                    style={{ float: 'right', margin: '30px 0px' }}
                                    labelStyle={{ fontSize: '11px' }} icon={<IoIosCloudUploadOutline/>}/>
                            </Col>
                        </Row>
                        <Card>
                            <TextField id='stackName' ref='stackName' floatingLabelText='Stack Name' className={cx( { 'two-field-row': true } )}/>

                            <SelectField id='accountName' floatingLabelText='Account Name' value={this.state.accountName} onChange={this.handlesAccountChange}
                                floatingLabelStyle={{ left: '0px' }} className={cx( { 'two-field-row': true } )}>
                                {
                                    accounts.map((acc, index) => {
                                        return (
                                            <MenuItem key={index} value={acc.name} primaryText={acc.name}/>
                                        )
                                    })
                                }
                            </SelectField>

                            <TextField id='description' ref='description' value={ templateDescription ? templateDescription.substring(0, 255) : '' } multiLine={true} rows={4} maxLength={255}
                                floatingLabelText='Description' fullWidth={true} floatingLabelStyle={{ left: '0px' }} textareaStyle={{ width: '95%' }}/>

                            <SelectField id='location' floatingLabelText='Region' value={this.state.location} onChange={this.handlesRegionChange}
                                floatingLabelStyle={{ left: '0px' }} className={cx( { 'two-field-row': true } )}>
                                {
                                    menuItems.map((item, index) => {
                                        return (
                                            <MenuItem key={index} value={item.value} primaryText={item.text}/>
                                        )
                                    })
                                }
                            </SelectField>

                            <TextField id='billingCode' ref='billingCode' floatingLabelText='Billing Code' fullWidth={true}
                                className={cx( { 'two-field-row': true } )}/>

                            <TextField id='accessKeyId' ref='accessKeyId' value={this.state.accessKeyId} floatingLabelText='Access Key ID' fullWidth={true}/>

                            <TextField id='secretAccessKey' ref='secretAccessKey' value={ secretAccessKey ? secretAccessKey.substring(0, 255) : '' } multiLine={true} rows={4}
                                maxLength={255} floatingLabelStyle={{ left: '0px' }} floatingLabelText='Secret Access Key' fullWidth={true}/>

                            <CardHeader title='Advanced' titleStyle={{ fontSize: '13px', paddingRight: 0 }} actAsExpander={true} showExpandableButton={true}/>

                            <CardText expandable={true}>
                                <TextField id='endpoint' ref='endpoint' value={this.state.endpoint} floatingLabelText='Endpoint' fullWidth={true}/>

                                <TextField id='caBundlePath' ref='caBundlePath' value={this.state.caBundlePath} floatingLabelText='CA Bundle' fullWidth={true}/>

                                <Toggle id='rejectUnauthorizedSsl' ref='rejectUnauthorizedSsl' defaultToggled={this.state.rejectUnauthorizedSsl} label='Reject Unauthorized SSL'
                                    style={{ marginTop: '25px' }} labelStyle={{ width: 'none' }}/>

                                <TextField id='signatureBlock' ref='signatureBlock' value={ signatureBlock ? signatureBlock.substring(0, 255) : '' } multiLine={true} rows={4} fullWidth={true} maxLength={255}
                                    floatingLabelText='Signature Block' floatingLabelStyle={{ left: '0px' }}/>
                            </CardText>
                        </Card>

                        <Row style={{ height: '50vh' }}>
                            <Col xs={4}>
                                <label style={{ paddingTop: '30px', fontSize: '14px' }}>Tags</label>
                                <Row>
                                    <Col xs={3}>
                                    </Col>
                                    <Col xs={6}>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={8}>
                                <label style={{ paddingTop: '30px', fontSize: '14px' }}>Parameters</label>
                                <Row>
                                    <Col xs={3}>
                                        {
                                            Object.keys(templateParameters || {}).map((param, index) => {
                                                return (
                                                    <Row key={index} bottom='xs' style={{ height: 72 }}>
                                                        <label style={{ marginBottom: '12px' }}>{param}</label>
                                                    </Row>
                                                )
                                            })
                                        }
                                    </Col>
                                    <Col xs={6}>
                                        {
                                            Object.keys(templateParameters || {}).map((param, index) => {
                                                return (
                                                    <Row key={index} bottom='xs' style={{ height: 72 }}>
                                                        <TextField id={'_p'+param} ref={'_p'+param} fullWidth={true} defaultValue={templateParameters[param].Default}
                                                            hintText={templateParameters[param].Description} hintStyle={{ opacity: 1, fontSize: '10px', bottom: '-20px', textAlign: 'left' }}/>
                                                    </Row>
                                                )
                                            })
                                        }
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        )
    }

    handlesAccountChange = (event, index, accountName) => {

        const { accounts, landscapes, params } = this.props
        const account = accounts.find(acc => { return acc.name === accountName })
        const currentLandscape = landscapes.find(ls => { return ls._id === params.landscapeId })
        const template = JSON.parse(currentLandscape.cloudFormationTemplate)

        this.setState({
            accountName: accountName,
            accessKeyId: account.accessKeyId || '',
            secretAccessKey: account.secretAccessKey || '',
            endpoint: account.endpoint || '',
            location: account.region || '',
            caBundlePath: account.caBundlePath || '',
            rejectUnauthorizedSsl: account.rejectUnauthorizedSsl || '',
            signatureBlock: account.signatureBlock || '',
            templateDescription: template.Description,
            templateParameters: template.Parameters
        })
    }

    handlesRegionChange = (event, index, value) => {
        this.setState({
            location: value
        })
    }

    handlesDeployClick = event => {

        event.preventDefault()
        const { mutate, landscapes, params } = this.props
        const { router } = this.context

        let deploymentToCreate = {
            cloudFormationParameters: {}
        }

        // map all fields to deploymentToCreate
        for (let key in this.refs) {
            if (key.indexOf('_p') === 0) {
                deploymentToCreate.cloudFormationParameters[key.replace('_p', '')] = this.refs[key].getValue()
            } else if (key === 'rejectUnauthorizedSsl') {
                deploymentToCreate[key] = this.refs[key].isToggled()
            } else {
                deploymentToCreate[key] = this.refs[key].getValue()
            }
        }

        // attach derived fields
        deploymentToCreate.tags = {}
        deploymentToCreate.location = this.state.location
        deploymentToCreate.accountName = this.state.accountName
        deploymentToCreate.landscapeId = params.landscapeId

        let JSONString = JSON.stringify(deploymentToCreate.cloudFormationParameters)
        deploymentToCreate.cloudFormationParameters = JSONString

        mutate({
            variables: { deployment: deploymentToCreate }
         }).then(({ data }) => {
            console.log('deployment created', data)
            router.push({ pathname: `/landscapes` })
        }).catch(error => {
            console.log('there was an error sending the query', error)
        })
    }
}

CreateDeployment.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

CreateDeployment.contextTypes = {
    router: PropTypes.object
}

export default CreateDeployment
