import React, { Component, PropTypes } from 'react'
import axios from 'axios'
import cx from 'classnames'
import { Row, Col } from 'react-flexbox-grid'
import Dropzone from 'react-dropzone'
import { IoClose, IoCube } from 'react-icons/lib/io'
import { MdClear } from 'react-icons/lib/md/clear'
import FlatButton from 'material-ui/FlatButton'
import shallowCompare from 'react-addons-shallow-compare'
import UploadIcon from 'material-ui/svg-icons/file/file-upload'
import { Paper, RaisedButton, TextField } from 'material-ui'
import Snackbar from 'material-ui/Snackbar';
import AvatarCropper from "react-avatar-cropper";
import defaultLandscapeImage from '../../style/AWS.png';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import lodash from 'lodash'
import { auth } from '../../services/auth'


import './landscapes.style.scss'
import { Loader } from '../../components'

class CreateLandscape extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        successOpen: false,
        failOpen: false,
        errorMessage: false,
        addedDocuments: [

        ],
        showAddDocument: false
    }

    componentDidMount() {
        const { enterLandscapes } = this.props
        enterLandscapes()
    }
    componentWillReceiveProps(nextProps) {
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
           index = groupsByUser.map(function(o) { return o._id; }).indexOf(group.groupId);
           userAdminGroups.push(groupsByUser[index])
        })
      }
      this.setState({userAdminGroups, isGroupAdmin})
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
           index = groupsByUser.map(function(o) { return o._id; }).indexOf(group.groupId);
           userAdminGroups.push(groupsByUser[index])
        })
      }
      this.setState({userAdminGroups, isGroupAdmin})
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }

    render() {

        const { animated, viewEntersAnim, isGroupAdmin, userAdminGroups } = this.state
        const { loading, landscapes, documentTypes } = this.props

        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <Row center='xs' middle='xs' className={cx({'animatedViews': animated, 'view-enter': viewEntersAnim })}>
            <Snackbar
              open={this.state.successOpen}
              message="Landscape successfully created."
              autoHideDuration={3000}
              onRequestClose={this.handleRequestClose}
            />
            <Snackbar
              open={this.state.failOpen}
              message="Error creating landscape."
              autoHideDuration={3000}
              onRequestClose={this.handleRequestClose}
            />
                <Col xs={6} lg={9} className={cx( { 'create-landscape': true } )}>
                    <Row middle='xs'>
                        <Col xs={4} style={{ textAlign: 'left' }}>
                            <h4>New Landscape</h4>
                        </Col>
                        <Col xs={8}>
                            <RaisedButton label='Save' onClick={this.handlesCreateClick}
                                style={{ float: 'right', margin: '30px 0px' }}
                                labelStyle={{ fontSize: '11px' }}/>
                        </Col>
                    </Row>
                    <Paper zDepth={1} rounded={false}>
                      {
                        this.state.errorMessage
                        ?
                        <p style={{color: 'red'}}>{this.state.message}</p>
                        :
                        null
                      }

                        <TextField id='name' ref='name' floatingLabelText='Name' maxLength={64} className={cx( { 'two-field-row': true } )}/>
                        <TextField id='version' ref='version' floatingLabelText='Version' className={cx( { 'two-field-row': true } )}/>

                        <TextField id='description' ref='description' multiLine={true} rows={4} floatingLabelText='Description'
                            fullWidth={true} floatingLabelStyle={{ left: '0px' }} textareaStyle={{ width: '95%' }}/>

                          <Row center='xs' middle='xs' style={{marginBottom: 10}}>
                              <Col xs={2}>
                                <h4 style={{float:'left', marginLeft: 10}}>Documents</h4>
                              </Col>
                              <Col xs={10}>
                                {
                                  this.state.showAddDocument
                                    ?
                                    <RaisedButton label="Cancel" style={{float: 'right', marginRight:10}} onClick={() => this.setState({showAddDocument: false})} />
                                    :
                                    <RaisedButton label="Add" style={{float: 'right', marginRight:10}} onClick={() => this.setState({showAddDocument: true})} />
                                }
                              </Col>
                          </Row>
                          {
                            this.state.addedDocuments.length > 0
                            ?
                            <Row style={{width:'95%', marginLeft: 10, borderBottom: '1px solid #DCDCDC', borderTop:  '1px solid #DCDCDC'}}>
                                <Table selectable={false} fixedHeader={true}>
                                  <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                                    <TableRow>
                                      <TableHeaderColumn>Type</TableHeaderColumn>
                                      <TableHeaderColumn>Name</TableHeaderColumn>
                                      <TableHeaderColumn>URL</TableHeaderColumn>
                                      <TableHeaderColumn>Remove</TableHeaderColumn>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody displayRowCheckbox={false}>
                                    {
                                      this.state.addedDocuments.map((document, index)=>{
                                        return(
                                          <TableRow key={index}>
                                            <TableRowColumn>{document.type}</TableRowColumn>
                                            <TableRowColumn>{document.name}</TableRowColumn>
                                            <TableRowColumn>{document.url}</TableRowColumn>
                                            <TableRowColumn>
                                              <FlatButton onTouchTap={() =>{
                                                  var documentArray = this.state.addedDocuments;
                                                  documentArray.splice(index, 1);
                                                  this.setState({addedDocuments: [...documentArray]
                                                  })
                                                }} hoverColor={'none'}
                                                        labelStyle={{ fontSize: '12px', fontWeight: 'bold' }}icon={<IoClose/>}/>
                                            </TableRowColumn>
                                          </TableRow>
                                        )
                                      })
                                    }
                                  </TableBody>
                                </Table>
                            </Row>
                            :
                            <div></div>
                          }

                          {
                            this.state.showAddDocument
                              ?
                              <div>
                                <Row  middle='xs' style={{marginBottom: 10, marginLeft: 10}}>
                                  <h4>New Document</h4>
                                </Row>
                                <Row middle='xs' style={{marginBottom: 10, marginLeft: 10}}>
                                  {
                                    documentTypes && documentTypes.length > 0
                                      ?
                                      <SelectField style={{width:'95%'}} id='type' floatingLabelText='Type' value={this.state.docType} onChange={this.handlesTypeChange}
                                          floatingLabelStyle={{ left: '0px' }} className={cx( { 'two-field-row': true } )}>
                                          {
                                            documentTypes.map((type, index)=>{
                                              return(
                                                <MenuItem key={index} value={type.name} primaryText={type.name}/>
                                              )

                                          })
                                        }
                                      </SelectField>
                                      :
                                      <p>Must have Document Types Defined</p>
                                  }

                                </Row>
                                <Row center='xs' middle='xs' style={{marginBottom: 10}}>
                                  <TextField id='docName' ref='docName' floatingLabelText='Name' onChange={this.handlesdocNameChange} maxLength={64} style={{width:'95%'}}/>
                                </Row>
                                <Row center='xs' middle='xs' style={{marginBottom: 10}}>
                                  <TextField id='url' ref='url' floatingLabelText='URL' onChange={this.handlesdocUrlChange} style={{width:'95%'}} />
                                </Row>
                                <Row middle='xs' style={{marginBottom: 10, marginLeft: 10, marginBottom: 20}}>
                                    <RaisedButton label="Save" onClick={this.handlesCreateDocumentClick}/>
                                </Row>
                              </div>
                              :
                              <div></div>
                          }
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
                          <Dropzone id='imageUri' onDrop={this.handlesImageUpload} multiple={false} accept='image/*' style={{
                              marginLeft: '10px',
                              maxWidth: '100px',
                              padding: '15px 0px',
                              marginTop:10
                          }}>
                              <div className="avatar-photo" >
                                  <div className="avatar-edit">
                                      <span>Click to Choose Image</span>
                                      <i className="fa fa-camera" style={{fontSize: 30}}></i>
                                  </div>
                                  <img src={this.state.croppedImg || this.state.imageUri || defaultLandscapeImage}/>
                              </div>
                              {this.state.cropperOpen &&
                                <AvatarCropper onRequestHide={this.handleRequestHide} cropperOpen={this.state.cropperOpen} onCrop={this.handleCrop} image={this.state.img} width={400} height={400}/>
                              }
                          </Dropzone>

                        <Dropzone id='cloudFormationTemplate' onDrop={this.handlesTemplateClick} multiple={false}
                            style={{ width: '100%', height: 150, padding: '15px 0px' }}
                            activeStyle={{ border: 'limegreen 1px solid', width: '100%', padding: '15px 0px' }}>
                            {
                                this.state.cloudFormationTemplate
                                ?
                                    <textarea rows={100} style={{ background: '#f9f9f9', fontFamily: 'monospace', width: '100%' }}>{ this.state.cloudFormationTemplate }</textarea>
                                :
                                    <Row center='xs' middle='xs'>
                                        <Col style={{ marginTop: 25 }}>
                                            <IoCube size={42}/>
                                        </Col>
                                        <div style={{ fontSize: '12px', width: '100%', margin: '10px 0px' }}> Drop
                                            <strong style={{ fontSize: '12px' }}> JSON </strong> or
                                            <strong style={{ fontSize: '12px' }}> YAML </strong> file
                                        </div>
                                    </Row>
                            }
                        </Dropzone>
                    </Paper>
                </Col>
            </Row>
        )
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

    handlesTypeChange = (event, index, value) => {
      this.setState({docType: value})

    }
    handlesdocNameChange = (event) => {
      this.setState({docName: event.target.value})

    }
    handlesdocUrlChange = (event) => {
      this.setState({docUrl: event.target.value})

    }

    handleOnRowSelection = selectedRows => {
      if(selectedRows === 'all'){
        selectedRows = []
        this.state.userAdminGroups.forEach((group, index) =>{
          selectedRows.push(index)
        })
      }
      this.setState({
        selectedRows
      })
    }


    handlesCreateDocumentClick = () => {
      var data = {
        url: this.state.docUrl,
        name: this.state.docName,
        type: this.state.docType
      }
      var array = this.state.addedDocuments;
      array.push(data)
      this.setState({
          addedDocuments: array,
          showAddDocument: false,
          docType:'',
          docName: '',
          docUrl: ''
      })
    }

    handlesTemplateClick = (acceptedFiles, rejectedFiles) => {

        let self = this
        let data = new FormData()

        data.append('file', acceptedFiles[0])

        axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/upload/template`, data).then(res => {
            self.setState({
                cloudFormationTemplate: JSON.stringify(res.data, null, 4)
            })
        }).catch(err => {
        })
    }

    handlesCreateClick = event => {
        event.preventDefault()
        const { mutate, accounts } = this.props
        const { userAdminGroups, selectedRows  } = this.state
        const { router } = this.context

        let landscapeToCreate = {}
        // map all fields to landscapeToCreate
        for (let key in this.refs) {
            landscapeToCreate[key] = this.refs[key].getValue()
        }
        // attach imageUri and cloudFormationTemplate
        landscapeToCreate.imageUri = this.state.croppedImg || defaultLandscapeImage
        landscapeToCreate.cloudFormationTemplate = this.state.cloudFormationTemplate || ''
        if(!landscapeToCreate.version){
          landscapeToCreate.version = '1.0'
        }
        landscapeToCreate.documents = this.state.addedDocuments;
        if(!landscapeToCreate.name){
          this.setState({errorMessage: true, message: 'Name is required.'})
          return
        }
        else if(!landscapeToCreate.description){
          this.setState({errorMessage: true, message: 'Description is required.'})
          return
        }
        else if(!landscapeToCreate.cloudFormationTemplate){
          this.setState({errorMessage: true, message: 'Template is required.'})
          return
        }
        else{
        mutate({
            variables: { landscape: landscapeToCreate }
         }).then(({ data }) => {
           if (selectedRows) {
             for (var i = 0; i < selectedRows.length; i++) {
               if(!userAdminGroups[selectedRows[i]].accounts){
                 userAdminGroups[selectedRows[i]].accounts = []
               }
                 userAdminGroups[selectedRows[i]].landscapes.push(data.createLandscape._id);
                 delete userAdminGroups[selectedRows[i]].__typename
                 userAdminGroups[selectedRows[i]].users.forEach(user =>{
                   delete user.__typename
                 })
                 this.props.UpdateGroupWithMutation(
                   {variables: { group: userAdminGroups[selectedRows[i]] }}).then(() =>{
                    //  let userWithPermissions = auth.setUserPermissions(auth.getUserInfo(), userAdminGroups, accounts)
                    //  auth.setUserInfo(1, 'localStorage', userWithPermissions)
                   })

             }
           }
            this.props.refetchLandscapes({}).then(({ data }) =>{
              this.setState({
                successOpen: true
              })

              router.push({ pathname: '/landscapes' })
            }).catch((error) => {
            })
        }).catch((error) => {
        })
      }
    }

    closeError = (event) => {
        event.preventDefault()
        const { resetError } = this.props
        resetError()
    }
}

CreateLandscape.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired,
    refetchLandscapes: PropTypes.func,
    UpdateGroupWithMutation: PropTypes.func,
    mutate: PropTypes.func
}

CreateLandscape.contextTypes = {
    router: PropTypes.object
}

export default CreateLandscape
