import cx from 'classnames'
import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {Row, Col} from 'react-flexbox-grid'

import {Checkbox, RaisedButton} from 'material-ui'
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import Snackbar from 'material-ui/Snackbar';
import Toggle from 'material-ui/Toggle';
import { Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import Slider from 'material-ui/Slider';
import {RadioButtonGroup, RadioButton} from 'material-ui/RadioButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import FlatButton from 'material-ui/FlatButton';
import Dropzone from 'react-dropzone'
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import UploadIcon from 'material-ui/svg-icons/file/file-upload'
import defaultUserImage from '../../style/empty.png'
import defaultImage from '../../style/empty-group.png'
import AvatarCropper from "react-avatar-cropper";
import {sortBy} from "lodash";

import {Loader} from '../../components'

import '../../style/avatar-cropper.style.scss'
const CheckboxGroup = Checkbox.Group;

const defaultCheckedList = ['r'];

const styles = {
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },
    gridList: {
        width: 500,
        overflowY: 'auto'
    },
    chip: {
        margin: 4
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap'
    }
};

class CreateGroup extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        checkedList: defaultCheckedList,
        indeterminate: true,
        checkAll: false,
          permissionC: false,
          permissionU: false,
          permissionD: false,
          permissionX: false,

          fixedHeader: true,
          fixedFooter: true,
          successOpen: false,
          failOpen: false,
          stripedRows: true,
          showRowHover: true,
          selectable: true,
          multiSelectable: true,
          enableSelectAll: true,
          deselectOnClickaway: true,
          showCheckboxes: true,
          height: '300'
    }

    componentDidMount() {
        const { enterGroups } = this.props
        enterGroups()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }
    componentWillMount(){
      const { loading, groups, landscapes, users, accounts } = this.props

      var stateUsers = []
      if(users){
        var usersSorted = sortBy(users, ['lastName']);
        usersSorted.map(user => {
          if(!user.imageUri){
            user.imageUri = defaultUserImage
          }
          stateUsers.push(user)
        })
      }
      this.setState({stateUsers: stateUsers || []})
      this.setState({stateLandscapes: landscapes || []})
      this.setState({stateAccounts: accounts || []})
      this.setState({selectedLandscapeRows: []})
      this.setState({selectedUserRows: []})
      this.setState({selectedAccountRows: []})
      this.setState({imageUri: defaultImage})
    }
    componentWillReceiveProps(nextProps){
      const { loading, groups, landscapes, users, accounts } = nextProps

      var stateUsers = []
      if(users){
        var usersSorted = sortBy(users, ['lastName']);
        usersSorted.map(user => {
          if(!user.imageUri){
            user.imageUri = defaultUserImage
          }
          stateUsers.push(user)
        })
      }
      this.setState({stateUsers: stateUsers || []})
      this.setState({stateLandscapes: landscapes || []})
      this.setState({stateAccounts: accounts || []})
      this.setState({selectedLandscapeRows: []})
      this.setState({selectedUserRows: []})
      this.setState({selectedAccountRows: []})
      this.setState({imageUri: defaultImage})
    }

    componentWillUnmount() {
        const { leaveGroups } = this.props
        leaveGroups()
    }

    render() {
        let self = this
        const { animated, viewEntersAnim } = this.state
        const { loading, groups, landscapes, users } = this.props


        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
          <div>
              <Row className={cx({'screen-width': true, 'animatedViews': animated, 'view-enter': viewEntersAnim})} style={{
                  justifyContent: 'space-between'
              }}>
              <Row style={{flex: 1}}>
                  <Col xs={2} style={{ textAlign: 'left', marginBottom:30 }}>
                    <Row><h4><strong>Create Group</strong></h4></Row>
                  </Col>
                  <Col xs={8}>
                  </Col>
                  <Col xs={1}>
                    <RaisedButton label="Save" labelStyle={{ fontSize: '11px' }} style={{ float: 'right', marginBottom: '30px' }} onClick={this.handlesCreateClick}/>
                  </Col>
                  <Col xs={1}>
                    <RaisedButton label="Cancel" primary={true} labelStyle={{ fontSize: '11px' }} style={{ float: 'right', marginBottom: '30px' }} onClick={() => {
                        const {router} = this.context
                        router.push(`/groups`)
                    }}/>
                  </Col>
              </Row>
              </Row>
              <Row center='xs' middle='xs' className={cx({'animatedViews': animated, 'view-enter': viewEntersAnim})}>
                  <Snackbar open={this.state.successOpen} message="Group successfully updated." autoHideDuration={3000} onRequestClose={this.handleRequestClose}/>
                  <Snackbar open={this.state.failOpen} message="Error updating group" autoHideDuration={3000} onRequestClose={this.handleRequestClose}/>
                    <Card style={{padding:20}}>
                        <Row center='xs' middle='xs' className={cx({'animatedViews': animated, 'view-enter': viewEntersAnim})}>
                        <Snackbar open={this.state.successOpen} message="Group successfully updated." autoHideDuration={3000} onRequestClose={this.handleRequestClose}/>
                        <Snackbar open={this.state.failOpen} message="Error updating group" autoHideDuration={3000} onRequestClose={this.handleRequestClose}/>

                                  <Row style={{width: '100%'}}>
                                    <Col style={{paddingLeft: 10, paddingRight: 10,  width:'65%'}}>
                                      <Row key='name'>
                                          <TextField style={{
                                            width: '100%'
                                          }} id="username" floatingLabelText="Name" onChange={this.handlesOnNameChange} hintText='Name'/>
                                      </Row>
                                      <Row key='description'>
                                          <TextField id="description" style={{
                                            width: '100%',
                                            textAlign: 'left'
                                          }} multiLine={true} rows={1} rowsMax={4} floatingLabelText="Description" onChange={this.handlesOnDescriptionChange} hintText='Description'/>
                                      </Row>
                                      <Row key='permissions' >
                                          <div style={{
                                              borderBottom: '1px solid #E9E9E9',
                                              width: '100%'
                                          }}>
                                              <Checkbox style={{
                                                  marginBottom: 15,
                                                  marginTop:15,
                                                  width:200
                                              }} label="Check All Permissions" onCheck={this.handlesOnCheck} checked={this.state.checkAll}/>
                                          </div>
                                          <br/>
                                          </Row>

                                          <Row style={{paddingTop:15, paddingBottom:15}} >
                                            <Col>
                                              <Checkbox label="Create" checked={this.state.permissionC} onCheck={this.handlesPermissionClickC}/>
                                              <Checkbox label="Read" disabled={true} checked={true}/>
                                              <Checkbox label="Update" checked={this.state.permissionU} onCheck={this.handlesPermissionClickU}/>
                                              <Checkbox label="Delete" checked={this.state.permissionD} onCheck={this.handlesPermissionClickD}/>
                                              <Checkbox label="Execute" checked={this.state.permissionX} onCheck={this.handlesPermissionClickX}/>
                                            </Col>
                                          </Row>
                                    </Col>
                                    <Col style={{paddingLeft: 20, paddingRight: 140, width:'35%'}}>
                                      <Row key='image' style={{justifyContent:'space-around' }}>
                                          <Dropzone id='imageUri' onDrop={this.handlesImageUpload} multiple={false} accept='image/*' style={{
                                              marginLeft: '10px',
                                              width: '180px',
                                              padding: '15px 0px'
                                          }}>
                                              <div className="avatar-photo">
                                                  <div className="avatar-edit">
                                                      <span>Click to Choose Image</span>
                                                      <i className="fa fa-camera"></i>
                                                  </div>
                                                  <img src={this.state.croppedImg || this.state.imageUri} style={{
                                                      width: 200
                                                  }}/>
                                              </div>
                                              {this.state.cropperOpen &&
                                                <AvatarCropper onRequestHide={this.handleRequestHide} cropperOpen={this.state.cropperOpen} onCrop={this.handleCrop} image={this.state.img} width={400} height={400}/>
                                              }
                                          </Dropzone>
                                      </Row>
                                    </Col>
                                  </Row>
                  <Tabs>
                      <Tab label="Landscapes" key="3">
                        <div style={styles.wrapper}>
                            {
                              this.state.selectedLandscapeRows.map((row, index) => (
                                <Chip style = {styles.chip} key={index} >
                                  <Avatar src={this.state.stateLandscapes[row].imageUri}/>
                                   {this.state.stateLandscapes[row].name}
                                </Chip>
                            ))
                          }
                        </div>
                        <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={this.state.selectable} multiSelectable={this.state.multiSelectable} onRowSelection={this.handleOnRowSelectionLandscapes}>
                            <TableHeader displaySelectAll={this.state.showCheckboxes} adjustForCheckbox={this.state.showCheckboxes} enableSelectAll={this.state.enableSelectAll}>
                                <TableRow>
                                    <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Description">Description</TableHeaderColumn>
                                </TableRow>
                            </TableHeader>
                            <TableBody displayRowCheckbox={this.state.showCheckboxes} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                                {this.state.stateLandscapes.map((row, index) => (
                                    <TableRow key={row._id} selected={row.selected}>
                                        <TableRowColumn><img src={row.imageUri} style={{
                                        width: 50
                                    }}/></TableRowColumn>
                                        <TableRowColumn>{row.name}</TableRowColumn>
                                        <TableRowColumn>{row.description}</TableRowColumn>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter adjustForCheckbox={this.state.showCheckboxes}></TableFooter>
                        </Table>
                      </Tab>
                      <Tab label="Users" key="2">
                        <div style={styles.wrapper}>
                            {
                              this.state.selectedUserRows.map((row, index) => (
                                <Chip style = {styles.chip} key={index} >
                                  <Avatar src={this.state.stateUsers[row].imageUri}/>
                                   {this.state.stateUsers[row].firstName} {this.state.stateUsers[row].lastName}
                                </Chip>
                            ))
                          }
                        </div>
                          <div style={styles.wrapper}>
                              {
                                this.state.stateUsers.map((row, index) => {
                                  < Chip
                                  style = { styles.chip } onRequestDelete = {this.handleRequestDelete} >
                                  <Avatar src={row.imageUri}/>
                                  {row.firstName}
                                  {row.lastName}
                                  < /Chip>
                              })
                            }
                          </div>
                          <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={this.state.selectable} multiSelectable={this.state.multiSelectable} onRowSelection={this.handleOnRowSelectionUsers}>
                              <TableHeader displaySelectAll={this.state.showCheckboxes} adjustForCheckbox={this.state.showCheckboxes} enableSelectAll={this.state.enableSelectAll}>
                                  <TableRow>
                                      <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                        <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                      <TableHeaderColumn tooltip="Email">Email</TableHeaderColumn>
                                      <TableHeaderColumn tooltip="Role">Admin?</TableHeaderColumn>
                                  </TableRow>
                              </TableHeader>
                              <TableBody displayRowCheckbox={this.state.showCheckboxes} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                                  {
                                    this.state.stateUsers.map((row, index) => (
                                        <TableRow key={row._id} selected={this.state.selectedUserRows.indexOf(index) !== -1}>
                                            <TableRowColumn><img src={row.imageUri} style={{width: 40, borderRadius: 50}}/></TableRowColumn>
                                            <TableRowColumn>{row.lastName}, {row.firstName} </TableRowColumn>
                                            <TableRowColumn>{row.email}</TableRowColumn>
                                            <TableRowColumn>
                                              <Toggle toggled={row.isAdmin || (row.role === 'admin')} onToggle={() => (
                                                  this.state.stateUsers[index].isAdmin = !this.state.stateUsers[index].isAdmin,
                                                  this.setState({stateUsers: [...this.state.stateUsers]})
                                                )} disabled={row.role === 'admin'}/>
                                            </TableRowColumn>
                                        </TableRow>
                                    ))
                                  }
                              </TableBody>
                              <TableFooter adjustForCheckbox={this.state.showCheckboxes}></TableFooter>
                          </Table>

                      </Tab>
                      <Tab label="Accounts" key="4">
                          <Table key="accountsTable" height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={this.state.selectable} multiSelectable={this.state.multiSelectable} onRowSelection={this.handleOnRowSelectionAccounts}>
                              <TableHeader displaySelectAll={this.state.showCheckboxes} adjustForCheckbox={this.state.showCheckboxes} enableSelectAll={this.state.enableSelectAll}>
                                  <TableRow>
                                      <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                      <TableHeaderColumn tooltip="Region">Region</TableHeaderColumn>
                                      <TableHeaderColumn tooltip="Created At">Created At</TableHeaderColumn>
                                  </TableRow>
                              </TableHeader>
                              <TableBody displayRowCheckbox={this.state.showCheckboxes} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                                  {this.state.stateAccounts.map((row, index) => (
                                      <TableRow key={row._id} selected={this.state.selectedAccountRows.indexOf(index) !== -1}>
                                          <TableRowColumn>{row.name}</TableRowColumn>
                                          <TableRowColumn>{row.region}</TableRowColumn>
                                          <TableRowColumn>{row.createdAt}</TableRowColumn>
                                      </TableRow>
                                  ))}
                              </TableBody>
                              <TableFooter adjustForCheckbox={this.state.showCheckboxes}></TableFooter>
                          </Table>
                      </Tab>
                  </Tabs>
                </Row>
                </Card>
              </Row>
          </div>
        )
    }

    handleOnRowSelectionUsers = selectedRows => {
      if(selectedRows === 'all'){
        selectedRows = []
        this.state.stateUsers.forEach((account, index) => {
          selectedRows.push(index)
        })
      }
      else if(selectedRows === 'none'){
        selectedRows = []
      }
        this.setState({selectedUserRows: selectedRows})
    }

    handleOnRowSelectionLandscapes = selectedRows => {
      if(selectedRows === 'all'){
        selectedRows = []
        this.state.stateLandscapes.forEach((account, index) => {
          selectedRows.push(index)
        })
      }
      else if(selectedRows === 'none'){
        selectedRows = []
      }
        this.setState({selectedLandscapeRows: selectedRows})
    }
    handleOnRowSelectionAccounts = selectedRows => {
        if(selectedRows === 'all'){
          selectedRows = []
          this.state.stateAccounts.forEach((account, index) => {
            selectedRows.push(index)
          })
        }
        else if(selectedRows === 'none'){
          selectedRows = []
        }
        this.setState({selectedAccountRows: selectedRows})
    }

    handleRequestDelete = (row, index) => {
      var userSelected = this.state.selectedUserRows.splice(index, 1)
      this.state.stateUsers[userSelected[0]].selected = false;
      this.setState({stateUsers: [...this.state.stateUsers]})
      this.setState({selectedUserRows: [...this.state.selectedUserRows]})
      this.render()
    }

    handleTouchTap = () => {
      alert('You clicked the Chip.');
    }

    getInitialState = () => {
        return {
          cropperOpen: false,
          img: null,
          croppedImg: defaultImage
        };
      }
      handleFileChange = (dataURI) => {
        this.setState({
          img: dataURI,
          croppedImg: this.state.croppedImg,
          cropperOpen: true
        });
      }
      handleCrop = (dataURI) => {
        this.setState({
          cropperOpen: false,
          img: null,
          croppedImg: dataURI
        });
      }
      handleRequestHide = () =>{
        this.setState({
          cropperOpen: false
        });
      }

    handlesImageUpload = (acceptedFiles, rejectedFiles) => {
        let reader = new FileReader()

        reader.readAsDataURL(acceptedFiles[0])
        reader.onload = () => {
            this.setState({
                imageUri: reader.result,
                img: reader.result,
                croppedImg: this.state.croppedImg,
                cropperOpen: true,
                imageFileName: acceptedFiles[0].name
            })
        }

        reader.onerror = error => {
        }
    }
    handlesOnNameChange = event => {
        // event.preventDefault()
        this.setState({name: event.target.value})
    }
    handlesOnDescriptionChange = event => {
        event.preventDefault()
        this.setState({description: event.target.value})
    }
    handlesGroupClick = event => {
        const { router } = this.context
        router.push({ pathname: '/protected' })
    }
    handlesPermissionClickC = event => {
        this.setState({permissionC: !this.state.permissionC})
    }
    handlesPermissionClickU = event => {
        this.setState({permissionU: !this.state.permissionU})
    }
    handlesPermissionClickD = event => {
        this.setState({permissionD: !this.state.permissionD})
    }
    handlesPermissionClickX = event => {
        this.setState({permissionX: !this.state.permissionX})
    }

    handlesOnCheck = event => {
        var isChecked = this.state.checkAll;
        if(isChecked){
          this.setState({
              permissionC: false,
              permissionU: false,
              permissionD: false,
              permissionX: false,
            checkAll: false
          })
        }
        else{
          this.setState({
              permissionC: true,
              permissionU: true,
              permissionD: true,
              permissionX: true,
              checkAll: true
          })
        }
    }

    handlesCreatePermission = () => {
        var permissions = [];
        if(this.state.permissionC){
          permissions.push('c')
        }

        permissions.push('r')

        if(this.state.permissionU){
          permissions.push('u')
        }
        if(this.state.permissionD){
          permissions.push('d')
        }
        if(this.state.permissionX){
          permissions.push('x')
        }
        return permissions;
    }


    handlesOnEmailChange = event => {
        event.preventDefault()
        this.setState({ username: event.target.value })
    }

    handlesOnPasswordChange = event => {
        event.preventDefault()
        this.setState({ password: event.target.value })
    }

    handlesCreateClick = event => {
        const { router } = this.context


        event.preventDefault()

        let groupToCreate = {
          name: this.state.name,
          description: this.state.description
        }
        groupToCreate.permissions = this.handlesCreatePermission()
        groupToCreate.users = []
        groupToCreate.landscapes = []
        groupToCreate.accounts = []
        if (this.state.selectedLandscapeRows) {
            for (var i = 0; i < this.state.selectedLandscapeRows.length; i++) {
                groupToCreate.landscapes.push(this.state.stateLandscapes[this.state.selectedLandscapeRows[i]]._id)
            }
        }
        if (this.state.selectedUserRows) {
            for (var i = 0; i < this.state.selectedUserRows.length; i++) {
                if(this.state.stateUsers[this.state.selectedUserRows[i]].role === 'admin'){
                  this.state.stateUsers[this.state.selectedUserRows[i]].isAdmin = true;
                }
                groupToCreate.users.push({
                    userId: this.state.stateUsers[this.state.selectedUserRows[i]]._id,
                    isAdmin: this.state.stateUsers[this.state.selectedUserRows[i]].isAdmin || false
                })
            }
        }
        if (this.state.selectedAccountRows) {
            for (var i = 0; i < this.state.selectedAccountRows.length; i++) {
              groupToCreate.accounts.push(this.state.stateAccounts[this.state.selectedAccountRows[i]]._id)

            }
        }
        groupToCreate.imageUri = this.state.croppedImg || this.state.imageUri
        console.log('groupToCreate', groupToCreate)
        this.props.CreateGroupWithMutation({
            variables: { group: groupToCreate }
         }).then(({ data }) => {
            this.setState({
              successOpen: true
            })
        }).then(() =>{
            this.props.refetchGroups({}).then(({ data }) =>{
              router.push({ pathname: '/groups' })
            }).catch((error) => {
                this.setState({
                  failOpen: true
                })
            })
        }).catch((error) => {
            this.setState({
              failOpen: true
            })
        })

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

CreateGroup.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterGroups: PropTypes.func.isRequired,
    leaveGroups: PropTypes.func.isRequired,
    refetchGroups: PropTypes.func
}

CreateGroup.contextTypes = {
    router: PropTypes.object
}

export default CreateGroup
