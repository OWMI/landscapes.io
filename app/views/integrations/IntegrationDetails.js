import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit, IoIosCloudUploadOutline, IoAndroidClose, IoIosPlusEmpty } from 'react-icons/lib/io'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { Card, CardHeader, CardActions, CardText, FlatButton, Paper, RaisedButton, TextField, Dialog } from 'material-ui'
import axios from 'axios'

import { Loader } from '../../components'
import { auth } from '../../services/auth'

import materialTheme from '../../style/custom-theme.js';
import defaultImage from '../../style/AWS.png';
import vpcImage from '../../style/vpc.png';
// const confirm = Modal.confirm

class IntegrationDetails extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showDialog: false,
        integration:
          {
            _id: 'managedVPC',
            name:'Managed VPCs',
            username:'wowcroudsvc',
            password:'Mojo2013',
            imageUri: vpcImage
          },
        nativeObject: [],
        loading: true,
        currentUsers:[],
        removedUsers:[]

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
    componentWillMount(){
      var currentUser = auth.getUserInfo();
      if(auth.getUserInfo().isGroupAdmin){
        currentUser.isGroupAdmin = true
      }
      this.setState({ currentUser })
      function GetRepo() {
          var data = {
            repoOwner: 'wowcroud',
            repoName: 'VPCPrivate',
            deployFolderName: 'managedVPC'
          }
          return new Promise((resolve, reject) => {
              axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/repo`, data).then(res => {
                var yamlData = {
                  type:'managedVPC',
                  locations: [
                    res.data.location + '/roles/cloud-admins/vars/main.yml'
                    // res.data.location + '/hosts.yml'
                  ]
                }
                return axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/yaml/parse`, yamlData).then(yaml => {
                    console.log('resolve data =', yaml.data)
                    return resolve(yaml.data)
                  })
              }).catch(err => {
                  return reject(err)
              })
          })
      }
      GetRepo().then((data) =>{
        console.log('data', data)
        var update = true;
        this.setState({nativeObject: []})
        var nativeObject = {}
        this.setState({loading: false})
        data.map(object =>{
          console.log('object', object)

          Object.keys(object.items).map(item =>{
            console.log('item', item)
            nativeObject[item] = object.items[item];
            console.log('nativeObject', nativeObject)
          })
          this.setState({nativeObject: nativeObject, update: [...update]})
          console.log('this.state.nativeObject', this.state.nativeObject)
        })
      })
      .catch(() =>{
        this.setState({loading: false})
      });
    }
    componentWillReceiveProps(){
      var currentUser = auth.getUserInfo();
      if(auth.getUserInfo().isGroupAdmin){
        currentUser.isGroupAdmin = true
      }
      this.setState({ currentUser })
      function GetRepo() {
          var data = {
            repoOwner: 'wowcroud',
            repoName: 'VPCPrivate',
            deployFolderName: 'managedVPC'
          }
          return new Promise((resolve, reject) => {
              axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/repo`, data).then(res => {
                var yamlData = {
                  type:'managedVPC',
                  locations: [
                    res.data.location + '/roles/cloud-admins/vars/main.yml'
                    // res.data.location + '/hosts.yml'
                  ]
                }
                return axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/yaml/parse`, yamlData).then(yaml => {
                    console.log('resolve data =', yaml.data)
                    return resolve(yaml.data)
                  })
              }).catch(err => {
                  return reject(err)
              })
          })
      }
      GetRepo().then((data) =>{
        console.log('data', data)
        var update = true;

        var nativeObject = {}
        this.setState({nativeObject: []})
        this.setState({loading: false})
        data.map(object =>{
          console.log('object', object)
          Object.keys(object.items).map(item =>{
            console.log('item', item)
            nativeObject[item] = object.items[item];
            console.log('nativeObject', nativeObject)
          })

          this.setState({nativeObject: nativeObject, update: [...update]})
          console.log('this.state.nativeObject', this.state.nativeObject)
        })
      })
      .catch(() =>{
        this.setState({loading: false})
      });
    }

    render() {
        const { animated, viewEntersAnim, integration, currentUser } = this.state
        const { loading } = this.props

        const confirmActions = [
            <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
            <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteIntegrationClick}/>
        ]
        var nativeObject = this.state.nativeObject || [];

        console.log('NATVIE  =', nativeObject)

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
                    <Col xs={4} style={{ textAlign: 'left', marginBottom:30 }}>
                      <Row><h4><strong>Integration</strong>: {integration.name}</h4></Row>
                    </Col>
                    <Col xs={8}>
                        <RaisedButton label='Configure' onClick={this.handlesDeployClick}
                            style={{ float: 'right', marginBottom: '30px' }}
                            labelStyle={{ fontSize: '11px' }} icon={<IoIosCloudUploadOutline/>}/>
                        <RaisedButton label='Edit' onClick={this.handlesEditLandscapeClick}
                            style={{ float: 'right', marginBottom: '30px' }}
                            labelStyle={{ fontSize: '11px' }} icon={<IoEdit/>}/>
                    </Col>
                </Row>
                <Col>
                {/*
                  Object.keys(nativeObject).map((object, i) =>{
                    return (
                      <Card key={i}>
                        {console.log('TEST_______', object)}
                        <CardHeader title={object} titleStyle={{ fontSize: '13px', paddingRight: 0 }} actAsExpander={true} showExpandableButton={true}/>
                        <CardText key={i} expandable={true}>
                        <Table>
                            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                <TableRow>
                                  <TableHeaderColumn>Test</TableHeaderColumn>
                                  {
                                    /*
                                    Object.keys(nativeObject[object].items[0]).map((header, index) =>{
                                      return(
                                        <TableHeaderColumn key={index}>
                                        <p>{header}</p> {console.log('HEADER=====', header)}
                                        </TableHeaderColumn>
                                      )
                                    })
                                  }
                                </TableRow>
                            </TableHeader>
                            <TableBody displayRowCheckbox={false}>
                              <TableRow key={100}>
                                <TableRowColumn>Test info</TableRowColumn>
                                <TableRowColumn>Test info</TableRowColumn>
                              </TableRow>
                                {
                                    nativeObject[object].map((item, itemIndex) => {
                                        return (
                                            <TableRow key={`${itemIndex}`}>

                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                        </CardText>
                    </Card>)
                  })
                */}
                </Col>
            </div>
        )
    }

    handlesDialogToggle =  (integration, event) => {
        this.setState({
            showDialog: !this.state.showDialog,
            activeIntegration: integration
        })
    }

    handlesCreateIntegrationClick = event => {
        const { router } = this.context
        router.push({ pathname: '/integrations/create' })
    }

    handlesEditIntegrationClick = (integration, event) => {
        const { router } = this.context
        router.push({ pathname: '/integrations/update/' + integration._id })
    }
    handlesViewIntegrationClick = (integration, event) => {
        const { router } = this.context
        router.push({ pathname: '/integrations/' + integration._id })
    }

    handlesClickButton = () =>{
      var data = ''
      axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/commit`, data).then(res => {
        console.log('res', res)
      }).catch(err => console.error(err))
    }

    handlesDeleteIntegrationClick = (event) => {
        event.preventDefault()
        this.setState({
          loading: true
        })
        const { mutate } = this.props
        const { router } = this.context

        this.handlesDialogToggle()

        mutate({
            variables: { integration: this.state.activeIntegration }
         }).then(({ data }) => {
           this.props.refetchIntegrations({}).then(({ data }) =>{
             this.setState({
               successOpen: true,
               loading: false
             })
             router.push({ pathname: '/integrations' })
           })
           .catch((error) => {
             this.setState({loading: false})
           })
        }).catch((error) => {
        })
    }
}

IntegrationDetails.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

IntegrationDetails.contextTypes = {
    router: PropTypes.object
}

export default IntegrationDetails
