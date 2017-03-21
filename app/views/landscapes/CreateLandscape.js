import React, { Component, PropTypes } from 'react'
import axios from 'axios'
import cx from 'classnames'
import { Row, Col } from 'react-flexbox-grid'
import Dropzone from 'react-dropzone'
import { IoClose, IoCube } from 'react-icons/lib/io'
import { MdClear } from 'react-icons/lib/md/clear'
import Card from 'material-ui/Card'
import shallowCompare from 'react-addons-shallow-compare'
import UploadIcon from 'material-ui/svg-icons/file/file-upload'
import { Paper, RaisedButton, TextField } from 'material-ui'
import Snackbar from 'material-ui/Snackbar'
import AvatarCropper from "react-avatar-cropper"
import defaultLandscapeImage from '../../style/AWS.png'
import SelectField from 'material-ui/SelectField'
import { Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { FlatButton, IconMenu, IconButton, MenuItem, CardHeader } from 'material-ui'
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
        addedDocuments: [],
        showAddDocument: false
    }

    componentDidMount() {
        const { enterLandscapes } = this.props
        enterLandscapes()
    }

    componentWillReceiveProps(nextProps) {
        const { groupsByUser, integrations } = nextProps
        this.setState({integrations: integrations || []})
        let userGroups = []
        let isGroupAdmin = false
        let formationAddOptions = [
          {
            label: 'Private Repo',
            type: 'privateRepo'
          },
          {
            label: 'Local File',
            type: 'local'

          }
          // ,
          // {
          //   label: 'Public Repo',
          //   type: 'public'
          // }
        ]

        if (auth.getUserInfo().isGroupAdmin) {
            isGroupAdmin = true
        }

        if (auth.getUserInfo().groups) {
            userGroups = lodash.filter(auth.getUserInfo().groups, (group) => {
                return group.isAdmin === true
            })
        }

        let index = null
        let userAdminGroups = []

        if (groupsByUser) {
            userGroups.forEach(group => {
                index = groupsByUser.map(function(o) {
                    return o._id
                }).indexOf(group.groupId)
                userAdminGroups.push(groupsByUser[index])
            })
        }

        this.setState({ userAdminGroups, isGroupAdmin, settings: false, formationAddOptions })
    }

    componentWillMount(){
      const { groupsByUser, integrations } = this.props
      this.setState({integrations: integrations || []})
      let userGroups = []
        let isGroupAdmin = false

        let formationAddOptions = [
          {
            label: 'Private Repo',
            type: 'privateRepo'
          },
          {
            label: 'Local File',
            type: 'local'

          },
          {
            label: 'Public Repo',
            type: 'public'
          }
        ]

        if (auth.getUserInfo().isGroupAdmin) {
            isGroupAdmin = true
        }

        if (auth.getUserInfo().groups) {
            userGroups = lodash.filter(auth.getUserInfo().groups, group => {
                return group.isAdmin === true
            })
        }

        let index = null
        let userAdminGroups = []

        if (groupsByUser) {
            userGroups.forEach(group => {
                index = groupsByUser.map(o => {
                    return o._id
                }).indexOf(group.groupId)
                userAdminGroups.push(groupsByUser[index])
            })
        }

        this.setState({ userAdminGroups, isGroupAdmin, settings: false, formationAddOptions })
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }

    render() {

        const { animated, viewEntersAnim, isGroupAdmin, userAdminGroups, formationAddOptions } = this.state
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
          <Col xs={12} lg={12} className={cx( { 'create-landscape': true } )}>
                    <Row middle='xs'>
                        <Col xs={4} style={{ textAlign: 'left' }}>
                            <h4>New Landscape</h4>
                        </Col>
                        <Col xs={8}>
                          <Row>
                            <Col xs={4}>

                            </Col>
                            <Col xs={4}>
                            </Col>
                            <Col xs={4}>
                              <Row>
                                <RaisedButton label='Save' onClick={this.handlesCreateClick}
                                    style={{ float: 'right', margin: '30px 0px' }}
                                    labelStyle={{ fontSize: '11px' }}/>
                                <RaisedButton label='Cancel' primary={true} onClick={() => {
                                    const {router} = this.context
                                    router.push(`/landscapes`)
                                }}
                                  style={{ float: 'right', margin: '30px 0px', marginLeft:10 }}
                                  labelStyle={{ fontSize: '11px' }}/>
                              </Row>
                            </Col>
                          </Row>
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
                      <Col>
                        <Row style={{minHeight:350, width: '100%'}}>
                          <Col style={{paddingLeft: 10, paddingRight: 10,  width:'65%'}}>
                            <TextField id='name' ref='name' maxLength={64} floatingLabelText='Name' className={cx( { 'two-field-row': true } )}/>
                            <TextField id='version' ref='version'  floatingLabelText='Version' className={cx( { 'two-field-row': true } )}/>

                            <TextField id='description' ref='description' multiLine={true} rows={1} rowsMax={4}
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
                                      <img src={this.state.croppedImg || this.state.imageUri || defaultLandscapeImage}/>
                                  </div>
                                  {this.state.cropperOpen &&
                                    <AvatarCropper onRequestHide={this.handleRequestHide} cropperOpen={this.state.cropperOpen} onCrop={this.handleCrop} image={this.state.img} width={400} height={400}/>
                                  }
                              </Dropzone>
                            </Row>
                          </Col>
                        </Row>
                        <Card>
                          <Row center='xs' middle='xs' style={{marginBottom: 10, marginTop:10}}>
                              <Col xs={2}>
                                <h4 style={{float:'left', marginLeft: 10, marginTop:10}}>Documents</h4>
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
                                                    let documentArray = this.state.addedDocuments
                                                    documentArray.splice(index, 1)
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
                                  <Row middle='xs' style={{marginBottom: 10, marginLeft: 10,  width:'100%'}}>
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


                      </Col>
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
                        <Row style={{borderTop: '1px solid lightgray', backgroundColor:'#F4F4F4', marginLeft:2, marginRight:2}}>
                          <Dropzone id='cloudFormationTemplate' onDrop={this.handlesTemplateClick} ref={(node) => { this.dropzone = node; }} multiple={false}
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
                        </Row>
                      </Card>
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
      if(option.type === 'privateRepo'){
        var privateRepoIntegration = this.state.integrations.find(integration => {return integration.type === 'github'})
        console.log('privateRepoIntegration', privateRepoIntegration)
        if(!privateRepoIntegration){
          this.setState({cloudErrorMessage: "Currently no private repositories are set up."})
        }
        else{
          this.setState({showRepoLoading: true});
          this.getRepoData(privateRepoIntegration).then((data)=>{
            this.setState({showRepoLoading: false, showViewPrivateRepo:true});
          })
        }
      }
    }

    setFile = (file, bind) => {
      let self = this
      axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/getFile`, {file: './_github/' + file}).then(res => {
        console.log('RES', res)
        self.setState({
            cloudFormationTemplate: res.data
        })
        return res
      }).catch(err => {
        console.log('ERROR ----'. err)
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
                console.log('res', res)
                var data = {
                  location: res.data.location
                }
                axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/repo/files`, data).then(res => {
                  console.log('RETURNED ----', res)
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
        console.log('data', data)
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

    handleOnRequestChange = () =>{
      this.setState({settings: !this.state.settings})
    }
    getInitialState = () => {
        return {
          cropperOpen: false,
          img: null,
          croppedImg: defaultImage
        }
      }
      handleFileChange = (dataURI) => {
        this.setState({
          img: dataURI,
          croppedImg: this.state.croppedImg,
          cropperOpen: true
        })
      }
      handleCrop = (dataURI) => {
        this.setState({
          cropperOpen: false,
          img: null,
          croppedImg: dataURI
        })
      }
      handleRequestHide = () =>{
        this.setState({
          cropperOpen: false
        })
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
      let data = {
        url: this.state.docUrl,
        name: this.state.docName,
        type: this.state.docType
      }
      let array = this.state.addedDocuments
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
        console.log('acceptedFiles', acceptedFiles)
        let self = this
        let data = new FormData()

        data.append('file', acceptedFiles[0])

        axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/upload/template`, data).then(res => {
            self.setState({
                cloudFormationTemplate: JSON.stringify(res.data, null, 4)
            })
        }).catch(err => console.error(err))
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
        landscapeToCreate.documents = this.state.addedDocuments
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
             for (let i = 0; i < selectedRows.length; i++) {
               if(!userAdminGroups[selectedRows[i]].accounts){
                 userAdminGroups[selectedRows[i]].accounts = []
               }
                 userAdminGroups[selectedRows[i]].landscapes.push(data.createLandscape._id)
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
