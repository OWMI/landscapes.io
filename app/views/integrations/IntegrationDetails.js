import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit } from 'react-icons/lib/io'
import { FlatButton, Paper, RaisedButton, Dialog } from 'material-ui'
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
        this.setState({passwordInvalid: false})
        data.map(object =>{
          Object.keys(object.items).map(item =>{
            nativeObject[item] = object.items[item];
          })
          this.setState({nativeObject: nativeObject, update: [...update]})
        })
      })
      .catch(() =>{
        this.setState({loading: false})
        this.setState({passwordInvalid: true})
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
          console.log('data', data)
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
        this.setState({passwordInvalid: false})
        data.map(object =>{
          Object.keys(object.items).map(item =>{
            nativeObject[item] = object.items[item];
          })
          this.setState({nativeObject: nativeObject, update: [...update]})
        })
      })
      .catch(() =>{
        this.setState({loading: false})
        this.setState({passwordInvalid: true})
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
                        <RaisedButton label='Edit' onClick={this.handlesEditIntegrationClick}
                            style={{ float: 'right', marginBottom: '30px' }}
                            labelStyle={{ fontSize: '11px' }} icon={<IoEdit/>}/>
                    </Col>
                </Row>
                <Row style={{width: '100%', justifyContent: 'center'}}>
                  <Paper key={'integrationDetails'} style={{width:'70%'}} zDepth={3} rounded={false}>
                    <Row middle='xs'>
                        <Col xs={1} style={{ textAlign: 'left' }}>
                            <img src={this.state.integration.imageUri} style={{ width: 85 }} />
                        </Col>
                        <Col xs={10} style={{ textAlign: 'left', paddingLeft:50 }}>
                            <Row><h4>{this.state.integration.name}</h4></Row>
                        </Col>
                    </Row>
                    <Row middle='xs' style={{ flex: 1, marginLeft: 10, marginBottom: 20 }}>
                        <Col style={{ textAlign: 'left', flex: 1 }}>
                            <h4>Current Configuration:</h4>
                            <h5><strong>Type:  </strong> {this.state.integration.type}</h5>
                            <h5><strong>Repo URL: </strong> {this.state.integration.repoURL}</h5>
                            <h5><strong>Github Username: </strong> {this.state.integration.username}</h5>
                            <h5><strong>Github Email: </strong> {this.state.integration.githubEmail}</h5>
                              {
                                this.state.passwordInvalid
                                ?
                                <p>Current Configuration Password is Invalid</p>
                                :
                                null
                              }
                        </Col>
                    </Row>
                  </Paper>
                </Row>
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

    handlesEditIntegrationClick = event => {
        const { router } = this.context
        router.push({ pathname: '/integration/configure/' + this.state.integration._id })
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
