import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'

import { Checkbox, RaisedButton} from 'material-ui'
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import Snackbar from 'material-ui/Snackbar';

import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import Chip from 'material-ui/Chip';
import { IoEdit, IoAndroidClose, IoIosCloudUploadOutline } from 'react-icons/lib/io'

import Slider from 'material-ui/Slider';
import {Row, Col} from 'react-flexbox-grid'
import {RadioButtonGroup, RadioButton} from 'material-ui/RadioButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import FlatButton from 'material-ui/FlatButton';
import defaultImage from '../../style/empty-group.png'
import defaultUserImage from '../../style/empty.png'

import { Loader } from '../../components'
import materialTheme from '../../style/custom-theme.js';

const CheckboxGroup = Checkbox.Group;

const defaultCheckedList = ['r'];

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    // width: 500,
    // overflowY: 'auto'
  },
  chip: {
      margin: 4
  },
  wrapper: {
      display: 'flex',
      flexWrap: 'wrap'
  }
};

const TabPane = Tabs.TabPane;


class GroupDetails extends Component {

    state = {
      animated: true,
      viewEntersAnim: true,
      checkedList: defaultCheckedList,
      indeterminate: true,
      successOpen: false,
      failOpen: false,
      checkAll: false,
        permissionC: false,
        permissionU: false,
        permissionD: false,
        permissionX: false,
        name: '',
        description: '',

        fixedHeader: true,
        fixedFooter: true,
        stripedRows: true,
        showRowHover: true,
        selectable: true,
        multiSelectable: true,
        enableSelectAll: true,
        deselectOnClickaway: true,
        showCheckboxes: true,
        height:'300',
          currentGroup: {}
    }

    componentDidMount() {
        const { enterGroupDetails } = this.props
        enterGroupDetails()
    }

    componentWillMount(){
      const { enterGroupDetails, groups, users, landscapes, params } = this.props
      let currentGroup = {};
      if(groups){
        currentGroup = groups.find(ls => { return ls._id === params.id })
        var readablePermissions = []
        currentGroup.permissions.map(permission =>{
          if(permission === 'c'){
            readablePermissions.push(' Create')
          }
          if(permission === 'r'){
            readablePermissions.push(' Read')
          }
          if(permission === 'u'){
            readablePermissions.push(' Update')
          }
          if(permission === 'd'){
            readablePermissions.push(' Delete')
          }
          if(permission === 'x'){
            readablePermissions.push(' Deploy')
          }
        })
        currentGroup.readablePermissions = readablePermissions;
        if(!currentGroup.imageUri){
          currentGroup.imageUri = defaultImage
        }
        this.setState({currentGroup: currentGroup})
      }
      let groupLandscapes = []
      let groupUsers = []
        if(currentGroup.landscapes){
          for(var i = 0; i< currentGroup.landscapes.length; i++){
            landscapes.find(ls => {
              if(currentGroup.landscapes[i] === ls._id){
                ls.selected = true;
                groupLandscapes.push(ls)
              }
            })
          }
      }
      this.setState({groupLandscapes: groupLandscapes})

        if(currentGroup.users){
          for(var i = 0; i< currentGroup.users.length; i++){
            users.find(user => {
              if(currentGroup.users[i].userId === user._id){
                user.selected = true;
                if(!user.imageUri){
                  user.imageUri = defaultUserImage
                }
                if(currentGroup.users[i].isAdmin){
                  user.isGroupAdmin = 'Admin'
                }
                else{
                  user.isGroupAdmin = ''
                }
                groupUsers.push(user)
              }
            })
          }
      }
      this.setState({groupUsers: groupUsers})
    }

    componentWillReceiveProps(nextProps) {
      // use the name from nextProps to get the profile
      const { enterGroupDetails, groups, users, landscapes, params } = nextProps
      let currentGroup = {};
      if(groups){
        currentGroup = groups.find(ls => { return ls._id === params.id })
        var readablePermissions = []
        currentGroup.permissions.map(permission =>{
          if(permission === 'c'){
            readablePermissions.push(' Create')
          }
          if(permission === 'r'){
            readablePermissions.push(' Read')
          }
          if(permission === 'u'){
            readablePermissions.push(' Update')
          }
          if(permission === 'd'){
            readablePermissions.push(' Delete')
          }
          if(permission === 'x'){
            readablePermissions.push(' Deploy')
          }
        })
        currentGroup.readablePermissions = readablePermissions;
        if(!currentGroup.imageUri){
          currentGroup.imageUri = defaultImage
        }
        this.setState({currentGroup: currentGroup})
      }
      let groupLandscapes = []
      let groupUsers = []
        if(currentGroup.landscapes){
          for(var i = 0; i< currentGroup.landscapes.length; i++){
            landscapes.find(ls => {
              if(currentGroup.landscapes[i] === ls._id){
                ls.selected = true;
                groupLandscapes.push(ls)
              }
            })
          }
      }
      this.setState({groupLandscapes: groupLandscapes})

        if(currentGroup.users){
          for(var i = 0; i< currentGroup.users.length; i++){
            users.find(user => {
              if(currentGroup.users[i].userId === user._id){
                user.selected = true;
                if(!user.imageUri){
                  user.imageUri = defaultUserImage
                }
                if(currentGroup.users[i].isAdmin){
                  user.isGroupAdmin = 'Admin'
                }
                else{
                  user.isGroupAdmin = ''
                }
                groupUsers.push(user)
              }
            })
          }
      }
      this.setState({groupUsers: groupUsers})
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveGroupDetails } = this.props
        leaveGroupDetails()
    }

    render() {

        let self = this
        const { animated, viewEntersAnim } = this.state
        const { loading, groups, landscapes, users, params } = this.props

        if (loading || !groups) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                  <Row middle='xs'>
                      <Col xs={2} style={{ textAlign: 'left', marginBottom:30 }}>
                        <Row><h4><strong>Group</strong></h4></Row>
                      </Col>
                      <Col xs={10}>
                          <RaisedButton label='Edit' onClick={this.handlesEditGroupClick}
                              style={{ float: 'right', marginBottom: '30px' }}
                              labelStyle={{ fontSize: '11px' }} icon={<IoEdit/>}/>
                      </Col>
                  </Row>
                  <div style={styles.root}>

                  <Card style={{padding:20}}>

                    <Row middle='xs'>
                        <Col xs={1} style={{ textAlign: 'left' }}>
                            <img src={this.state.currentGroup.imageUri} style={{width: 85}} />
                        </Col>
                        <Col xs={4} style={{ textAlign: 'left' }}>
                            <Row><h4>{this.state.currentGroup.name}</h4></Row>
                            <Row>
                              {
                              this.state.currentGroup.readablePermissions.map((row, index) => (
                                <Chip style = {styles.chip} key={index} >
                                   {row}
                                </Chip>
                            ))
                          }</Row>

                        </Col>
                        <Col xs={7}>
                        </Col>
                    </Row>
                    <Row middle='xs' style={{flex: 1, marginLeft: 10, marginBottom:10}}>
                        <Col style={{ textAlign: 'left', flex: 1 }}>
                            <h5>{this.state.currentGroup.description}</h5>
                        </Col>
                    </Row>
                  <GridList
                    cols={1}
                    cellHeight='auto'
                    style={styles.gridList}
                  >
                </GridList>
                <Tabs tabItemContainerStyle={{backgroundColor: materialTheme.palette.primary3Color}}>
                  <Tab key="1" label="Landscapes">
                    <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
                        selectable={false} multiSelectable={false}
                        onRowSelection={this.handleOnRowSelection}>
                          <TableHeader displaySelectAll={false} adjustForCheckbox={false}
                            enableSelectAll={false} >
                            <TableRow>
                              <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                              <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                              <TableHeaderColumn tooltip="Description">Description</TableHeaderColumn>
                            </TableRow>
                          </TableHeader>
                          <TableBody displayRowCheckbox={false}
                            showRowHover={this.state.showRowHover} stripedRows={false}>
                            {this.state.groupLandscapes.map( (row, index) => (
                              <TableRow key={row._id} >
                                <TableRowColumn><img src={row.imageUri} style={{width: 50}} /></TableRowColumn>
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
                  </Tab>
                  <Tab key="2" label="Users">
                    <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
                        selectable={false} multiSelectable={false}
                        onRowSelection={this.handleOnRowSelection}>
                          <TableHeader displaySelectAll={false} adjustForCheckbox={false}
                            enableSelectAll={false} >
                                <TableRow>
                                  <TableHeaderColumn tooltip="image"></TableHeaderColumn>
                                  <TableHeaderColumn tooltip="Email">Email</TableHeaderColumn>
                                  <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                  <TableHeaderColumn tooltip="isGroupAdmin">Admin?</TableHeaderColumn>
                                </TableRow>
                              </TableHeader>
                              <TableBody displayRowCheckbox={false} deselectOnClickaway={this.state.deselectOnClickaway}
                                showRowHover={this.state.showRowHover} stripedRows={false}>
                                {this.state.groupUsers.map( (row, index) => (
                                  <TableRow key={row._id} >
                                  <TableRowColumn><img src={row.imageUri} style={{width: 40, borderRadius:50}} /></TableRowColumn>
                                    <TableRowColumn>{row.email}</TableRowColumn>
                                    <TableRowColumn>{row.firstName} {row.lastName}</TableRowColumn>
                                    <TableRowColumn>{row.isGroupAdmin}</TableRowColumn>
                                  </TableRow>
                                  ))}
                              </TableBody>
                              <TableFooter
                                adjustForCheckbox={false}
                              >
                              </TableFooter>
                            </Table>
                  </Tab>
                  <Tab key="3" label="Accounts">

                  </Tab>
                </Tabs>
                  </Card>
                  </div>
            </div>
        )
    }

    handlesEditGroupClick = (group, event) => {
        const { params } = this.props
        const { router } = this.context
        router.push({ pathname: '/groups/edit/' + params.id })
    }

    closeError = (event) => {
        event.preventDefault()
        const { resetError } = this.props
        resetError()
    }
    onCheckedChange = (checkedList) =>{
      this.setState({
        checkedList,
        indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
        checkAll: checkedList.length === plainOptions.length,
      });
    }
    onCheckAllChange = (e) => {
      this.setState({
        checkedList: e.target.checked ? allChecked : ['r'],
        indeterminate: false,
        checkAll: e.target.checked,
      });
    }
}

GroupDetails.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterGroupDetails: PropTypes.func.isRequired,
    leaveGroupDetails: PropTypes.func.isRequired
}

GroupDetails.contextTypes = {
    router: PropTypes.object
}

export default GroupDetails
