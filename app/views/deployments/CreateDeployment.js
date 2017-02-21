import cx from 'classnames'
import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import { IoIosCloudUploadOutline } from 'react-icons/lib/io'
import { Card, CardHeader, CardText, MenuItem, RaisedButton, SelectField, TextField, Toggle } from 'material-ui'

import './deployments.style.scss'
import { Loader } from '../../components'
import { auth } from '../../services/auth'


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

    componentWillMount() {
        const { isGlobalAdmin } = auth.getUserInfo()
        const { landscapes, accounts, params } = this.props
        let _landscapes = landscapes || []
        let landscapeAccounts = []

        const currentLandscape = _landscapes.find(ls => { return ls._id === params.landscapeId })

        if (currentLandscape) {
            const template = JSON.parse(currentLandscape.cloudFormationTemplate)

            if (isGlobalAdmin) {
                landscapeAccounts = accounts || []
            } else {
                landscapeAccounts = auth.getUserInfo().accounts[params.landscapeId] || []
            }

            this.setState({
                templateDescription: template.Description,
                templateParameters: template.Parameters,
                currentLandscape,
                landscapeAccounts
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        const { isGlobalAdmin } = auth.getUserInfo()
        const { landscapes, accounts, params } = nextProps
        let _landscapes = landscapes || []
        let landscapeAccounts = []

        const currentLandscape = _landscapes.find(ls => { return ls._id === params.landscapeId })

        if (currentLandscape) {
            const template = JSON.parse(currentLandscape.cloudFormationTemplate)

            if (isGlobalAdmin) {
                landscapeAccounts = accounts || []
            } else {
                landscapeAccounts = auth.getUserInfo().accounts[params.landscapeId] || []
            }

            this.setState({
                templateDescription: template.Description,
                templateParameters: template.Parameters,
                currentLandscape,
                landscapeAccounts
            })
        }
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }

    render() {

        const { loading, accounts, tags } = this.props
        const { isGlobalAdmin, isGroupAdmin } = auth.getUserInfo()
        const { animated, viewEntersAnim, templateParameters, templateDescription,
                secretAccessKey, signatureBlock, landscapeAccounts } = this.state

        const _tags = tags || []
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
        const isRequired = [
          true: {
            description: 'Is Required'
          },
          false: {
            description: ''
          }
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

                            {
                              !isGlobalAdmin
                              ?
                                  <SelectField id='accountName' floatingLabelText='Account Name' value={this.state.accountName} onChange={this.handlesAccountChange}
                                      floatingLabelStyle={{ left: '0px' }} className={cx( { 'two-field-row': true } )}>
                                      {
                                          landscapeAccounts && landscapeAccounts.length
                                            ?
                                                landscapeAccounts.map((acc, index) => {
                                                    return (
                                                        <MenuItem key={Object.keys(acc)[0]} value={acc[Object.keys(acc)[0]]} primaryText={acc[Object.keys(acc)[0]]}/>
                                                    )
                                                })
                                            :
                                                null
                                      }
                                  </SelectField>
                              :
                                  <SelectField id='accountName' floatingLabelText='Account Name' value={this.state.accountName} onChange={this.handlesAccountChange}
                                      floatingLabelStyle={{ left: '0px' }} className={cx( { 'two-field-row': true } )}>
                                      {
                                          landscapeAccounts && landscapeAccounts.length
                                            ?
                                                landscapeAccounts.map((acc, index) => {
                                                    return (
                                                        <MenuItem key={acc._id} value={acc.name} primaryText={acc.name}/>
                                                    )
                                                })
                                            :
                                            null
                                        }
                                  </SelectField>
                            }

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

                            {
                                isGlobalAdmin || isGroupAdmin
                                ?
                                    secretAccessKey
                                    ?
                                        <TextField id='secretAccessKey' ref='secretAccessKey' value={secretAccessKey.substring(0, 255)} multiLine={true} rows={4}
                                            maxLength={255} floatingLabelStyle={{ left: '0px' }} floatingLabelText='Secret Access Key' fullWidth={true}/>
                                    :
                                        <TextField id='secretAccessKey' ref='secretAccessKey' multiLine={true} rows={4}
                                            maxLength={255} floatingLabelStyle={{ left: '0px' }} floatingLabelText='Secret Access Key' fullWidth={true}/>
                                :
                                    secretAccessKey
                                        ?
                                            <TextField id='secretAccessKey' ref='secretAccessKey' value={secretAccessKey.replace(/./g, '*')} multiLine={true} rows={4}
                                                maxLength={255} floatingLabelStyle={{ left: '0px' }} floatingLabelText='Secret Access Key' fullWidth={true}/>
                                        :
                                            <TextField id='secretAccessKey' ref='secretAccessKey' multiLine={true} rows={4}
                                                maxLength={255} floatingLabelStyle={{ left: '0px' }} floatingLabelText='Secret Access Key' fullWidth={true}/>
                            }

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
                        <Row>
                          <h4 style={{ paddingTop: '30px', paddingLeft: 10}}>Parameters</h4>
                        </Row>
                        <Col xs={12} style={{ minHeight: '200' }}>
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
                                <Col xs={9}>
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
                        <Row>
                          <h4 style={{ paddingTop: '30px', paddingLeft: 10}}>Tags</h4>
                        </Row>
                            <Col xs={12} style={{ minHeight: '200' }}>
                              <Row>
                                  <Col xs={4}>
                                      {
                                          _tags.map((tag, index) => {
                                              return (
                                                  <Row key={index} bottom='xs' style={{ height: 72 }}>
                                                        <label style={{ marginBottom: '12px' }}>{tag.key}</label>
                                                  </Row>
                                              )
                                          })
                                      }
                                  </Col>
                                 <Col xs={8}>
                                  {
                                          _tags.map((tag, index) => {
                                              return (
                                                  <Row key={index} bottom='xs' style={{ height: 72 }}>
                                                    {
                                                      tag.isRequired
                                                      ?
                                                      <TextField id={'_t'+ tag._id} ref={'_t'+tag._id} fullWidth={true} defaultValue={tag.defaultValue}
                                                          hintText={'This is a required value.'} hintStyle={{ opacity: 1, fontSize: '10px', bottom: '-20px', textAlign: 'left' }}/>
                                                      :
                                                      <TextField id={'_t'+ tag._id} ref={'_t'+ tag._id} fullWidth={true} defaultValue={tag.defaultValue}
                                                          hintStyle={{ opacity: 1, fontSize: '10px', bottom: '-20px', textAlign: 'left' }}/>
                                                    }
                                                  </Row>
                                              )
                                          })
                                      }
                                  </Col>
                              </Row>
                            </Col>
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
            rejectUnauthorizedSsl: account.rejectUnauthorizedSsl || false,
            signatureBlock: account.signatureBlock || ''
        })
    }

    handlesRegionChange = (event, index, value) => {
        this.setState({
            location: value
        })
    }

    handlesDeployClick = event => {

        event.preventDefault()
        const { mutate, landscapes, tags, params } = this.props
        const { router } = this.context
        const { username } = auth.getUserInfo()

        let currentTag = {};
        let _id = '';
        let deploymentToCreate = {
            cloudFormationParameters: {},
            tags: {}
        }

        // map all fields to deploymentToCreate
        for (let key in this.refs) {
            if (key.indexOf('_p') === 0) {
                deploymentToCreate.cloudFormationParameters[key.replace('_p', '')] = this.refs[key].getValue()
            }
            else if (key.indexOf('_t') === 0) {
                _id = key.replace('_t', '')
                currentTag = tags.find(ac => { return ac._id === _id })
                deploymentToCreate.tags[_id] = {}
                deploymentToCreate.tags[_id].Key = currentTag.key
                deploymentToCreate.tags[_id].Value = this.refs[key].getValue()
            } else if (key === 'rejectUnauthorizedSsl') {
                deploymentToCreate[key] = this.refs[key].isToggled()
            } else {
                deploymentToCreate[key] = this.refs[key].getValue()
            }
        }
        // attach derived fields
        deploymentToCreate.createdAt = moment()
        deploymentToCreate.createdBy = username
        deploymentToCreate.location = this.state.location
        deploymentToCreate.accountName = this.state.accountName
        deploymentToCreate.landscapeId = params.landscapeId

        let JSONTags = JSON.stringify(deploymentToCreate.tags)
        deploymentToCreate.tags = JSONTags

        let JSONString = JSON.stringify(deploymentToCreate.cloudFormationParameters)
        deploymentToCreate.cloudFormationParameters = JSONString

        mutate({
            variables: { deployment: deploymentToCreate }
        }).then(({ data }) => {
            // TODO: add check to get status of deployment
            setTimeout(() => router.push({ pathname: `/landscape/${this.state.currentLandscape._id}` }), 1500)
        }).catch(error => console.log(error))
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
