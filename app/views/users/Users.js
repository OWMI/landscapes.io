import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import { IoEdit, IoLoadC, IoIosPlusEmpty, IoSearch, IoArrowUpC, IoArrowDownC, IoIosGridView, IoAndroidMenu} from 'react-icons/lib/io'
import { Row, Col } from 'react-flexbox-grid'
import { sortBy, orderBy } from 'lodash'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper, FlatButton, TextField, Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui'

import '../landscapes/landscapes.style.scss'
import defaultImage from '../../style/empty.png'
import materialTheme from '../../style/custom-theme.js';
import { auth } from '../../services/auth'
import { Loader } from '../../components'

class Users extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showCards: true,
        items: [],
        orderBy: '',
        order: 'asc'
    }

    componentDidMount() {
        const { enterUsers } = this.props
        enterUsers()
    }

    componentWillReceiveProps(nextProps){
      const {users} = nextProps;
      const {currentUser} = this.state;
      const user = auth.getUserInfo();

      if(users){
        for(var i = 0; i< users.length; i++){ //TODO: MUST BE REAL IMAGE
          if(!users[i].imageUri){
            users[i].imageUri = defaultImage
          }
        }
        let currentUser = users.find(usr => {
            return user._id === usr._id})

        if(currentUser && currentUser.profile){
          var userProfile = JSON.parse(currentUser.profile);
          this.setState({showCards: userProfile.preferences.showUserCards})
        }

        this.setState({users: users, items: users, currentUser: currentUser || {}});
      }
    }
    componentWillMount(){
      const { users } = this.props;
      const { currentUser } = this.state;
      const user = auth.getUserInfo();

      if(users){
        for(var i = 0; i< users.length; i++){ //TODO: MUST BE REAL IMAGE
          if(!users[i].imageUri){
            users[i].imageUri = defaultImage
          }
        }
        let currentUser = users.find(usr => {
            return user._id === usr._id})

        if(currentUser && currentUser.profile){
          var userProfile = JSON.parse(currentUser.profile);

          this.setState({showCards: userProfile.preferences.showUserCards})
        }

        this.setState({users: users, items: users, currentUser: currentUser || {}});
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
        const { animated, viewEntersAnim, showCards, order, orderBy } = this.state
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
                <a onClick={(event) => {
                  event.preventDefault()
                  var currentUser = this.state.currentUser
                  var userProfile = {}
                  if(currentUser.profile){
                    userProfile = JSON.parse(currentUser.profile);
                  }
                  else{
                    userProfile['preferences'] = {}
                  }
                  userProfile['preferences']['showUserCards'] = !showCards;
                  currentUser.profile = JSON.stringify(userProfile)
                  delete currentUser.__typename
                  this.props.EditUserWithMutation({
                      variables: { user: currentUser }
                   }).then(() =>{
                       this.setState({showCards: !showCards})
                   })
                }}
                  style={{ fontSize: '20px', cursor: 'pointer' }}>Users
                  {
                    showCards
                    ?
                    <IoAndroidMenu style={{fontSize: 30, marginLeft:8}} />
                    :
                    <IoIosGridView style={{fontSize: 30, marginLeft:8}}/>
                  }</a>
                <div className="filter-list" style={{marginTop:-5, marginBottom:10}}>
                  <IoSearch style={{fontSize:20, color:'gray', marginRight:5}} /><TextField type="text" hintText="Search" onChange={this.filterList}/>
                </div>
                <a onClick={this.handlesCreateGroupClick}>
                    <p style={{ fontSize: '18px', cursor: 'pointer' }}><IoIosPlusEmpty size={25}/>Add User</p>
                </a>
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
                        multiSelectable={false} >
                  <TableHeader
                    displaySelectAll={false}
                    adjustForCheckbox={false}
                    enableSelectAll={false}
                    style={{borderTop: '1px solid lightgray'}}>
                    <TableRow>
                      <TableHeaderColumn style={{width:100}}></TableHeaderColumn>
                      <TableHeaderColumn><Row onClick={this.handlesClickName} style={{cursor: 'pointer'}}>Name
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
                      <TableHeaderColumn><Row onClick={this.handlesClickUsername} style={{cursor: 'pointer'}}>Username
                      {
                        this.state.orderBy === 'username' && this.state.order === 'asc'
                        ?
                        <IoArrowUpC />
                        :
                        <Col>{
                            this.state.orderBy === 'username'
                            ?
                            <IoArrowDownC />
                            :
                            null
                          }</Col>}</Row>
                      </TableHeaderColumn>
                      <TableHeaderColumn><Row onClick={this.handlesClickEmail} style={{cursor: 'pointer'}}>Email
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
                      <TableHeaderColumn><Row onClick={this.handlesClickRole} style={{cursor: 'pointer'}}>Role
                      {
                        this.state.orderBy === 'role' && this.state.order === 'asc'
                        ?
                        <IoArrowUpC />
                        :
                        <Col>{
                            this.state.orderBy === 'role'
                            ?
                            <IoArrowDownC />
                            :
                            null
                          }</Col>}</Row>
                      </TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody  displayRowCheckbox={false}
                              deselectOnClickaway={false}
                              showRowHover={true}
                              stripedRows={false}>
                    {
                      this.state.items.map((user, i) =>
                        <TableRow key={i} onTouchTap={this.handlesGroupClick.bind(this, user)}>
                          <TableRowColumn style={{width:100}}><img id='landscapeIcon' src={user.imageUri || defaultImage} style={{height:35}}/> </TableRowColumn>
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
    handlesClickName = event => {
        this.setState({orderBy: 'name'});
        if(this.state.order === 'asc'){
          this.setState({order: 'desc'})
        }
        else{
          this.setState({order: 'asc'})
        }
        var sorted = orderBy(this.state.items, 'lastName', this.state.order);
        this.setState({items: sorted})
    }
    handlesClickUsername = event => {
        this.setState({orderBy: 'username'});
        if(this.state.order === 'asc'){
          this.setState({order: 'desc'})
        }
        else{
          this.setState({order: 'asc'})
        }
        var sorted = orderBy(this.state.items, 'username', this.state.order);
        this.setState({items: sorted})
    }
    handlesClickEmail = event => {
        this.setState({orderBy: 'email'});
        if(this.state.order === 'asc'){
          this.setState({order: 'desc'})
        }
        else{
          this.setState({order: 'asc'})
        }
        var sorted = orderBy(this.state.items, 'email', this.state.order);
        this.setState({items: sorted})
    }
    handlesClickRole = event => {
        this.setState({orderBy: 'role'});
        if(this.state.order === 'asc'){
          this.setState({order: 'desc'})
        }
        else{
          this.setState({order: 'asc'})
        }
        var sorted = orderBy(this.state.items, 'role', this.state.order);
        this.setState({items: sorted})
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
