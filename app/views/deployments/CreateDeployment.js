import axios from 'axios'
import cx from 'classnames'
import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import { IoIosCloudUploadOutline } from 'react-icons/lib/io'
import { AutoComplete, Checkbox, Card, CardHeader, CardText, MenuItem, RaisedButton, SelectField, TextField, Toggle } from 'material-ui'

import './deployments.style.scss'
import { Loader } from '../../components'
import { auth } from '../../services/auth'


class CreateDeployment extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showAddTag: false
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
        const { landscapes, accounts, groups, integrations, params } = this.props

        var integration = {}
        if (integrations) {
            integration = integrations.find(integration => {
                return integration.type === 'managedVPC'
            })
        }

        this.setState({integration})
        let _landscapes = landscapes || []
        let landscapeAccounts = []

        const currentLandscape = _landscapes.find(ls => {
            return ls._id === params.landscapeId
        })

        if (currentLandscape) {
            const template = JSON.parse(currentLandscape.cloudFormationTemplate)

            if (isGlobalAdmin) {
                landscapeAccounts = accounts || []
            } else {
                landscapeAccounts = auth.getUserInfo().accounts[params.landscapeId] || []
            }

            this.setState({templateDescription: template.Description, templateParameters: template.Parameters, currentLandscape, landscapeAccounts})
            var managedVPCGroups = []
            if (groups) {
                //Check to see if part of a managedVPC group
                groups.forEach(group => {
                    group.landscapes.forEach(landscape => {
                        if (landscape === currentLandscape._id) {
                            if (group.managedVPC) {
                                managedVPCGroups.push(group.name)
                            }
                        }
                    })
                })
            }
            this.setState({managedVPCGroups})
        }
    }

    componentWillReceiveProps(nextProps) {
        const { isGlobalAdmin } = auth.getUserInfo()
        const { landscapes, accounts, groups, integrations, params } = nextProps

        let integration = {}
        if (integrations) {
            integration = integrations.find(integration => {
                return integration.type === 'managedVPC'
            })
        }
        this.setState({integration})
        let _landscapes = landscapes || []
        let landscapeAccounts = []

        const currentLandscape = _landscapes.find(ls => {
            return ls._id === params.landscapeId
        })

        if (currentLandscape) {
            const template = JSON.parse(currentLandscape.cloudFormationTemplate)

            if (isGlobalAdmin) {
                landscapeAccounts = accounts || []
            } else {
                landscapeAccounts = auth.getUserInfo().accounts[params.landscapeId] || []
            }

            this.setState({templateDescription: template.Description, templateParameters: template.Parameters, currentLandscape, landscapeAccounts})
            var managedVPCGroups = []
            if (groups) {
                //Check to see if part of a managedVPC group
                groups.forEach(group => {
                    group.landscapes.forEach(landscape => {
                        if (landscape === currentLandscape._id) {
                            if (group.managedVPC) {
                                managedVPCGroups.push(group.name)
                            }
                        }
                    })
                })
            }
            this.setState({managedVPCGroups})
        }
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }

    render() {

        const { loading, accounts, tags } = this.props
        const { isGlobalAdmin, isGroupAdmin } = auth.getUserInfo()
        const { animated, cfParams, viewEntersAnim, templateParameters, templateDescription,
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

        if (loading || this.state.loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <Row center='xs' middle='xs'>
                    <Col xs={6} lg={9} className={cx( { 'create-deployment': false } )}>
                        <Row middle='xs'>
                            <Col xs={4} style={{ textAlign: 'left' }}>
                                <h4>New Deployment</h4>
                            </Col>
                            <Col xs={8}>
                              <RaisedButton label='Cancel' onClick={
                                  () => {const { router } = this.context
                                  router.push({ pathname: `/landscape/${this.state.currentLandscape._id}` })
                                }}
                                primary={true} style={{ float: 'right', margin: '30px 5px' }} labelStyle={{ fontSize: '11px' }}/>
                                <RaisedButton label='Deploy' onClick={this.handlesDeployClick}
                                    style={{ float: 'right', margin: '30px 5px' }}
                                    labelStyle={{ fontSize: '11px' }} icon={<IoIosCloudUploadOutline/>}/>
                            </Col>
                        </Row>
                        <Card>
                          {
                            this.state.errorMessage
                            ?
                                <p style={{color: 'red'}}>{this.state.message}</p>
                            :
                                null
                          }
                          <Row style={{marginLeft:10, marginRight:10}}>
                            <Col xs={6}>
                                <TextField id='stackName' ref='stackName' floatingLabelText='Stack Name' className={cx( { 'two-field-row': true } )} fullWidth={true}/>
                            </Col>
                            <Col xs={6}>
                              {
                                !isGlobalAdmin
                                ?
                                    <SelectField id='accountName' floatingLabelText='Account Name' value={this.state.accountName} onChange={this.handlesAccountChange}
                                         fullWidth={true} floatingLabelStyle={{ left: '0px' }} className={cx( { 'two-field-row': true } )}>
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
                                         fullWidth={true} floatingLabelStyle={{ left: '0px' }} className={cx( { 'two-field-row': true } )}>
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
                            </Col>
                          </Row>
                          <Row style={{marginLeft:10, marginRight:10}}>
                            <Col xs={6}>
                              <SelectField id='location' floatingLabelText='Region' value={this.state.location} onChange={this.handlesRegionChange}
                                   fullWidth={true} floatingLabelStyle={{ left: '0px' }} className={cx( { 'two-field-row': true } )}>
                                  {
                                      menuItems.map((item, index) => {
                                          return (
                                              <MenuItem key={index} value={item.value} primaryText={item.text}/>
                                          )
                                      })
                                  }
                              </SelectField>
                            </Col>
                            <Col xs={6}>
                              {/* <TextField id='billingCode' ref='billingCode' floatingLabelText='Billing Code' fullWidth={true}
                                  className={cx( { 'two-field-row': true } )}/> */}
                                  <div style={{marginTop:35, marginLeft: 10, width:'100%'}}>
                                    <Checkbox label="Managed VPC" onCheck={this.handlesOnManagedVPCChange} checked={this.state.managedVPC}  className={cx( { 'two-field-row': true } )} style={{marginTop:15, marginBottom: 15, marginLeft: 10, textAlign: 'left', width:150}}/>
                                    {
                                      this.state.errorManagedVPCMessage
                                      ?
                                      <p style={{color:'red'}}>{this.state.errorManagedVPCMessage}</p>
                                      :
                                      null
                                    }
                                    {
                                      this.state.retrievingData
                                      ?
                                      <p>{this.state.retrievingData}</p>
                                      :
                                      null
                                    }
                                  </div>
                            </Col>
                          </Row>

                          <Row style={{marginLeft:10, marginRight:10}}>
                            <TextField id='accessKeyId' ref='accessKeyId' value={this.state.accessKeyId} floatingLabelText='Access Key ID' fullWidth={true}/>
                          </Row>
                          <Row style={{marginLeft:10, marginRight:10}}>
                            {
                                isGlobalAdmin || isGroupAdmin
                                ?
                                    secretAccessKey
                                    ?
                                        <TextField id='secretAccessKey' ref='secretAccessKey' value={secretAccessKey.substring(0, 255)} multiLine={true} rows={4}
                                            maxLength={255} floatingLabelStyle={{ left: '0px' }} floatingLabelText='Secret Access Key' fullWidth={true}/>
                                    :
                                        <TextField id='secretAccessKey' ref='secretAccessKey' multiLine={true} rows={1} rowsMax={4}
                                            maxLength={255} floatingLabelStyle={{ left: '0px' }} floatingLabelText='Secret Access Key' fullWidth={true}/>
                                :
                                    secretAccessKey
                                        ?
                                            <TextField id='secretAccessKey' ref='secretAccessKey' value={secretAccessKey.replace(/./g, '*')} multiLine={true} rows={4}
                                                maxLength={255} floatingLabelStyle={{ left: '0px' }} floatingLabelText='Secret Access Key' fullWidth={true}/>
                                        :
                                            <TextField id='secretAccessKey' ref='secretAccessKey' multiLine={true} rows={1} rowsMax={4}
                                                maxLength={255} floatingLabelStyle={{ left: '0px' }} floatingLabelText='Secret Access Key' fullWidth={true}/>
                            }

                          </Row>
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
                        <Col xs={12} style={{ minHeight: 200 }}>
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

                                            const paramsToFetch = Object.keys(templateParameters).filter(param => {
                                                return templateParameters[param].Type.indexOf('AWS::') > -1
                                            })

                                            if (cfParams && templateParameters[param].Type.indexOf('AWS::') > -1) {
                                                let i = paramsToFetch.indexOf(param)
                                                return (
                                                    <Row key={`cf-${i}`} bottom='xs' style={{ height: 72 }}>
                                                        <AutoComplete id={'_p'+param} ref={'_p'+param} fullWidth={true} openOnFocus={true}
                                                            hintText={templateParameters[param].Description}
                                                            hintStyle={{ opacity: 1, fontSize: '10px', bottom: '-20px', textAlign: 'left' }}
                                                            filter={AutoComplete.caseInsensitiveFilter}
                                                            dataSource={cfParams[i]}
                                                            dataSourceConfig={this.handlesSourceConfig(param)}
                                                        />
                                                    </Row>
                                                )
                                            }
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
                            <Col xs={12} style={{ minHeight: 200 }}>
                              <Row style={{marginBottom: 20}}>
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
                                                      <TextField id={'_t'+ tag._id} ref={'_t'+tag._id} fullWidth={true} onChange={this.handlesTagChange} defaultValue={tag.defaultValue}
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
                              {
                                this.state.showAddTag
                                ?
                                  <div>
                                  <Card style={{border: '1px solid lightgray'}}>
                                    <Row style={{marginTop: 10}}>
                                      <Col xs={4} style={{textAlign:'left', paddingLeft:15}}>
                                        <h4 >New Tag</h4>
                                      </Col>
                                      <Col xs={8}>
                                          <RaisedButton label="Add" style={{marginRight:10, float: 'right'}}
                                            onClick={() => {
                                                var newTag = {
                                                  key: this.state.newKey,
                                                  defaultValue: this.state.newValue,
                                                  _id: Date.now().toString()
                                                }
                                              _tags.push(newTag)
                                                this.setState({showAddTag: !this.state.showAddTag, newKey: '', newValue: '', tags: _tags})
                                              }}/>
                                          <RaisedButton label="Cancel" style={{marginRight:10, float: 'right'}} onClick={() => {
                                              this.setState({showAddTag: !this.state.showAddTag})
                                            }}/>
                                      </Col>
                                    </Row>
                                  <Row style={{marginLeft: 10, marginRight: 10}}>
                                    <Col xs={4}>
                                      <TextField id='key' onChange={this.handlesNewKeyChange} floatingLabelText='Key' style={{marginRight: 10, marginLeft: 10}} fullWidth={true}/>
                                    </Col>
                                    <Col xs={8}>
                                      <TextField id='defaultValue' onChange={this.handlesNewValueChange} floatingLabelText='Value' style={{marginRight: 10, marginLeft: 10}} fullWidth={true}/>
                                    </Col>
                                  </Row>
                                </Card>
                              </div>

                                :
                                <RaisedButton label="Add Tag" onClick={() => this.setState({showAddTag: !this.state.showAddTag})} style={{marginBottom:120}}/>
                              }

                            </Col>
                        </Col>
                </Row>
            </div>
        )
    }

    handlesAccountChange = (event, index, accountName) => {

        const { templateParameters } = this.state
        const { accounts, landscapes, params, fetchAvailabilityZones, fetchHostedZones, fetchImages,
                fetchInstances, fetchKeyPairs, fetchSecurityGroups, fetchSubnets, fetchVolumes, fetchVpcs } = this.props

        const account = accounts.find(acc => { return acc.name === accountName })
        const currentLandscape = landscapes.find(ls => { return ls._id === params.landscapeId })
        const template = JSON.parse(currentLandscape.cloudFormationTemplate)

        const paramsToFetch = Object.keys(template.Parameters).filter(param => {
            return template.Parameters[param].Type.indexOf('AWS::') > -1
        })

        console.log(account)
        this.state.location =  account.region
        this.state.accountName = account.name
        this.state.secretAccessKey = account.secretAccessKey
        this.state.accessKeyId = account.accessKeyId

        this.refs.location =  account.region
        this.refs.accountName = account.name
        this.refs.secretAccessKey = account.secretAccessKey
        this.refs.accessKeyId = account.accessKeyId

        this.refs = account;
        let promises = paramsToFetch.map(param => {
            switch (param) {

                case 'AvailabilityZone':
                    return fetchAvailabilityZones({
                        variables: { region: account.region }
                    }).then(({ data }) => {
                        return data.fetchAvailabilityZones
                    }).catch(err => console.error(err))
                    break

                case 'HostedZone':
                    return fetchHostedZones({
                        variables: { region: account.region }
                    }).then(({ data }) => {
                        console.log(data)
                        return data.fetchHostedZones
                    }).catch(err => console.error(err))
                    break

                case 'KeyName':
                    return fetchKeyPairs({
                        variables: { region: account.region }
                    }).then(({ data }) => {
                        return data.fetchKeyPairs
                    }).catch(err => console.error(err))
                    break

                case 'Image':
                    return fetchImages({
                        variables: { region: account.region }
                    }).then(({ data }) => {
                        return data.fetchImages
                    }).catch(err => console.error(err))
                    break

                case 'InstanceId':
                    return fetchInstances({
                        variables: { region: account.region }
                    }).then(({ data }) => {
                        return data.fetchInstances
                    }).catch(err => console.error(err))
                    break

                case 'SecurityGroupId':
                case 'SecurityGroupName':
                    return fetchSecurityGroups({
                        variables: { region: account.region }
                    }).then(({ data }) => {
                        return data.fetchSecurityGroups
                    }).catch(err => console.error(err))
                    break

                case 'SubnetId':
                    return fetchSubnets({
                        variables: { region: account.region }
                    }).then(({ data }) => {
                        return data.fetchSubnets
                    }).catch(err => console.error(err))
                    break

                case 'VolumeId':
                    return fetchVolumes({
                        variables: { region: account.region }
                    }).then(({ data }) => {
                        return data.fetchVolumes
                    }).catch(err => console.error(err))
                    break

                case 'VpcId':
                    return fetchVpcs({
                        variables: { region: account.region }
                    }).then(({ data }) => {
                        return data.fetchVpcs
                    }).catch(err => console.error(err))
                    break

                default:
                    break

            }
        })

        return Promise.all(promises).then(cfParams => {
            console.log(cfParams)

            this.setState({ cfParams })
        })
    }

    handlesOnManagedVPCChange = event => {
        event.preventDefault()
        if(!this.state.integration){
          this.setState({errorManagedVPCMessage: 'Managed VPC integration configuration is required to make type: Managed VPC'})
        }
        else if(this.state.managedVPCGroups.length === 0){
          this.setState({errorManagedVPCMessage: 'Landscape must be part of a Managed VPC Group.'})
        }
        else{
          this.setState({errorManagedVPCMessage: null})
          this.setState({managedVPC: !this.state.managedVPC})
        }
    }


    handlesNewKeyChange = event => {
        this.setState({
            newKey: event.target.value
        })
    }

    handlesNewValueChange = event => {
        this.setState({
            newValue: event.target.value
        })
    }

    handlesRegionChange = (event, index, value) => {
        this.setState({
            location: value
        })
    }

    handlesTagChange = (event, index, value) => {
        this.setState({ errorMessage: false })
    }

    handlesFilteringDatasource = (searchText, key) => {
        searchText !== '' && key.indexOf(searchText) !== -1
    }

    handlesSourceConfig = paramName => {
        switch (paramName) {
            case 'AvailabilityZone':
                return { text: 'ZoneName', value: 'ZoneName' }

            case 'HostedZone':
                return { text: 'Id', value: 'Id' }

            default:
                return { text: paramName, value: paramName }
        }
    }

    getRepoData = () => {
        return new Promise((resolve, reject) => {

            this.setState({errorManagedVPCMessage: null})
            const {integration} = this.state
            function GetRepo() {
                var data = {
                    deployFolderName: integration.type,
                    repoURL: integration.repoURL,
                    username: integration.username,
                    password: integration.password
                }
                return new Promise((resolve, reject) => {
                    axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/repo`, data).then(res => {
                        var yamlData = {
                            type: 'managedVPC',
                            locations: [res.data.location + '/hosts']
                        }
                        return axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/yaml/parse`, yamlData).then(yaml => {
                            return resolve(yaml.data)
                        })
                    }).catch(err => {
                        return reject(err)
                        this.setState({retrievingData: null})
                        this.setState({errorManagedVPCMessage: 'Integration configured with invalid credentials. Unable to complete request.'})
                    })
                })
            }

            GetRepo().then((data) => {
                resolve(data)
                this.setState({repoData: data})
                this.setState({githubData: integration})
                this.setState({retrievingData: null})
            }).catch(() => {
                reject()
                this.setState({loading: false})
            })
        })
    }

    convertAndPush = (landscapeIPs) => {
        const { users } = this.props

        return new Promise((resolve, reject) => {
            var repoData = this.state.repoData

            this.state.repoData.forEach((repo, index) => {
                if (repo.items) {
                    Object.keys(repo.items).find(key => {
                        this.state.managedVPCGroups.forEach(groupName => {
                            if (key === groupName) {
                                landscapeIPs.forEach(landscapeIP => {
                                    repoData[index].items[key].push(landscapeIP)
                                })
                            }
                            if (!repoData[index].items[groupName]) {
                                repoData[index].items[groupName] = []
                                landscapeIPs.forEach(landscapeIP => {
                                    repoData[index].items[groupName].push(landscapeIP)
                                })
                            }
                        })
                    })
                    axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/yaml/stringify`, repoData).then(res => {
                        var newData = {
                            githubData: this.state.githubData,
                            repoData: res.data
                        }
                        return axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/commit`, newData).then(res => {
                            return resolve(res.data)
                        }).catch(err => {
                            return reject(err)
                        })
                    }).catch(err => {
                        return reject(err)
                    })
                }
            })
        })
    }

    handlesDeployClick = event => {

        event.preventDefault()

        const { mutate, landscapes, tags, params, refetch } = this.props
        const { router } = this.context
        const { username } = auth.getUserInfo()

        let currentTag = {}
        let _id = ''
        let deploymentToCreate = {
            cloudFormationParameters: {},
            tags: {}
        }

        this.setState({ loading: true })
        console.log(this.refs)

        // map all fields to deploymentToCreate
        for (let key in this.refs) {
            if (key.indexOf('_p') === 0) {
                if (this.refs[key].props.value) {
                    deploymentToCreate.cloudFormationParameters[key.replace('_p', '')] = this.refs[key].props.value
                } else {
                        deploymentToCreate.cloudFormationParameters[key.replace('_p', '')] = this.refs[key].getValue()
                }
            } else if (key.indexOf('_t') === 0) {
                _id = key.replace('_t', '')
                currentTag = tags.find(ac => {
                    return ac._id === _id
                })

                if (!currentTag) {
                    currentTag = this.state.tags.find(ac => {
                        return ac._id === _id
                    })
                }

                deploymentToCreate.tags[_id] = {}
                deploymentToCreate.tags[_id].Key = currentTag.key
                deploymentToCreate.tags[_id].Value = this.refs[key].getValue()

                if (currentTag.isRequired && this.refs[key].getValue() === '') {
                    return this.setState({ errorMessage: true, message: 'Please fill in all required tags.', loading: false })
                }

                if (!currentTag.isRequired && this.refs[key].getValue() === '') {
                    delete deploymentToCreate.tags[_id]
                }

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

        if (!this.state.errorMessage) {
            mutate({
                variables: { deployment: deploymentToCreate }
            }).then(({ data }) => {
                refetch({}).then(({data}) => {
                  if(this.state.managedVPC){
                    var returnedIPs = ['IP.12.12.12']
                    this.getRepoData().then(()=>{
                      this.convertAndPush(returnedIPs).then(() =>{
                        // TODO: add check to get status of deployment
                        setTimeout(() => {
                          this.setState({loading: false})
                          router.push({ pathname: `/landscape/${this.state.currentLandscape._id}` })}, 2000)
                      })
                    })
                  }
                  else {
                    // TODO: add check to get status of deployment
                    setTimeout(() => {
                      this.setState({loading: false})
                      router.push({ pathname: `/landscape/${this.state.currentLandscape._id}` })}, 2000)
                  }
                })
            }).catch(error => console.log(error))
        }
    }
}

CreateDeployment.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired,
    refetch: PropTypes.func.isRequired
}

CreateDeployment.contextTypes = {
    router: PropTypes.object
}

export default CreateDeployment
