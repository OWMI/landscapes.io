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
import SelectField from 'material-ui/SelectField';
import {Table, TableRow, TableBody, TableRowColumn, TableHeader, TableHeaderColumn, IconMenu, IconButton, MenuItem, CardHeader} from 'material-ui';


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

    componentWillReceiveProps(nextProps){
      const { integrations } = nextProps
      this.setState({integrations: integrations || []})
      let userGroups = []
      let isGroupAdmin = false
      let formationAddOptions = [
        {
          label: 'Private Repo',
          type: 'privateRepo'
        }
        ,
        {
          label: 'Public Repo',
          type: 'public'
        },
        {
          label: 'Local File',
          type: 'local'

        }
      ]
      this.setState({settings: false, formationAddOptions })
    }
    componentWillMount(){
      const { integrations } = this.props
      this.setState({integrations: integrations || []})
      let userGroups = []
      let isGroupAdmin = false
      let formationAddOptions = [
        {
          label: 'Private Repo',
          type: 'privateRepo'
        },
        {
          label: 'Public Repo',
          type: 'public'
        },
        {
          label: 'Local File',
          type: 'local'

        }
      ]
      this.setState({settings: false, formationAddOptions })
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }

    render() {

        const { animated, showDeleteDialog, viewEntersAnim, formationAddOptions } = this.state
        const { activeLandscape, currentUser, loading, landscapes, documentTypes, params } = this.props
        let disableDelete = false,
            self = this,
            currentLandscape = activeLandscape || {}

        var _landscapes = landscapes || []
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
                            style={{ float: 'right', margin: '30px 5px' }}
                            labelStyle={{ fontSize: '11px' }}/>
                            <RaisedButton label='Save' onTouchTap={this.handlesUpdateClick}
                                style={{ float: 'right', margin: '30px 5px' }}
                                labelStyle={{ fontSize: '11px' }}/>

                            <RaisedButton label='Delete' onTouchTap={() => { this.setState({ showDeleteDialog: !showDeleteDialog }) }}
                                disabled={disableDelete}
                                style={{ float: 'right', margin: '30px 5px' }}
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
                        <Card>
                          <Row center='xs' middle='xs' style={{marginBottom: 10}}>
                              <Col xs={2} style={{marginTop:10}}>
                                <h4 style={{float:'left', marginLeft: 10}}>Documents</h4>
                              </Col>
                              <Col xs={10} style={{marginTop:10}}>
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
                        </Card>
                        <Card>
                          <Row center='xs' middle='xs' style={{marginBottom: 10, marginTop:10, justifyContent: 'space-between'}}>
                              <Col>
                                <h4 style={{float:'left', marginLeft: 10, marginTop:10}}>Cloud Formation Template</h4>
                              </Col>
                              <Col style={{marginTop:10, marginRight:20}}>
                                <div >
                                    <RaisedButton onTouchTap={() => this.setState({settings: !this.state.settings})}
                                        label='Add'
                                    />
                                    <IconMenu
                                        open={this.state.settings}
                                        iconButtonElement={<IconButton style={{ display: 'none' }}></IconButton>}
                                        onRequestChange={this.handleOnRequestChange}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                        targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                        >
                                            {
                                                formationAddOptions.map((option, index) => {
                                                      return (
                                                            <MenuItem key={option.type} primaryText={option.label} onClick={this.handlesMenuClick.bind(this, option)}/>
                                                      )
                                                })
                                            }
                                    </IconMenu>

                                  </div>
                              </Col>
                          </Row>
                          {
                            this.state.cloudErrorMessage
                            ?
                            <Row style={{width:'100%', textAlign:'center', justifyContent:'center'}}>
                              <p style={{color:'red'}}>{this.state.cloudErrorMessage}</p>
                            </Row>
                            :
                            null
                          }
                          {
                            this.state.showPublicURL
                            ?
                            <Row style={{width:'100%', paddingLeft:10}}>
                              <TextField style={{width:'80%', margin:0}} floatingLabelText="Public Repo File URL" onChange={this.handlesPublicRepoChange} />
                              <div style={{marginTop:20, marginLeft:10}}>
                                <RaisedButton label="Open" onClick={this.handlesOnPublicURLSubmit}/>
                              </div>
                            </Row>
                            :
                            null
                          }
                          {
                            this.state.showRepoLoading
                            ?
                            <Col>
                              <p>Retrieving most recent version of private repository...</p>
                                <svg width='90px' height='90px' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid'>
                                    <rect x='0' y='0' width='100' height='100' fill='none'/>
                                    <defs>
                                        <filter id='uil-ring-shadow' x='-100%' y='-100%' width='300%' height='300%'>
                                            <feOffset result='offOut' in='SourceGraphic' dx='0' dy='0'/>
                                            <feGaussianBlur result='blurOut' in='offOut' stdDeviation='0'/>
                                            <feBlend in='SourceGraphic' in2='blurOut' mode='normal'/>
                                        </filter>
                                    </defs>
                                    <path d='M10,50c0,0,0,0.5,0.1,1.4c0,0.5,0.1,1,0.2,1.7c0,0.3,0.1,0.7,0.1,1.1c0.1,0.4,0.1,0.8,0.2,1.2c0.2,0.8,0.3,1.8,0.5,2.8 c0.3,1,0.6,2.1,0.9,3.2c0.3,1.1,0.9,2.3,1.4,3.5c0.5,1.2,1.2,2.4,1.8,3.7c0.3,0.6,0.8,1.2,1.2,1.9c0.4,0.6,0.8,1.3,1.3,1.9 c1,1.2,1.9,2.6,3.1,3.7c2.2,2.5,5,4.7,7.9,6.7c3,2,6.5,3.4,10.1,4.6c3.6,1.1,7.5,1.5,11.2,1.6c4-0.1,7.7-0.6,11.3-1.6 c3.6-1.2,7-2.6,10-4.6c3-2,5.8-4.2,7.9-6.7c1.2-1.2,2.1-2.5,3.1-3.7c0.5-0.6,0.9-1.3,1.3-1.9c0.4-0.6,0.8-1.3,1.2-1.9 c0.6-1.3,1.3-2.5,1.8-3.7c0.5-1.2,1-2.4,1.4-3.5c0.3-1.1,0.6-2.2,0.9-3.2c0.2-1,0.4-1.9,0.5-2.8c0.1-0.4,0.1-0.8,0.2-1.2 c0-0.4,0.1-0.7,0.1-1.1c0.1-0.7,0.1-1.2,0.2-1.7C90,50.5,90,50,90,50s0,0.5,0,1.4c0,0.5,0,1,0,1.7c0,0.3,0,0.7,0,1.1 c0,0.4-0.1,0.8-0.1,1.2c-0.1,0.9-0.2,1.8-0.4,2.8c-0.2,1-0.5,2.1-0.7,3.3c-0.3,1.2-0.8,2.4-1.2,3.7c-0.2,0.7-0.5,1.3-0.8,1.9 c-0.3,0.7-0.6,1.3-0.9,2c-0.3,0.7-0.7,1.3-1.1,2c-0.4,0.7-0.7,1.4-1.2,2c-1,1.3-1.9,2.7-3.1,4c-2.2,2.7-5,5-8.1,7.1 c-0.8,0.5-1.6,1-2.4,1.5c-0.8,0.5-1.7,0.9-2.6,1.3L66,87.7l-1.4,0.5c-0.9,0.3-1.8,0.7-2.8,1c-3.8,1.1-7.9,1.7-11.8,1.8L47,90.8 c-1,0-2-0.2-3-0.3l-1.5-0.2l-0.7-0.1L41.1,90c-1-0.3-1.9-0.5-2.9-0.7c-0.9-0.3-1.9-0.7-2.8-1L34,87.7l-1.3-0.6 c-0.9-0.4-1.8-0.8-2.6-1.3c-0.8-0.5-1.6-1-2.4-1.5c-3.1-2.1-5.9-4.5-8.1-7.1c-1.2-1.2-2.1-2.7-3.1-4c-0.5-0.6-0.8-1.4-1.2-2 c-0.4-0.7-0.8-1.3-1.1-2c-0.3-0.7-0.6-1.3-0.9-2c-0.3-0.7-0.6-1.3-0.8-1.9c-0.4-1.3-0.9-2.5-1.2-3.7c-0.3-1.2-0.5-2.3-0.7-3.3 c-0.2-1-0.3-2-0.4-2.8c-0.1-0.4-0.1-0.8-0.1-1.2c0-0.4,0-0.7,0-1.1c0-0.7,0-1.2,0-1.7C10,50.5,10,50,10,50z' fill={`#40a5ed`} filter='url(#uil-ring-shadow)'>
                                        <animateTransform attributeName='transform' type='rotate' from='0 50 50' to='360 50 50' repeatCount='indefinite' dur='1s'/>
                                    </path>
                                </svg>
                            </Col>
                            :
                            <div>
                              {
                                this.state.showViewPrivateRepo
                                ?
                                <Col>
                                  <Row style={{marginLeft:20}}><h4>Private Repo Files:</h4></Row>
                                  {
                                    this.state.availableFiles.map((p, i) => {
                                        return (
                                          <Row key={i} style={{marginLeft:20}}>
                                            <a style={{cursor:'pointer'}} onClick={this.setFile.bind(this, p)}><p>{p}</p></a>
                                          </Row>

                                        )
                                    })
                                  }
                                </Col>
                                :
                                null
                              }
                            </div>
                          }
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
                      </Card>
                      </Col>

                    </Paper>
                </Col>
            </Row>
        )
    }

    handlesMenuClick = (option, bind) => {
      this.setState({cloudErrorMessage: null})
      if(option.type === 'local'){
        this.dropzone.open()
      }
      if(option.type === 'public'){
        this.setState({showPublicURL: true})
        this.setState({showViewPrivateRepo:false})
      }
      if(option.type === 'privateRepo'){
        var privateRepoIntegration = this.state.integrations.find(integration => {return integration.type === 'github'})
        if(!privateRepoIntegration){
          this.setState({cloudErrorMessage: "Currently no private repositories are set up."})
        }
        else{
          this.setState({showRepoLoading: true});
          this.setState({showPublicURL: false})
          this.getRepoData(privateRepoIntegration).then((data)=>{
            this.setState({showRepoLoading: false, showViewPrivateRepo:true});
          })
        }
      }
    }

    handlesOnPublicURLSubmit = () => {
      this.setState({cloudErrorMessage: null})
      if(this.state.publicURL){
        let self = this
        axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/wGetFile`, {url: this.state.publicURL}).then(res => {
          self.setState({
              cloudFormationTemplate: res.data
          })
          return res
        }).catch(err => {
          this.setState({cloudErrorMessage: "Invalid URL."})
        })
      }
    }

    handlesPublicRepoChange = (event) => {
      this.setState({publicURL: event.target.value})
    }

    setFile = (file, bind) => {
      let self = this
      var filename = './_github/' + file
      var data={file: filename}
      axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/getFile`, data).then(res => {
        self.setState({
            cloudFormationTemplate: res.data
        })
        return res
      }).catch(err => {
      })
    }

    getRepoData = (integration) => {
      return new Promise((resolve, reject) => {

      this.setState({cloudErrorMessage: null});
      function GetRepo() {
          var data = {
            deployFolderName: integration.type,
            repoURL: integration.repoURL,
            username: integration.username,
            password: integration.password
          }
          return new Promise((resolve, reject) => {
              axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/repo`, data).then(res => {
                var data = {
                  location: res.data.location
                }
                axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/repo/files`, data).then(res => {
                  resolve(res.data)
                })
              }).catch(err => {
                  return reject(err)
                  this.setState({showRepoLoading: null});
                  this.setState({cloudErrorMessage: 'Integration configured with invalid credentials. Unable to complete request.'})
              })
          })
      }
      GetRepo().then((data) =>{
        var fileData = data.files.filter(file => {
          return file.split('.').pop() === 'json'
        })
        this.setState({ repoData: data})
        this.setState({ availableFiles: fileData})
        this.setState({ githubData: integration })
        this.setState({ showRepoLoading: null, showViewPrivateRepo: true});
        resolve(data)
      })
      .catch(() =>{
        this.setState({showRepoLoading: false})
        reject()
      });
    })
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
        let self = this
        let data = new FormData()

        data.append('file', acceptedFiles[0])
        this.setState({
            cloudFormationTemplate: null
        })
        axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/upload/template`, data).then(res => {
            self.setState({
                cloudFormationTemplate: JSON.stringify(res.data, null, 4)
            })
        }).catch(err => {
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
            this.setState({ loading: false })
        })
    }

    handlesDeleteLandscapeClick = (landscape, event) => {
        event.preventDefault()
        const { router } = this.context
        const { deleteLandscape, refetch } = this.props
        const { showDeleteDialog } = this.state

        this.setState({ showDeleteDialog: !showDeleteDialog })
        deleteLandscape({
            variables: { landscapeToDelete }
        }).then(({ data }) => {
            router.push({ pathname: `/landscapes` })
            return refetch()
        }).catch((error) => {
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
