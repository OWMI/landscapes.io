
import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit, IoIosCloudUploadOutline, IoAndroidClose, IoIosPlusEmpty } from 'react-icons/lib/io'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { CardHeader, CardActions, CardText, FlatButton, Paper, RaisedButton, TextField, Dialog } from 'material-ui'
import axios from 'axios'

import { Loader } from '../../components'
import { auth } from '../../services/auth'

import materialTheme from '../../style/custom-theme.js';
import defaultImage from '../../style/AWS.png';
import defaultGithubImage from '../../style/github.png';
import vpcImage from '../../style/vpc.png';
// const confirm = Modal.confirm

class IntegrationConfigure extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showDialog: false,
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
      const { integrations, params } = this.props;
      var integration = {};
      if(integrations){
        integration = integrations.find(integration => {return integration._id === params.id})
        if(!integration){
          integration = {
            name:'Managed VPCs',
            type: 'managedVPC',
            imageUri: vpcImage
          }
        }
        this.setState({integration})
      }
      else{
        integration = {
          name:'Managed VPCs',
          type: 'managedVPC',
          imageUri: vpcImage
        }
        this.setState({integration})
      }
      var currentUser = auth.getUserInfo();
      if(auth.getUserInfo().isGroupAdmin){
        currentUser.isGroupAdmin = true
      }
      this.setState({ currentUser })
    }
    componentWillReceiveProps(nextProps){
      const { integrations, params } = nextProps;
      var integration = {};
      if(integrations){
        integration = integrations.find(integration => {return integration._id === params.id})
        if(!integration){
          integration = {
            name:'Managed VPCs',
            type: 'managedVPC',
            imageUri: vpcImage
          }
        }
        this.setState({integration})
      }
      else{
        integration = {
          name:'Managed VPCs',
          type: 'managedVPC',
          imageUri: vpcImage
        }
        console.log('COULD NOT FIND', integration)
        this.setState({integration})
      }
      var currentUser = auth.getUserInfo();
      if(auth.getUserInfo().isGroupAdmin){
        currentUser.isGroupAdmin = true
      }
      this.setState({ currentUser })

    }
    render() {
        const { animated, viewEntersAnim, integration, currentUser } = this.state
        const { loading } = this.props

        const confirmActions = [
            <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
            <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteIntegrationClick}/>
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
              <Row style={{justifyContent: 'space-between', width: '100%'}}>
                <h4>Configure Integration</h4>
                  <div  style={{ margin: '10px 20px', justifyContent:'center'}}>
                    <RaisedButton label="Save" onClick={this.handlesCreateIntegrationClick}/>
                  </div>
              </Row>
              <Row style={{width:'100%', justifyContent:'center'}}>
                <Paper className={cx({ 'landscape-card': false })} style={{width:500, minHeight:300, justifyContent:'center'}} zDepth={3} rounded={false}>
                        {/* header */}
                          {
                              this.state.errorMessage
                              ?
                                  <p style={{ color: 'red', textAlign: 'center', marginTop:15 }}>
                                      {this.state.errorMessage}
                                  </p>
                              : null
                          }
                        <Row start='xs' top='xs' style={{ padding: '20px 0px' }}>
                                <img id='landscapeIcon' style={{width:50, marginLeft:20}} src={defaultGithubImage}/>
                                {
                                  integration && integration.username
                                  ?
                                  <div style={{ marginBottom: 10, marginTop:15, marginLeft:15}}>
                                    Current Configuration: {integration.username}
                                  </div>
                                  :
                                  <div style={{ marginBottom: 10, marginTop:15, marginLeft:15}}>
                                    Current Configuration: NONE
                                  </div>
                                }
                        </Row>
                        <Row style={{ margin: '0px 0px', justifyContent:'center'}}>
                            <TextField floatingLabelText="Github Username" label="Github Username" defaultValue={integration.username || ''} ref="username"/>
                        </Row>
                        <Row style={{ margin: '0px 0px', justifyContent:'center'}}>
                          <TextField floatingLabelText="Github Password" type="password" label="Password" defaultValue={''} ref="password"/>
                        </Row>
                        <Row style={{ margin: '0px 0px', justifyContent:'center'}}>
                            <TextField id="repoURL" floatingLabelText="Github Repo URL" label="Github Repo URL" defaultValue={integration.repoURL || ''} ref="repoURL"/>
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

    handlesEditIntegrationClick = (integration, event) => {
        const { router } = this.context
        router.push({ pathname: '/integrations/update/' + integration._id })
    }
    handlesViewIntegrationClick = (integration, event) => {
        const { router } = this.context
        router.push({ pathname: '/integration/' + integration._id })
    }

    handlesClickButton = () =>{
      var data = ''
      axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/commit`, data).then(res => {
        console.log('res', res)
      }).catch(err => console.error(err))
    }

    handlesCreateIntegrationClick = (event) => {
        event.preventDefault()
        this.setState({
          loading: true,
          errorMessage: false
        })
        const { CreateIntegrationWithMutation, UpdateIntegrationWithMutation } = this.props
        const { router } = this.context
        const { integration } = this.state

        var newIntegration = integration || {}

        for (let key in this.refs) {
            newIntegration[key] = this.refs[key].getValue()
        }
        if(!newIntegration.repoURL){
          this.setState({errorMessage: 'Repository URL is required.', loading: false})
        }
        if(!newIntegration.username){
          this.setState({errorMessage: 'Github username is required.', loading: false})
        }
        if(!newIntegration.password){
          this.setState({errorMessage: 'Github password is required.', loading: false})
        }
        else{
          // this.handlesDialogToggle()
          if(!newIntegration._id){
            CreateIntegrationWithMutation({
                variables: { integration: newIntegration }
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
          else{
            UpdateIntegrationWithMutation({
                variables: { integration: newIntegration }
             }).then(({ data }) => {
               this.props.refetchIntegrations({}).then(({ data }) =>{
                 const { router } = this.context
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
              this.setState({loading: false})
            })
          }
        }
    }
}

IntegrationConfigure.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

IntegrationConfigure.contextTypes = {
    router: PropTypes.object
}

export default IntegrationConfigure
