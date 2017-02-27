import { forIn } from 'lodash'
import React, { Component, PropTypes } from 'react'
import axios from 'axios'
import cx from 'classnames'
import { Row, Col } from 'react-flexbox-grid'
import Dropzone from 'react-dropzone'
import { IoCube, IoClose } from 'react-icons/lib/io'
import shallowCompare from 'react-addons-shallow-compare'
import UploadIcon from 'material-ui/svg-icons/file/file-upload'
import { Checkbox, Card, Dialog, FlatButton, Paper, RaisedButton, TextField } from 'material-ui'
import AvatarCropper from "react-avatar-cropper";

import { Loader } from '../../components'
import materialTheme from '../../style/custom-theme.js';
import defaultLandscapeImage from '../../style/AWS.png';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import {Table, TableRow, TableBody, TableRowColumn, TableHeader, TableHeaderColumn} from 'material-ui';

class EditLandscape extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showDeleteDialog: false,
        typeOptions: [
            "Wiki", "Other", "Test", "Link"
        ],
        addedDocuments: [],
        showAddDocument: false,
        cloudFormationTemplate: null
    }

    componentDidMount() {
        const { enterLandscapes, landscapes, params } = this.props
        enterLandscapes()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }

    render() {

        const { animated, showDeleteDialog, viewEntersAnim } = this.state
        const { activeLandscape, currentUser, loading, landscapes, documentTypes, params } = this.props
        let disableDelete = false,
            self = this,
            currentLandscape = activeLandscape || {}

        var _landscapes = landscapes || []
        // for direct request
        // if (activeLandscape && activeLandscape._id !== params.id)
            currentLandscape = _landscapes.find(ls => { return ls._id === params.id })

        // set disableDelete value
        if (currentLandscape && currentLandscape.status){
          forIn(currentLandscape.status, (value, key) => {
              if (value > 0)
                  disableDelete = true
          })
        }

        disableDelete = !currentUser.isGlobalAdmin || (Object.keys(currentUser.permissions).length > 0 && !currentUser.permissions[currentLandscape._id].indexOf('d') > -1)

        if (loading || this.state.loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <Row center='xs' middle='xs' className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <Col xs={12} lg={12} className={cx( { 'edit-landscape': true } )}>
                    <Row middle='xs'>
                        <Col xs={4} style={{ textAlign: 'left' }}>
                            <h4>Edit Landscape</h4>
                        </Col>
                        <Col xs={8}>
                          <RaisedButton label='Cancel' primary={true} onClick={() => {
                              const {router} = this.context
                              router.push(`/landscape/${params.id}`)
                          }}
                            style={{ float: 'right', margin: '30px 0px' }}
                            labelStyle={{ fontSize: '11px' }}/>
                            <RaisedButton label='Save' onTouchTap={this.handlesUpdateClick}
                                style={{ float: 'right', margin: '30px 0px' }}
                                labelStyle={{ fontSize: '11px' }}/>

                            <RaisedButton label='Delete' onTouchTap={() => { this.setState({ showDeleteDialog: !showDeleteDialog }) }}
                                disabled={disableDelete}
                                style={{ float: 'right', margin: '30px 0px' }}
                                labelStyle={{ fontSize: '11px' }}/>

                            <Dialog title='Delete Landscape' modal={false} open={showDeleteDialog}
                                onRequestClose={() => { this.setState({ showDeleteDialog: !showDeleteDialog }) }}
                                actions={[
                                    <FlatButton label='Cancel' primary={true} onTouchTap={() => { this.setState({ showDeleteDialog: !showDeleteDialog }) }}/>,
                                    <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteLandscapeClick.bind(this, currentLandscape)}/>
                                ]}>
                                Are you sure you want to delete?
                            </Dialog>

                        </Col>
                    </Row>
                    <Paper zDepth={1} rounded={false}>
                      <Col>
                        <Row style={{minHeight:350, width: '100%'}}>
                          <Col style={{paddingLeft: 10, paddingRight: 10,  width:'65%'}}>
                            <TextField id='name' ref='name' defaultValue={currentLandscape.name || ''} maxLength={64} floatingLabelText='Name' className={cx( { 'two-field-row': true } )}/>
                            <TextField id='version' ref='version' defaultValue={currentLandscape.version} floatingLabelText='Version' className={cx( { 'two-field-row': true } )}/>

                            <TextField id='description' ref='description' defaultValue={currentLandscape.description} multiLine={true} rows={1} rowsMax={4}
                                floatingLabelText='Description' fullWidth={true} floatingLabelStyle={{ left: '0px' }} textareaStyle={{ width: '95%' }}/>
                          </Col>
                          <Col style={{paddingLeft: 20, paddingRight: 200, width:'35%'}}>
                            <Row style={{justifyContent: 'space-around'}}>
                              <Dropzone id='imageUri' onDrop={this.handlesImageUpload} multiple={false} accept='image/*' style={{
                                  marginLeft: '10px',
                                  maxWidth: '100px',
                                  padding: '15px 0px'
                              }}>
                                  <div className="avatar-photo">
                                      <div className="avatar-edit">
                                          <span>Click to Choose Image</span>
                                          <i className="fa fa-camera" style={{fontSize: 30}}></i>
                                      </div>
                                      <img src={this.state.croppedImg || currentLandscape.imageUri}/>
                                  </div>
                                  {this.state.cropperOpen &&
                                    <AvatarCropper onRequestHide={this.handleRequestHide} cropperOpen={this.state.cropperOpen} onCrop={this.handleCrop} image={this.state.img} width={400} height={400}/>
                                  }
                              </Dropzone>
                            </Row>
                          </Col>
                        </Row>
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
                                  <RaisedButton label="Add" style={{float: 'right', marginRight:15}} onClick={() => this.setState({showAddDocument: true})} />
                              }
                            </Col>
                        </Row>
                        <Row style={{width: '100%', marginBottom:25}}>
                          {
                            this.state.addedDocuments.length > 0
                            ?
                            <Row style={{width:'100%', marginLeft: 10, borderBottom: '1px solid #DCDCDC', borderTop:  '1px solid #DCDCDC'}}>
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
                        </Row>
                        <Row style={{width:'100%', marginBottom:25}}>
                          {
                            this.state.showAddDocument
                              ?
                              <Card style={{width:'100%', marginBottom: 10, marginLeft: 10,}}>
                                <Row  middle='xs' style={{marginBottom: 10, marginLeft: 10, width:'100%'}}>
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
                                <Row middle='xs' style={{marginBottom: 20, marginLeft: 10}}>
                                    <RaisedButton label="Save" onClick={this.handlesCreateDocumentClick}/>
                                </Row>
                              </Card>
                              :
                              <div></div>
                          }
                        </Row>
                        <Row>
                          <Dropzone id='cloudFormationTemplate' onDrop={this.handlesTemplateClick} multiple={false}
                              style={{ border: '', width: '100%', height: 150, padding: '15px 5px' }}
                              activeStyle={{ border: 'limegreen 1px solid', width: '100%', padding: '15px 0px' }}>
                              {
                                  this.state.cloudFormationTemplate
                                  ?
                                      <textarea rows={100} style={{ background: '#f9f9f9', fontFamily: 'monospace', width: '100%' }}>{this.state.cloudFormationTemplate}</textarea>
                                  :
                                  <div>
                                    {
                                       currentLandscape.cloudFormationTemplate
                                       ?
                                          <textarea rows={100} style={{ background: '#f9f9f9', fontFamily: 'monospace', width: '100%' }}>{currentLandscape.cloudFormationTemplate}</textarea>
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
                                  </div>
                              }
                          </Dropzone>
                        </Row>
                      </Col>

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

    handlesCreateDocumentClick = () => {
      var data = {
        url: this.state.docUrl,
        name: this.state.docName,
        type: this.state.docType
      }
      var array = this.state.addedDocuments;
      array.push(data);
      this.setState({addedDocuments: array, showAddDocument: false, docType:'', docName: '', docUrl: ''})
    }

    handlesTemplateClick = (acceptedFiles, rejectedFiles) => {
        console.log('this.state.cloudFormationTemplate', this.state.cloudFormationTemplate)
        let self = this
        let data = new FormData()

        data.append('file', acceptedFiles[0])
        console.log(acceptedFiles[0])
        console.log(data)
        this.setState({
            cloudFormationTemplate: null
        })
        axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/upload/template`, data).then(res => {
            self.setState({
                cloudFormationTemplate: JSON.stringify(res.data, null, 4)
            })

            console.log('res.data', res.data)
            console.log('this.state.cloudFormationTemplate', this.state.cloudFormationTemplate)
        }).catch(err => {
          console.log('err', err)
        })
    }

    handlesUpdateClick = event => {
        event.preventDefault()
        this.setState({loading: true})

        const { landscapes, mutate, params, refetch } = this.props
        const { router } = this.context
        const currentLandscape = landscapes.find(ls => { return ls._id === params.id })

        let landscapeToUpdate = {}
        // map all fields to landscapeToUpdate
        for (let key in this.refs) {
            landscapeToUpdate[key] = this.refs[key].getValue()
        }
        // attach imageUri and cloudFormationTemplate
        landscapeToUpdate._id = params.id
        landscapeToUpdate.imageUri = this.state.croppedImg || currentLandscape.imageUri || defaultLandscapeImage
        landscapeToUpdate.cloudFormationTemplate = this.state.cloudFormationTemplate || currentLandscape.cloudFormationTemplate
        if(!landscapeToUpdate.version){
          landscapeToUpdate.version = currentLandscape.version || '1.0'
        }
        landscapeToUpdate.documents = this.state.addedDocuments;

        landscapeToUpdate.documents.map(document =>{
          delete document.__typename
        })
        delete landscapeToUpdate.documents.__typename

        this.props.updateLandscape({
            variables: { landscape: landscapeToUpdate }
        }).then(({ data }) => {
            return refetch()
        }).then(({ data }) => {
            this.setState({
                successOpen: true,
                loading: false
            })
            router.push({ pathname: '/landscapes' })
        }).catch((error) => {
            console.log(error)
            this.setState({ loading: false })
        })
    }

    handlesDeleteLandscapeClick = (landscape, event) => {
        event.preventDefault()
        const { router } = this.context
        const { deleteLandscape, refetch } = this.props
        const { showDeleteDialog } = this.state

        this.setState({ showDeleteDialog: !showDeleteDialog })

        console.log('landscape', landscape)
        deleteLandscape({
            variables: { landscapeToDelete }
        }).then(({ data }) => {
            router.push({ pathname: `/landscapes` })
            return refetch()
        }).catch((error) => {
            console.error('graphql error', error)
        })
    }

    closeError = (event) => {
        event.preventDefault()
        const { resetError } = this.props
        resetError()
    }
}

EditLandscape.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired,
    refetchLandscapes: PropTypes.func
}

EditLandscape.contextTypes = {
    router: PropTypes.object
}

export default EditLandscape
