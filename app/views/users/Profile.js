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

import Slider from 'material-ui/Slider';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import FlatButton from 'material-ui/FlatButton';
import defaultImage from '../../style/empty.png'
import defaultGroupImage from '../../style/empty-group.png'
import { auth } from '../../services/auth'

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    overflowY: 'auto'
  },
};

class Profile extends Component {

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
        currentUser = users.find(ls => { return ls._id === auth.getUserInfo()._id })
        console.log('CURRENT USER', currentUser)
        if(!currentUser.imageUri){
          currentUser.imageUri = defaultImage
        }
        this.setState({currentUser: currentUser})
      }
      if(groups){
        groups.find(group => {
            if(group.users){
              group.users.map(user => {
                if(user.userId === auth.getUserInfo()._id){
                  if(!group.imageUri){
                    group.imageUri = defaultGroupImage
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
        currentUser = users.find(ls => { return ls._id === auth.getUserInfo()._id })
        console.log('CURRENT USER', currentUser)
        if(!currentUser.imageUri){
          // currentUser.imageUri = defaultImage
        }
        this.setState({currentUser: currentUser})
      }
      if(groups){
        groups.find(group => {
            if(group.users){
              group.users.map(user => {
                if(user.userId === auth.getUserInfo()._id){
                  if(!group.imageUri){
                    group.imageUri = defaultGroupImage
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

            console.log('this.state.currentUser', this.state.currentUser)

            if (loading) {
                return (
                    <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                        <Loader/>
                    </div>
                )
            }

            return (
              <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                  <h4><strong>User:</strong> {this.state.currentUser.firstName} {this.state.currentUser.lastName}</h4><br/>
                    <div style={styles.root}>

                    <Card style={{padding:20}}>
                    <CardHeader
                      title={this.state.currentUser.firstName + ' ' +  this.state.currentUser.lastName}
                      subtitle={this.state.currentUser.email}
                      avatar={this.state.currentUser.imageUri}
                    />
                    <CardActions>

                    <GridList
                      cols={1}
                      cellHeight='auto'
                      style={styles.gridList}
                    >
                        <GridTile key='username'>
                        <p>Username:  {this.state.currentUser.username}</p>
                      </GridTile>
                        <GridTile key='Role'>
                        <p>Role:  {this.state.currentUser.role}</p>
                      </GridTile>
                      <GridTile>
                          <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
                              selectable={false} multiSelectable={false}
                              onRowSelection={this.handleOnRowSelection}>
                                <TableHeader displaySelectAll={false} adjustForCheckbox={false}
                                  enableSelectAll={false} >
                                  <TableRow>
                                    <TableHeaderColumn colSpan="4" tooltip="Groups" style={{textAlign: 'center', fontSize:18}}>
                                      Groups
                                    </TableHeaderColumn>
                                  </TableRow>
                                  <TableRow>
                                    <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Description">Description</TableHeaderColumn>
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
                                      <TableRowColumn><FlatButton onClick={() => { this.handleOnClick(row._id) }} label="View"/></TableRowColumn>
                                    </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter
                                  adjustForCheckbox={false}
                                >
                                </TableFooter>
                              </Table>
                      </GridTile>
                    {/*  <GridTile>
                      <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
                          selectable={false} multiSelectable={false}
                          onRowSelection={this.handleOnRowSelection}>
                            <TableHeader displaySelectAll={false} adjustForCheckbox={false}
                              enableSelectAll={false} >
                                  <TableRow>
                                    <TableHeaderColumn colSpan="3" tooltip="Users" style={{textAlign: 'center', fontSize:18}}>
                                      Users
                                    </TableHeaderColumn>
                                  </TableRow>
                                  <TableRow>
                                    <TableHeaderColumn tooltip="Email">Email</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                    <TableHeaderColumn tooltip="Role">Role</TableHeaderColumn>
                                  </TableRow>
                                </TableHeader>
                                <TableBody displayRowCheckbox={false} deselectOnClickaway={this.state.deselectOnClickaway}
                                  showRowHover={this.state.showRowHover} stripedRows={false}>
                                  {this.state.groupUsers.map( (row, index) => (
                                    <TableRow key={row._id} >
                                      <TableRowColumn>{row.email}</TableRowColumn>
                                      <TableRowColumn>{row.firstName} {row.lastName}</TableRowColumn>
                                      <TableRowColumn>{row.role}</TableRowColumn>
                                    </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter
                                  adjustForCheckbox={false}
                                >
                                </TableFooter>
                              </Table>
                      </GridTile>*/}
                    </GridList>
                    </CardActions>

                    </Card>
                    </div>
              </div>
            )
        }

        handlesEditClick = event => {
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

Profile.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterUsers: PropTypes.func.isRequired,
    leaveUsers: PropTypes.func.isRequired
}

Profile.contextTypes = {
    router: PropTypes.object
}

export default Profile
