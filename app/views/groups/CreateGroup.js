import cx from 'classnames'
import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {Row, Col} from 'react-flexbox-grid'
import axios from 'axios'
import AvatarCropper from "react-avatar-cropper";
import {sortBy, orderBy} from "lodash";
import Dropzone from 'react-dropzone'

import { Avatar, Chip, TextField, Tabs, Tab, Card, Checkbox, RaisedButton, Toggle, Snackbar, Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui'
import { IoEdit, IoAndroidClose, IoSearch, IoArrowDownC, IoArrowUpC } from 'react-icons/lib/io'
import UploadIcon from 'material-ui/svg-icons/file/file-upload'
import defaultUserImage from '../../style/empty.png'
import defaultImage from '../../style/empty-group.png'

import {Loader} from '../../components'

import '../../style/avatar-cropper.style.scss'

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
          managedVPC: false,
          height: '300px'
    }

    componentDidMount() {
        const { enterGroups } = this.props
        enterGroups()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillMount(){
      const { loading, groups, landscapes, users, integrations, accounts } = this.props
      var integration = {};
      if(integrations){
        integration = integrations.find(integration => { return integration.type === 'managedVPC' })
      }
      this.setState({integration})
      var usersSorted = [];
      var landscapesSorted = [];
      var accountsSorted = [];
      if(users){
        usersSorted = sortBy(users, ['lastName']);
        this.setState({users: usersSorted})
      }
      if(landscapes){
        landscapesSorted = sortBy(landscapes, ['name']);
      }
      if(accounts){
        accountsSorted = sortBy(accounts, ['name']);
      }
      let stateLandscapes = []
      let stateAccounts = []

      if (landscapes) {
          landscapesSorted.find((ls, index) => {
              stateLandscapes.push(ls)
          })
      }
      if (accounts) {
          accountsSorted.find((ls, index) => {
              stateAccounts.push(ls)
          })
      }
      let stateUsers = []

      if (users) {
          usersSorted.map(user => {
              if (!user.imageUri) {
                  user.imageUri = defaultUserImage
              }
              stateUsers.push(user)
          })
      }
      this.setState({stateUsers: stateUsers || []})
      this.setState({stateLandscapes: stateLandscapes || []})
      this.setState({stateAccounts: stateAccounts || []})
      this.setState({landscapeItems: landscapesSorted || []})
      this.setState({accountItems: accountsSorted || []})
      this.setState({userItems: usersSorted || []})
      this.setState({selectedLandscapeRows: []})
      this.setState({selectedUserRows: []})
      this.setState({selectedAccountRows: []})
      this.setState({imageUri: defaultImage})
    }

    componentWillReceiveProps(nextProps){
      const { loading, groups, landscapes, users, accounts, integrations } = nextProps
      var integration = {};
      if(integrations){
        integration = integrations.find(integration => { return integration.type === 'managedVPC' })
      }
      this.setState({integration})
      var usersSorted = [];
      var landscapesSorted = [];
      var accountsSorted = [];
      if(users){
        usersSorted = sortBy(users, ['lastName']);
        this.setState({users: usersSorted})
      }
      if(landscapes){
        landscapesSorted = sortBy(landscapes, ['name']);
      }
      if(accounts){
        accountsSorted = sortBy(accounts, ['name']);
      }
      let stateLandscapes = []
      let stateAccounts = []

      if (landscapes) {
          landscapesSorted.find((ls, index) => {
              stateLandscapes.push(ls)
          })
      }
      if (accounts) {
          accountsSorted.find((ls, index) => {
              stateAccounts.push(ls)
          })
      }
      let stateUsers = []

      if (users) {
          usersSorted.map(user => {
              if (!user.imageUri) {
                  user.imageUri = defaultUserImage
              }
              stateUsers.push(user)
          })
      }
      this.setState({stateUsers: stateUsers || []})
      this.setState({stateLandscapes: landscapes || []})
      this.setState({stateAccounts: accounts || []})
      this.setState({landscapeItems: landscapesSorted || []})
      this.setState({accountItems: accountsSorted || []})
      this.setState({userItems: usersSorted || []})
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


        if (loading || this.state.loading) {
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
                  <Col xs={4} style={{ textAlign: 'left', marginBottom:30 }}>
                    <Row><h4><strong>Create Group</strong></h4></Row>
                  </Col>
                  <Col xs={8}>
                    <RaisedButton label="Cancel" primary={true} labelStyle={{ fontSize: '11px', marginLeft: 5, marginRight:5 }} style={{ float: 'right', marginBottom: '30px' }} onClick={() => {
                        const {router} = this.context
                        router.push(`/groups`)
                    }}/>
                  <RaisedButton label="Save" labelStyle={{ fontSize: '11px' }} style={{ float: 'right', marginBottom: '30px',marginLeft: 5, marginRight:5 }} onClick={this.handlesCreateClick}/>

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
                                      <Row key='integration'>
                                        <div style={{
                                            borderBottom: '1px solid #E9E9E9',
                                            width: '100%'
                                        }}>
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
                        <Row style={{justifyContent:'space-between'}}>
                          <Col>
                            <div style={styles.wrapper}>
                              {
                                this.state.selectedLandscapeRows.map((row, index) => (
                                  <Chip style = {styles.chip} key={index} >
                                    <Avatar src={row.imageUri}/>
                                     {row.name}
                                  </Chip>
                              ))
                            }
                            </div>
                          </Col>
                          <Col style={{width:'300px'}}>
                            <div className="filter-list" style={{marginTop:-5, marginBottom:10}}>
                              <IoSearch style={{fontSize:20, color:'gray', marginRight:5}} /><TextField type="text" hintText="Search" onChange={this.filterLandscapeList}/>
                            </div>
                          </Col>
                        </Row>
                        <Table key="landscapeTable" height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={false} multiSelectable={false}  onCellClick={this.handlesLandscapeRowClick}>
                          <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                                <TableRow>
                                  <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                    <TableHeaderColumn>
                                      <Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'name', array:'landscape'})}>Name
                                    {
                                      this.state.orderBy === 'name' && this.state.order === 'asc'
                                      ?
                                      <IoArrowUpC />
                                      :
                                      <Col>{
                                          this.state.orderBy === 'name'
                                          ?
                                          <IoArrowDownC />
                                          :
                                          null
                                        }</Col>}</Row>
                                    </TableHeaderColumn>
                                    <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'description', array:'landscape'})}>Description
                                    {
                                      this.state.orderBy === 'description' && this.state.order === 'asc'
                                      ?
                                      <IoArrowUpC />
                                      :
                                      <Col>{
                                          this.state.orderBy === 'description'
                                          ?
                                          <IoArrowDownC />
                                          :
                                          null
                                        }</Col>}</Row>
                                    </TableHeaderColumn>
                                </TableRow>
                            </TableHeader>
                            <TableBody displayRowCheckbox={false} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                              {
                                this.state.landscapeItems.map((row, index)  => (
                                  <TableRow key={row._id} className={cx({'showBackground': this.state.selectedLandscapeRows.indexOf(row) !== -1})}>
                                      <TableRowColumn data-my-row-identifier={row._id}><img src={row.imageUri} style={{
                                      width: 50
                                  }}/></TableRowColumn>
                                      <TableRowColumn data-my-row-identifier={row._id}>{row.name}</TableRowColumn>
                                      <TableRowColumn data-my-row-identifier={row._id}>{row.description}</TableRowColumn>
                                  </TableRow>
                              ))}
                              </TableBody>
                              <TableFooter adjustForCheckbox={false}></TableFooter>
                        </Table>
                      </Tab>
                      <Tab label="Users" key="2">
                        <Row style={{justifyContent:'space-between'}}>
                          <Col xs={8}>
                            <div style={styles.wrapper}>
                              {
                                this.state.selectedUserRows.map((row, index) => (
                                  <Chip style = {styles.chip} key={index} >
                                    <Avatar src={row.imageUri}/>
                                     {row.firstName}
                                  </Chip>
                              ))
                            }
                            </div>
                          </Col>
                          <Col xs={4}>
                            <div className="filter-list" style={{marginTop:-5, marginBottom:10}}>
                              <IoSearch style={{fontSize:20, color:'gray', marginRight:5}} /><TextField type="text" hintText="Search" onChange={this.filterUserList}/>
                            </div>
                          </Col>
                        </Row>
                        <Table key="userTable" onCellClick={this.handlesUserRowClick} height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={false} multiSelectable={false} >
                            <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                                <TableRow>
                                    <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                      <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'lastName', array:'user'})}>Name
                                      {
                                        this.state.orderBy === 'lastName' && this.state.order === 'asc'
                                        ?
                                        <IoArrowUpC />
                                        :
                                        <Col>{
                                            this.state.orderBy === 'lastName'
                                            ?
                                            <IoArrowDownC />
                                            :
                                            null
                                          }</Col>}</Row>
                                      </TableHeaderColumn>
                                      <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'email', array:'user'})}>Email
                                      {
                                        this.state.orderBy === 'email' && this.state.order === 'asc'
                                        ?
                                        <IoArrowUpC />
                                        :
                                        <Col>{
                                            this.state.orderBy === 'email'
                                            ?
                                            <IoArrowDownC />
                                            :
                                            null
                                          }</Col>}</Row>
                                      </TableHeaderColumn>
                                      <TableHeaderColumn>Admin
                                      </TableHeaderColumn>
                                </TableRow>
                              </TableHeader>
                              <TableBody displayRowCheckbox={false} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false} >
                                  {
                                    this.state.userItems.map((row, index)  => (
                                      <TableRow key={row._id} className={cx({'showBackground': this.state.selectedUserRows.indexOf(row) !== -1})}>
                                        <TableRowColumn data-my-row-identifier={row._id}><img src={row.imageUri} style={{width: 40, borderRadius: 50}}/></TableRowColumn>
                                        <TableRowColumn data-my-row-identifier={row._id}>{row.lastName}, {row.firstName} </TableRowColumn>
                                        <TableRowColumn data-my-row-identifier={row._id}>{row.email}</TableRowColumn>
                                        <TableRowColumn data-my-row-identifier={row._id}>
                                          <Toggle toggled={row.isAdmin || (row.role === 'admin')} onToggle={() => (
                                              this.state.stateUsers[index].isAdmin = !this.state.stateUsers[index].isAdmin,
                                              this.setState({stateUsers: [...this.state.stateUsers]})
                                            )} disabled={row.role === 'admin'} />
                                        </TableRowColumn>
                                      </TableRow>
                                  ))}
                              </TableBody>
                              <TableFooter adjustForCheckbox={false}></TableFooter>
                          </Table>

                      </Tab>
                      <Tab label="Accounts" key="4">
                        <Row style={{justifyContent:'space-between'}}>
                          <Col>
                            <div style={styles.wrapper}>
                              {
                                this.state.selectedAccountRows.map((row, index) => (
                                  <Chip style = {styles.chip} key={index} >
                                     {row.name}
                                  </Chip>
                              ))
                            }
                            </div>
                          </Col>
                          <Col style={{width:'300px'}}>
                            <div className="filter-list" style={{marginTop:-5, marginBottom:10}}>
                              <IoSearch style={{fontSize:20, color:'gray', marginRight:5}} /><TextField type="text" hintText="Search" onChange={this.filterAccountList}/>
                            </div>
                          </Col>
                        </Row>
                        <Table key="accountsTable" height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}  onCellClick={this.handlesAccountRowClick} selectable={false} multiSelectable={false} >
                          <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                              <TableRow>
                                <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'name', array:'account'})}>Name
                                {
                                  this.state.orderBy === 'name' && this.state.order === 'asc'
                                  ?
                                  <IoArrowUpC />
                                  :
                                  <Col>{
                                      this.state.orderBy === 'name'
                                      ?
                                      <IoArrowDownC />
                                      :
                                      null
                                    }</Col>}</Row>
                                </TableHeaderColumn>
                                <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'region', array:'account'})}>Region
                                {
                                  this.state.orderBy === 'region' && this.state.order === 'asc'
                                  ?
                                  <IoArrowUpC />
                                  :
                                  <Col>{
                                      this.state.orderBy === 'region'
                                      ?
                                      <IoArrowDownC />
                                      :
                                      null
                                    }</Col>}</Row>
                                </TableHeaderColumn>
                                <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'createdAt', array:'account'})}>Created At
                                {
                                  this.state.orderBy === 'createdAt' && this.state.order === 'asc'
                                  ?
                                  <IoArrowUpC />
                                  :
                                  <Col>{
                                      this.state.orderBy === 'createdAt'
                                      ?
                                      <IoArrowDownC />
                                      :
                                      null
                                    }</Col>}</Row>
                                </TableHeaderColumn>
                              </TableRow>
                          </TableHeader>
                          <TableBody displayRowCheckbox={false} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                            {
                              this.state.accountItems.map((row, index)  => (
                                <TableRow key={row._id} className={cx({'showBackground': this.state.selectedAccountRows.indexOf(row) !== -1})}>
                                  <TableRowColumn data-my-row-identifier={row._id}>{row.name}</TableRowColumn>
                                  <TableRowColumn data-my-row-identifier={row._id}>{row.region}</TableRowColumn>
                                  <TableRowColumn data-my-row-identifier={row._id}>{row.createdAt}</TableRowColumn>
                                </TableRow>
                            ))}
                          </TableBody>
                          <TableFooter adjustForCheckbox={false}></TableFooter>
                          </Table>
                      </Tab>
                  </Tabs>
                </Row>
                </Card>
              </Row>
          </div>
        )
    }

    filterLandscapeList = (event) => {
      var updatedList = this.state.stateLandscapes;
      updatedList = updatedList.filter(function(item){
        return (item.name.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1);
      });
      this.setState({landscapeItems: [...updatedList]});
    }

    filterAccountList = (event) => {
      var updatedList = this.state.stateAccounts;
      updatedList = updatedList.filter(function(item){
        return (item.name.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1) ||
          (item.region.toLowerCase().search(
            event.target.value.toLowerCase()) !== -1)
      });
      this.setState({accountItems: [...updatedList]});
    }

    filterUserList = (event) => {
      var updatedList = this.state.stateUsers;
      updatedList = updatedList.filter(function(item){
        return (item.lastName.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1) ||
          (item.firstName.toLowerCase().search(
            event.target.value.toLowerCase()) !== -1) ||
            (item.email.toLowerCase().search(
              event.target.value.toLowerCase()) !== -1) ||
              (item.username.toLowerCase().search(
                event.target.value.toLowerCase()) !== -1)
      });
      if(this.state.managedVPC){
        updatedList = updatedList.filter(function(item){
          return (item.managedVPC.search(true) !== -1)
        });
      }
      this.setState({userItems: [...updatedList]});
    }

    handlesClickOrder = event => {
        this.setState({orderBy: event.orderBy});
        if(this.state.order === 'asc'){
          this.setState({order: 'desc'})
        }
        else{
          this.setState({order: 'asc'})
        }
        if(event.array === 'landscape'){
          var sorted = orderBy(this.state.landscapeItems, event.orderBy, this.state.order);
          this.setState({landscapeItems: sorted})
        }
        else if(event.array === 'account'){
          var sorted = orderBy(this.state.accountItems, event.orderBy, this.state.order);
          this.setState({accountItems: sorted})
        }
        else if(event.array === 'user'){
          var sorted = orderBy(this.state.userItems, event.orderBy, this.state.order);
          this.setState({userItems: sorted})
        }

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

    handlesLandscapeRowClick = (rowNumber, columnNumber, evt) =>{
      var landscapeRows = this.state.selectedLandscapeRows || [];
      var selectedLandscape = this.state.stateLandscapes.find(landscape => {return landscape._id === evt.target.dataset.myRowIdentifier;})
      var index = this.state.selectedLandscapeRows.map(function(el) {
          return el._id;
        }).indexOf(evt.target.dataset.myRowIdentifier);
      if(index === -1){
        landscapeRows.push(selectedLandscape);
      }
      else{
        landscapeRows.splice(index, 1)
      }
      this.setState({selectedLandscapeRows: [...landscapeRows]})
    }

    handlesAccountRowClick = (rowNumber, columnNumber, evt) =>{
      var rows = this.state.selectedAccountRows || [];
      var selected = this.state.stateAccounts.find(account => {return account._id === evt.target.dataset.myRowIdentifier;})
      var index = this.state.selectedAccountRows.map(function(el) {
          return el._id;
        }).indexOf(evt.target.dataset.myRowIdentifier);
      if(index === -1){
        rows.push(selected);
      }
      else{
        rows.splice(index, 1)
      }
      this.setState({selectedAccountRows: [...rows]})
    }

    handlesUserRowClick = (rowNumber, columnNumber, evt) =>{
      var rows = this.state.selectedUserRows || [];
      var selected = this.state.stateUsers.find(user => {return user._id === evt.target.dataset.myRowIdentifier;})
      var index = this.state.selectedUserRows.map(function(el) {
          return el._id;
        }).indexOf(evt.target.dataset.myRowIdentifier);
      if(index === -1){
        rows.push(selected);
      }
      else{
        rows.splice(index, 1)
      }
      this.setState({selectedUserRows: [...rows]})
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

    handlesOnManagedVPCChange = event => {
        event.preventDefault()
        if(!this.state.integration){
          this.setState({errorManagedVPCMessage: 'Managed VPC integration configuration is required to make type: Managed VPC'})
        }
        else{ //Only shows users of type ManagedVPC in Users selection
            // Refresh the selected ones
          this.setState({errorManagedVPCMessage: null})
          var updatedList = this.state.stateUsers
          if(!this.state.managedVPC){
            updatedList = this.state.stateUsers.filter(function(item){
              if(item['managedVPC'] && item['managedVPC'] === true){
                return item
              }
            });
          }
          this.getRepoData()
          this.handleOnRowSelectionUsers('none') // resets selected users
          this.setState({userItems: [...updatedList]});
          this.setState({managedVPC: !this.state.managedVPC})
        }
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

    handlesOnManagedVPCCreate = () => {

    }

    getRepoData = () => {
      this.setState({errorManagedVPCMessage: null});
      this.setState({retrievingData: 'Retrieving necessary data, do not save until finished.'});
      const { integration } = this.state
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
                  this.setState({retrievingData: null});
                  this.setState({errorManagedVPCMessage: 'Integration configured with invalid credentials. Unable to complete request.'})
              })
          })
      }
      GetRepo().then((data) =>{
        this.setState({ repoData: data})
        this.setState({ githubData: integration })
        this.setState({retrievingData: null});
      })
      .catch(() =>{
        this.setState({loading: false})
      });
    }

    convertAndPush = (group) => {
      const { users } = this.props
      return new Promise((resolve, reject) => {
      this.state.repoData.forEach((repo, index) => {
        if(repo.items){
            Object.keys(repo.items).find(key => {
              if(key === 'current_users'){
                var currentUsers = this.state.repoData[index].items['current_users']

                var repoData = this.state.repoData

                    group.users.forEach(user => {
                      var currentUser = users.find((usr) => {return (usr._id === user.userId)})
                      var userGroupExists = currentUsers.find((cu) => {return ((currentUser.username === cu.name) && (group.name === cu.host_group  ))})
                      if(!userGroupExists || userGroupExists === undefined){
                        currentUsers.push({
                          name: currentUser.username,
                          host_group: group.name,
                          publicKey: currentUser.publicKey
                        })
                      }

                    })
                    var currentUsersSorted = orderBy(currentUsers, 'name', 'asc');
                    repoData[index].items.current_users = currentUsersSorted;

                      axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/yaml/stringify`, repoData).then(res => {
                            var newData = {
                              githubData: this.state.githubData,
                              repoData: res.data
                            }
                        return axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/commit`, newData).then(res => {
                            return resolve(res.data)
                          }).catch(err =>{
                            return reject(err)
                          })
                          })
                          .catch(err => {
                            return reject(err)
                          })
                      }
                    })
                  }
              })

          })
    }

    handlesCreateClick = event => {
        const { router } = this.context
        this.setState({loading: true})
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
                groupToCreate.landscapes.push(this.state.selectedLandscapeRows[i]._id)
            }
        }
        if (this.state.selectedUserRows) {
            for (var i = 0; i < this.state.selectedUserRows.length; i++) {
                if(this.state.selectedUserRows[i].role === 'admin'){
                  this.state.selectedUserRows[i].isAdmin = true;
                }
                groupToCreate.users.push({
                    userId: this.state.selectedUserRows[i]._id,
                    isAdmin: this.state.selectedUserRows[i].isAdmin || false
                })
            }
        }
        if (this.state.selectedAccountRows) {
            for (var i = 0; i < this.state.selectedAccountRows.length; i++) {
              groupToCreate.accounts.push(this.state.selectedAccountRows[i]._id)

            }
        }
        groupToCreate.imageUri = this.state.croppedImg || this.state.imageUri
        groupToCreate.managedVPC = this.state.managedVPC || false

        if(this.state.managedVPC){
            this.convertAndPush(groupToCreate).then(data => {
              this.setState({loading: false})
              this.props.CreateGroupWithMutation({
                  variables: { group: groupToCreate }
               }).then(({ data }) => {
                  this.setState({
                    successOpen: true
                  })
              }).then(() =>{
                  this.props.refetchGroups({}).then(({ data }) =>{
                    router.push({ pathname: '/groups' })
                    this.setState({loading: false})
                  }).catch((error) => {
                      this.setState({
                        failOpen: true
                      })
                      this.setState({loading: false})
                  })
              }).catch((error) => {
                  this.setState({
                    failOpen: true
                  })
                  this.setState({loading: false})
              })
            }).catch(() =>{
            this.setState({errorManagedVPCMessage: 'Integration configured with invalid credentials. Unable to complete request.'})
            this.setState({failOpen: true})
            this.setState({loading: false})
          })
        }
        else{
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
