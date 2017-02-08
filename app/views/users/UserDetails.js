import cx from 'classnames'
import { Loader } from '../../components'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'

import { Checkbox, RaisedButton} from 'material-ui'
import {GridList, GridTile} from 'material-ui/GridList';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import {Row, Col} from 'react-flexbox-grid'
import { IoEdit, IoAndroidClose, IoIosCloudUploadOutline } from 'react-icons/lib/io'

import Slider from 'material-ui/Slider';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import FlatButton from 'material-ui/FlatButton';
import defaultImage from '../../style/empty.png'
import defaultGroupImage from '../../style/empty-group.png'
import materialTheme from '../../style/custom-theme.js';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
  },
};

class UserDetails extends Component {

    state = {
        animated: true,
        viewEntersAnim: true
    }
    componentDidMount() {
        const { enterUsers } = this.props
        enterUsers()
    }

    // Necessary for case: routes from another state
    componentWillMount(){
      const { loading, users, landscapes, groups, params } = this.props
      let currentUser = {}
      let userGroups = []
      if(users){
        currentUser = users.find(ls => { return ls._id === params.id })
        if(!currentUser.imageUri){
          currentUser.imageUri = defaultImage
        }
        this.setState({currentUser: currentUser})
      }
      if(groups){
        groups.find(group => {
            if(group.users){
              group.users.map(user => {
                if(user.userId === params.id){
                  if(!group.imageUri){
                    group.imageUri = defaultGroupImage
                  }
                  if(user.isAdmin){
                    group.isGroupAdmin = 'Admin'
                  }
                  else{
                    group.isGroupAdmin = ''
                  }
                  userGroups.push(group)
                }
              })
            }
        })
      }
      this.setState({userGroups: userGroups})
    }

    // Necessary for case: hard refresh or route from no other state
    componentWillReceiveProps(nextProps){
      const { loading, users, landscapes, groups, params } = nextProps
      let currentUser = {}
      let userGroups = []
      if(users){
        currentUser = users.find(ls => { return ls._id === params.id })
        if(!currentUser.imageUri){
          currentUser.imageUri = defaultImage
        }
        this.setState({currentUser: currentUser})
      }
      if(groups){
        groups.find(group => {
            if(group.users){
              group.users.map(user => {
                if(user.userId === params.id){
                  if(!group.imageUri){
                    group.imageUri = defaultGroupImage
                  }
                  if(user.isAdmin){
                    group.isGroupAdmin = 'Admin'
                  }
                  else{
                    group.isGroupAdmin = ''
                  }
                  userGroups.push(group)
                }
              })
            }
        })
      }
      this.setState({userGroups: userGroups})
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveUsers } = this.props
        leaveUsers()
    }


        render() {

            let self = this
            const { animated, viewEntersAnim } = this.state
            const { loading, users, params } = this.props

            const formItemLayout = {
                labelCol: { span: 8 },
                wrapperCol: { span: 12 }
            }

            if (loading) {
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
                      <Row><h4><strong>User</strong></h4></Row>
                    </Col>
                    <Col xs={10}>
                        <RaisedButton label='Edit' onClick={this.handlesEditGroupClick}
                            style={{ float: 'right', marginBottom: '30px' }}
                            labelStyle={{ fontSize: '11px' }} icon={<IoEdit/>}/>
                    </Col>
                </Row>
                <div style={styles.root}>

                    <Card style={{padding:20}}>
                      <Row middle='xs'style={{marginBottom: 10}}>
                          <Col xs={1} style={{ textAlign: 'left' }}>
                              <img src={this.state.currentUser.imageUri} style={{width: 85}} />
                          </Col>
                          <Col xs={4} style={{ textAlign: 'left' }}>
                              <Row><h4>{this.state.currentUser.firstName + ' ' +  this.state.currentUser.lastName}</h4></Row>
                              <Row><h5>{this.state.currentUser.email}</h5></Row>

                          </Col>
                          <Col xs={7}>
                          </Col>
                      </Row>
                      <Col>
                        <h5>Username:  {this.state.currentUser.username}</h5>
                        <h5>Role:  {this.state.currentUser.role}</h5>
                      </Col>

                    <GridList
                      cols={1}
                      cellHeight='auto'
                      style={styles.gridList}
                    >
                      <Tabs tabItemContainerStyle={{backgroundColor: materialTheme.palette.primary2Color}}>
                        <Tab key="1" label="Groups">
                          <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
                              selectable={false} multiSelectable={false}
                              onRowSelection={this.handleOnRowSelection}>
                                <TableHeader displaySelectAll={false} adjustForCheckbox={false}
                                  enableSelectAll={false} >
                                  <TableRow>
                                    <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Description">Description</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="GroupAdmin">Admin?</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Button"></TableHeaderColumn>
                                  </TableRow>
                                </TableHeader>
                                <TableBody displayRowCheckbox={false}
                                  showRowHover={true} stripedRows={false}>
                                  {this.state.userGroups.map( (row, index) => (
                                    <TableRow key={row._id} onClick={this.handleOnClick}>
                                    <TableRowColumn><img src={row.imageUri} style={{width: 40, borderRadius: 50}} /></TableRowColumn>
                                      <TableRowColumn>{row.name}</TableRowColumn>
                                      <TableRowColumn>{row.description}</TableRowColumn>
                                      <TableRowColumn>{row.isGroupAdmin}</TableRowColumn>
                                      <TableRowColumn><FlatButton onClick={() => { this.handleOnClick(row._id) }} label="View"/></TableRowColumn>
                                    </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter
                                  adjustForCheckbox={false}
                                >
                                </TableFooter>
                              </Table>
                        </Tab>
                      </Tabs>
                    </GridList>

                    </Card>
                    </div>
              </div>
            )
        }

        handlesEditGroupClick = event => {
          const { router } = this.context

          router.push({ pathname: `/users/edit/${this.state.currentUser._id}` })

        }
        handleOnClick = (id) => {
          const { router } = this.context

          router.push({ pathname: `/groups/${id}` })

        }

        closeError = (event) => {
            event.preventDefault()
            const { resetError } = this.props
            resetError()
        }
    }

UserDetails.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterUsers: PropTypes.func.isRequired,
    leaveUsers: PropTypes.func.isRequired
}

UserDetails.contextTypes = {
    router: PropTypes.object
}

export default UserDetails
