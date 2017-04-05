import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import lodash from 'lodash'
import { Card, CardHeader, CardText, MenuItem, RaisedButton, SelectField, TextField, Toggle, FlatButton } from 'material-ui'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import './accounts.style.scss'
import { Loader } from '../../components'
import { auth } from '../../services/auth'

class CreateAccount extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        loading: false,
        errorMessage: false,
        message: '',
        selectedGroupRows: []
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

    componentWillMount() {
      const { groupsByUser } = this.props
      let userGroups = [];
      let isGroupAdmin = false;
      if(auth.getUserInfo().isGroupAdmin){
        isGroupAdmin = true;
      }
      if(auth.getUserInfo().groups){
        userGroups = lodash.filter(auth.getUserInfo().groups, (group) =>{
          return group.isAdmin === true
        })
      }
      var index = null;
      var userAdminGroups = [];
      if(groupsByUser){
        userGroups.forEach(group =>{
          console.log('userGroups', userGroups)
           index = groupsByUser.map(function(o) { return o._id; }).indexOf(group.groupId);
           userAdminGroups.push(groupsByUser[index])
        })
      }
      this.setState({userAdminGroups, isGroupAdmin})
    }
    componentWillReceiveProps(nextProps){
      const { groupsByUser } = nextProps
      let userGroups = [];
      let isGroupAdmin = false;
      if(auth.getUserInfo().isGroupAdmin){
        isGroupAdmin = true;
      }
      if(auth.getUserInfo().groups){
        userGroups = lodash.filter(auth.getUserInfo().groups, (group) =>{
          return group.isAdmin === true
        })
      }
      var index = null;
      var userAdminGroups = [];
      if(groupsByUser){
        userGroups.forEach(group =>{
          console.log('userGroups', userGroups)
           index = groupsByUser.map(function(o) { return o._id; }).indexOf(group.groupId);
           userAdminGroups.push(groupsByUser[index])
        })
      }
      this.setState({userAdminGroups, isGroupAdmin})

    }

    render() {

        const { animated, viewEntersAnim, userAdminGroups, isGroupAdmin } = this.state
        const { loading, accounts } = this.props

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
                    <Col xs={6} lg={9} className={cx( { 'create-account': false } )}>
                        <Row middle='xs'>
                            <Col xs={4} style={{ textAlign: 'left' }}>
                                <h4>New Account</h4>
                            </Col>
                            <Col xs={8}>
                              <Row>
                                <Col xs={4}>

                                </Col>
                                <Col xs={4}>
                                  <RaisedButton label='Save' onClick={this.handlesCreateClick}
                                      style={{ float: 'right', margin: '30px 0px' }}
                                      labelStyle={{ fontSize: '11px' }}/>
                                </Col>
                                <Col xs={4}>
                                  <RaisedButton label='Cancel' primary={true} onClick={() => {
                                      const {router} = this.context
                                      router.push(`/accounts`)
                                  }}
                                    style={{ float: 'right', margin: '30px 0px' }}
                                    labelStyle={{ fontSize: '11px' }}/>
                                </Col>
                              </Row>
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
                            <Row>
                              <Col xs={6} style={{paddingLeft: 10}}>
                                <TextField id='name' ref='name' floatingLabelText='Name' fullWidth={true}/>
                              </Col>
                              <Col xs={6} style={{paddingRight: 10}}>
                                <SelectField id='region' floatingLabelText='Region' value={this.state.region} onChange={this.handlesRegionChange}
                                    fullWidth={true} floatingLabelStyle={{ left: '0px' }}  selectedMenuItemStyle={{maxWidth:5}}>
                                    {
                                        menuItems.map((item, index) => {
                                            return (
                                                <MenuItem key={index} value={item.value} primaryText={item.text}/>
                                            )
                                        })
                                    }
                                </SelectField>
                              </Col>
                            </Row>
                            <Row style={{marginLeft:5, marginRight:5}}>
                              <TextField id='accessKeyId' ref='accessKeyId' floatingLabelText='Access Key ID' fullWidth={true}/>
                            </Row>
                            <Row style={{marginLeft:5, marginRight:5}}>
                              <TextField id='secretAccessKey' ref='secretAccessKey' multiLine={true} multiLine={true} rows={1} rowsMax={4} floatingLabelText='Secret Access Key' fullWidth={true}
                                  floatingLabelStyle={{ left: '0px' }}/>
                                {
                                  isGroupAdmin
                                  ?
                                  <div>
                                    <h5 > Adding to a group is REQUIRED for group admins </h5>
                                      <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
                                          selectable={true} multiSelectable={true}
                                          onRowSelection={this.handleOnRowSelection}>
                                            <TableHeader displaySelectAll={true} adjustForCheckbox={true}
                                              enableSelectAll={true} >
                                              <TableRow>
                                                <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                                <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                                <TableHeaderColumn tooltip="Description">Description</TableHeaderColumn>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody displayRowCheckbox={true}
                                              showRowHover={true} stripedRows={false}
                                              deselectOnClickaway={false}>
                                              {userAdminGroups.map( (row, index) => (
                                                <TableRow key={row._id} onClick={this.handleOnClick}>
                                                <TableRowColumn><img src={row.imageUri} style={{width: 40, borderRadius: 50}} /></TableRowColumn>
                                                  <TableRowColumn>{row.name}</TableRowColumn>
                                                  <TableRowColumn>{row.description}</TableRowColumn>
                                                </TableRow>
                                                ))}
                                            </TableBody>
                                            <TableFooter
                                              adjustForCheckbox={false}
                                            >
                                            </TableFooter>
                                          </Table>
                                  </div>
                                      :
                                      null
                                }
                            </Row>

                            <CardHeader title='Advanced' titleStyle={{ fontSize: '13px', paddingRight: 0 }} actAsExpander={true} showExpandableButton={true}/>

                            <CardText expandable={true}>
                                <TextField id='endpoint' ref='endpoint' floatingLabelText='Endpoint' fullWidth={true}/>

                                <TextField id='caBundlePath' ref='caBundlePath' floatingLabelText='CA Bundle' fullWidth={true}/>

                                <Toggle id='rejectUnauthorizedSsl' ref='rejectUnauthorizedSsl' label='Reject Unauthorized SSL'
                                    style={{ marginTop: '25px' }} labelStyle={{ width: 'none' }}/>

                                  <TextField id='signatureBlock' ref='signatureBlock' multiLine={true} rows={1} rowsMax={4} fullWidth={true}
                                    floatingLabelText='Signature Block' floatingLabelStyle={{ left: '0px' }}/>
                            </CardText>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }

    handlesRegionChange = (event, index, value) => {
        this.setState({
            region: value
        })
    }

    handleOnRowSelection = selectedRows => {
      if(selectedRows === 'all'){
        selectedRows = []
        this.state.userAdminGroups.forEach((group, index) =>{
          selectedRows.push(index)
        })
      }
      console.log('SELECTED ROWS', selectedRows )
      this.setState({
        selectedRows
      })
    }


    handlesCreateClick = event => {
        event.preventDefault()
        const { mutate } = this.props
        const { userAdminGroups, selectedRows } = this.state
        const { router } = this.context

        let accountToCreate = {}

        // map all fields to accountToCreate
        for (let key in this.refs) {
            if (key === 'rejectUnauthorizedSsl') {
                  accountToCreate[key] = this.refs[key].isToggled()
            } else {
                accountToCreate[key] = this.refs[key].getValue()
            }
        }
        // attach derived fields
        accountToCreate.region = this.state.region

        if(!accountToCreate.name){
          this.setState({errorMessage: true, message: 'Name is required.'})
          return
        }
        else if(!accountToCreate.region){
          this.setState({errorMessage: true, message: 'Region is required.'})
          return
        }
        else if(!accountToCreate.accessKeyId){
          this.setState({errorMessage: true, message: 'Access Key is required.'})
          return
        }
        else if(!accountToCreate.secretAccessKey){
          this.setState({errorMessage: true, message: 'Secret Key is required.'})
          return
        }
        else if(this.state.isGroupAdmin && !this.state.selectedGroupRows){
          this.setState({errorMessage: true, message: 'Attaching to group is required for group admins.'})
          return
        }
        else{
          this.setState({loading: true})

          mutate({
              variables: { account: accountToCreate }
           }).then(({ data }) => {
             console.log('DATA', data)
             if (this.state.selectedRows) {
               console.log('userAdminGroups', userAdminGroups)
                 console.log('selectedRows', selectedRows)
                   for (var i = 0; i < selectedRows.length; i++) {
                     if(!userAdminGroups[selectedRows[i]].accounts){
                       userAdminGroups[selectedRows[i]].accounts = []
                     }
                       userAdminGroups[selectedRows[i]].accounts.push(data.createAccount._id);
                       delete userAdminGroups[selectedRows[i]].__typename
                       userAdminGroups[selectedRows[i]].users.forEach(user =>{
                         delete user.__typename
                       })
                       this.props.UpdateGroupWithMutation(
                         {variables: { group: userAdminGroups[selectedRows[i]] }})

                   }
             }
             this.props.refetchAccounts({}).then(({ data }) =>{
               this.props.refetchGroups({}).then( ()=>{
                 this.setState({
                   successOpen: true,
                   loading: false
                 })
                 if(this.state.isGroupAdmin){
                   router.push({ pathname: '/groups' })
                 }
                 else{
                   router.push({ pathname: '/accounts' })
                 }
               })
             }).catch((error) => {
               this.setState({loading: false})
             })
          }).catch(error => {
          })
        }
    }
}

CreateAccount.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired,
    refetchAccounts: PropTypes.func,
    mutate: PropTypes.func.isRequired,
    refetchGroups: PropTypes.func.isRequired,
    UpdateGroupWithMutation: PropTypes.func.isRequired

}

CreateAccount.contextTypes = {
    router: PropTypes.object
}

export default CreateAccount
