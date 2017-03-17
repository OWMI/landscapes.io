
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
import vpcImage from '../../style/vpc.png';
// const confirm = Modal.confirm

class Integrations extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showDialog: false,
        currentUsers:[],
        removedUsers:[],
        retrievingRepo: false

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
      const { integrations } = this.props;
      console.log('integrations', integrations)

      var _integrations = integrations || [];
      this.setState({integrations: _integrations})
      if(!_integrations.length ){
        _integrations = [
          {
            _id: "managedvpc1",
            name:'Managed VPC',
            imageUri: vpcImage,
            type: "managedVPC"
          }
        ]
        this.setState({integrations: _integrations})
      }

      var currentUser = auth.getUserInfo();
      if(auth.getUserInfo().isGroupAdmin){
        currentUser.isGroupAdmin = true
      }
      this.setState({ currentUser })
    }

    componentWillReceiveProps(nextProps){
      const { integrations } = nextProps;
      console.log('integrations', integrations)
      var _integrations = integrations || [];
      this.setState({integrations: _integrations})
      if(!_integrations.length ){
        _integrations = [
          {
            _id: "managedvpc1",
            name:'Managed VPC',
            imageUri: vpcImage,
            type: "managedVPC"
          }
        ]
        this.setState({integrations: _integrations})
      }
      var currentUser = auth.getUserInfo();
      if(auth.getUserInfo().isGroupAdmin){
        currentUser.isGroupAdmin = true
      }
      this.setState({ currentUser })
    }

    render() {
        const { animated, viewEntersAnim, integrations, currentUser } = this.state
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
                <a style={{ fontSize: '20px', cursor: 'pointer' }}>Integrations</a>
                <div className="filter-list" style={{marginTop:-5, marginBottom:10}}>
                </div>
                <a>
                </a>
              </Row>
                <ul>
                    {
                        integrations.map((integration, i) =>

                        <Paper key={i} className={cx({ 'landscape-card': true })} onClick={this.handlesViewIntegrationClick.bind(this, integration)} style={{backgroundColor: materialTheme.palette.primary2Color}} zDepth={3} rounded={false}>
                                {/* header */}
                                <Row start='xs' top='xs' style={{ padding: '20px 0px' }}>
                                    <Col xs={8}>
                                        <img id='landscapeIcon' src={integration.imageUri || vpcImage}/>
                                    </Col>
                                    <Col xs={4}>
                                        {
                                            currentUser.isGlobalAdmin
                                            ?
                                              <div>
                                                {
                                                  !integration.username || !integration.password
                                                  ?
                                                  <FlatButton id='landscape-deploy' onTouchTap={this.handlesCreateIntegrationClick.bind(this, integration)}
                                                      label='Add' labelStyle={{ fontSize: '10px' }}/>
                                                  :
                                                  <FlatButton id='landscape-deploy' onTouchTap={this.handlesEditIntegrationClick.bind(this, integration)}
                                                      label='Edit' labelStyle={{ fontSize: '10px' }}/>
                                                }
                                              </div>
                                            :
                                                null
                                        }
                                        {
                                          /*  currentUser.isGlobalAdmin && integration.username
                                            ?
                                                <FlatButton id='landscape-deploy' onTouchTap={this.handlesViewIntegrationClick.bind(this, integration)}
                                                    label='Run Script' labelStyle={{ fontSize: '10px' }}/>
                                            :
                                                null */
                                        }
                                    </Col>
                                </Row>

                                <Row style={{ margin: '0px 20px', height: '95px' }}>
                                    <div id='landscape-title'>{integration.name}</div>
                                </Row>
                        </Paper>)
                    }
                </ul>
            </div>
        )
    }

    handlesDialogToggle =  (integration, event) => {
        this.setState({
            showDialog: !this.state.showDialog,
            activeIntegration: integration
        })
    }

    handlesCreateIntegrationClick = (integration, event) => {
        const { router } = this.context
        router.push({ pathname: '/integration/configure/' + integration._id })
    }
    handlesEditIntegrationClick = (integration, event) => {
        const { router } = this.context
        router.push({ pathname: '/integration/configure/' + integration._id })
    }
    handlesViewIntegrationClick = (integration, event) => {
        const { router } = this.context
        if(!integration.repoURL){
          router.push({ pathname: '/integration/configure/' + integration._id })
        }
        else{
          router.push({ pathname: '/integration/' + integration._id })
        }
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

Integrations.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

Integrations.contextTypes = {
    router: PropTypes.object
}

export default Integrations
