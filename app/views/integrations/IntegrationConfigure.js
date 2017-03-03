
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
// const confirm = Modal.confirm

class IntegrationConfigure extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showDialog: false,
        integration:
          {
            _id: "managedvpc1",
            name:'Managed VPCs'
          },
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
    }
    componentWillReceiveProps(){
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
              </Row>

              <Row style={{width:'100%', justifyContent:'center'}}>
                <Paper className={cx({ 'landscape-card': false })} style={{width:500, minHeight:300, justifyContent:'center'}} zDepth={3} rounded={false}>
                        {/* header */}
                        <Row start='xs' top='xs' style={{ padding: '20px 0px' }}>
                            <Col xs={8}>
                                <img id='landscapeIcon' style={{width:50}} src={defaultGithubImage}/>
                            </Col>
                            <Col xs={4}>
                            </Col>
                        </Row>

                        <Row style={{ margin: '0px 0px', justifyContent:'center'}}>
                            <TextField floatingLabelText="Github Username" label="Github Username" ref="name"/>
                        </Row>
                        <Row style={{ margin: '0px 0px', justifyContent:'center'}}>
                          <TextField floatingLabelText="Github Password" type="password" label="Password"/>
                        </Row>
                        <Row  style={{ margin: '10px 20px', justifyContent:'center'}}>
                          <RaisedButton label="Link"/>
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

IntegrationConfigure.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

IntegrationConfigure.contextTypes = {
    router: PropTypes.object
}

export default IntegrationConfigure
