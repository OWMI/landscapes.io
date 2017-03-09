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
      currentUsers:[],
      removedUsers:[],
      data:{}

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
      const { integrations, params } = this.props;
      var integration = {};
      if(integrations){
        integration = integrations.find(integration => { return integration._id === params.id })
      }
      console.log('integration', integration)

      this.setState({integration})

      var currentUser = auth.getUserInfo();
      if(auth.getUserInfo().isGroupAdmin){
        currentUser.isGroupAdmin = true
      }
      this.setState({ currentUser })

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
                  type:'managedVPC',
                  locations: [
                    res.data.location + '/roles/cloud-admins/vars/main.yml'
                  ]
                }
                return axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/yaml/parse`, yamlData).then(yaml => {
                    return resolve(yaml.data)
                  })
              }).catch(err => {
                  return reject(err)
              })
          })
      }
      GetRepo().then((data) =>{
        console.log('data.rawData ------ ', data)
        var update = true;
        this.setState({ data: [...data]})
        this.setState({nativeObject: []})
        var nativeObject = {}
        this.setState({loading: false})
        data.map(object =>{
          Object.keys(object.items).map(item =>{
            nativeObject[item] = object.items[item];
          })
          this.setState({nativeObject: nativeObject, update: [...update]})
        })
      })
      .catch(() =>{
        this.setState({loading: false})
      });
    }
    componentWillReceiveProps(nextProps){
      const { integrations, params } = nextProps;
      var integration = {};
      if(integrations){
        integration = integrations.find(integration => { return integration._id === params.id })
      }
      console.log('integration', integration)
      this.setState({integration})

      var currentUser = auth.getUserInfo();
      if(auth.getUserInfo().isGroupAdmin){
        currentUser.isGroupAdmin = true
      }
      this.setState({ currentUser })
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
                  type:'managedVPC',
                  locations: [
                    res.data.location + '/roles/cloud-admins/vars/main.yml'
                  ]
                }
                return axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/yaml/parse`, yamlData).then(yaml => {
                    return resolve(yaml.data)
                  })
              }).catch(err => {
                  return reject(err)
              })
          })
      }
      GetRepo().then((data) =>{
        var update = true;
        console.log('data.rawData ------ ', data)
        this.setState({ data: [...data]})
        var nativeObject = {}
        this.setState({nativeObject: []})
        this.setState({loading: false})
        data.map(object =>{
          Object.keys(object.items).map(item =>{
            nativeObject[item] = object.items[item];
          })
          this.setState({nativeObject: nativeObject, update: [...update]})
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
        console.log('this.rawData', this.state.data)
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
                        <RaisedButton label='Edit' onClick={this.handlesEditLandscapeClick}
                            style={{ float: 'right', marginBottom: '30px' }}
                            labelStyle={{ fontSize: '11px' }} icon={<IoEdit/>}/>
                    </Col>
                </Row>
                <Col>
                  <Paper key={'integrationDetails'} onClick={this.handlesViewIntegrationClick.bind(this, integration)} zDepth={3} rounded={false}>

                  </Paper>
                  <div>
                      {
                        this.state.data && this.state.data['rawData']
                        ?
                        <div>
                          <p>{this.state.data.rawData}</p>
                          {console.log('DATA', this.state.data)}
                        </div>
                        :
                        <div>
                          <p>{this.state.data.path}</p>
                          {console.log('DATA reject', this.state.data.path)}
                        </div>
                      }
                  </div>
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
