import cx from 'classnames'
import { IoEdit, IoLoadC, IoIosPlusEmpty, IoSearch } from 'react-icons/lib/io'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { Loader } from '../../components'
import { Row, Col } from 'react-flexbox-grid'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import defaultImage from '../../style/empty.png'
import { Paper , CardHeader, CardActions, CardText, FlatButton, TextField } from 'material-ui'

import '../landscapes/landscapes.style.scss'
import materialTheme from '../../style/custom-theme.js';


class Users extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showCards: true,
        items: []

    }

    componentDidMount() {
        const { enterUsers } = this.props
        enterUsers()
    }

    componentWillReceiveProps(nextProps){
      const {users} = nextProps;
      if(users){
        for(var i = 0; i< users.length; i++){ //TODO: MUST BE REAL IMAGE
          if(!users[i].imageUri){
            users[i].imageUri = defaultImage
          }
        }
        this.setState({users: users, items: users});
      }
    }
    componentWillMount(){
      const { users } = this.props;
      if(users){
        for(var i = 0; i< users.length; i++){ //TODO: MUST BE REAL IMAGE
          if(!users[i].imageUri){
            users[i].imageUri = defaultImage
          }
        }
        this.setState({users: users, items: users});
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveUsers } = this.props
        leaveUsers()
    }

    render() {
        const { animated, viewEntersAnim, showCards } = this.state
        const { loading } = this.props


        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
              <Row style={{justifyContent: 'space-between', width: '100%'}}>
                <a onClick={this.handlesCreateGroupClick}>
                    <p style={{ fontSize: '20px', cursor: 'pointer' }}><IoIosPlusEmpty size={30}/>Add User</p>
                </a>
                <div className="filter-list" style={{marginTop:-5, marginBottom:10}}>
                  <IoSearch style={{fontSize:20, color:'gray', marginRight:5}} /><TextField type="text" hintText="Search" onChange={this.filterList}/>
                </div>
                <FlatButton
                  onClick={() => this.setState({showCards: !showCards})}
                  label={showCards ? 'Show List View' : 'Show Card View'}></FlatButton>
              </Row>
              {
                showCards
                ?
                <ul>
                {
                    this.state.items.map((user, i) =>
                    <Paper key={i} className={cx({ 'landscape-card': true })} style={{backgroundColor: materialTheme.palette.primary2Color}} zDepth={3} rounded={false} onClick={this.handlesGroupClick.bind(this, user)}>
                            {/* header */}
                            <Row start='xs' middle='xs' style={{ padding: '20px 0px' }}>
                                <Col xs={8}>
                                    <img id='landscapeIcon' src={user.imageUri} style={{width:85}}/>
                                </Col>
                                <Col xs={4}>
                                    <FlatButton id='landscape-edit' onTouchTap={this.handlesEditGroupClick.bind(this, user)}
                                        label='Edit' labelStyle={{ fontSize: '10px' }} icon={<IoEdit/>}/>
                                      <div style={{height:35}}></div>
                                </Col>
                            </Row>
                            <Row style={{ margin: '0px 20px', height: '95px' }}>
                                <div id='landscape-title'>{user.lastName}, {user.firstName}</div>
                                    <div id='landscape-description'>
                                      Username:  {user.username}<br/>
                                      Email: {user.email}<br/>
                                      Role:  {user.role}
                                    </div>
                            </Row>
                    </Paper>)
                }
                </ul>
                :
                <Table fixedHeader={true} fixedFooter={false} selectable={true}
                        multiSelectable={false}>
                  <TableHeader
                    displaySelectAll={false}
                    adjustForCheckbox={false}
                    enableSelectAll={false}>
                    <TableRow>
                      <TableHeaderColumn></TableHeaderColumn>
                      <TableHeaderColumn>Name</TableHeaderColumn>
                      <TableHeaderColumn>Username</TableHeaderColumn>
                      <TableHeaderColumn>Email</TableHeaderColumn>
                      <TableHeaderColumn>Role</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody  displayRowCheckbox={false}
                              deselectOnClickaway={false}
                              showRowHover={true}
                              stripedRows={false}>
                    {
                      this.state.items.map((user, i) =>
                        <TableRow key={i} onTouchTap={this.handlesGroupClick.bind(this, user)}>
                          <TableRowColumn><img id='landscapeIcon' src={user.imageUri || defaultImage} style={{height:35}}/> </TableRowColumn>
                          <TableRowColumn>{user.lastName}, {user.firstName} </TableRowColumn>
                          <TableRowColumn>{user.username}</TableRowColumn>
                          <TableRowColumn>{user.email}</TableRowColumn>
                          <TableRowColumn>{user.role}</TableRowColumn>
                        </TableRow>
                      )
                    }
                  </TableBody>
                </Table>
              }
            </div>
        )
    }
    filterList = (event) =>{
      var updatedList = this.state.users;
      updatedList = updatedList.filter(function(item){
        console.log('item', item)
        return (item.firstName.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1) ||
          (item.lastName.toLowerCase().search(
            event.target.value.toLowerCase()) !== -1) ||
            (item.username.toLowerCase().search(
              event.target.value.toLowerCase()) !== -1)
          ;
      });
      this.setState({items: updatedList});
    }
    handlesCreateGroupClick = event => {
        const { router } = this.context
        router.push({ pathname: '/users/create' })
    }

    handlesEditGroupClick = (user, event) => {
        const { router } = this.context
        router.push({ pathname: '/users/edit/' + user._id })
    }

    handlesGroupClick = (user, event) => {
        const { router } = this.context
        router.push({ pathname: '/users/' + user._id })
    }
}

Users.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterUsers: PropTypes.func.isRequired,
    leaveUsers: PropTypes.func.isRequired
  }

Users.contextTypes = {
    router: PropTypes.object
}

export default Users
