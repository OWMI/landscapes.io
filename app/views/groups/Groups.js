import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit, IoLoadC, IoIosPlusEmpty, IoSearch, IoArrowUpC, IoArrowDownC, IoAndroidMenu, IoIosGridView } from 'react-icons/lib/io'
import { Row, Col } from 'react-flexbox-grid'
import { sortBy, orderBy } from 'lodash'

import { Paper, FlatButton, TextField, Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn  } from 'material-ui'

import { Loader } from '../../components'
import { auth } from '../../services/auth'
import defaultImage from '../../style/empty-group.png'
import '../landscapes/landscapes.style.scss'
import materialTheme from '../../style/custom-theme.js';
import { Timer } from '../../views/'

class Groups extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showCards: true,
        items: [],
        order: 'asc'
    }

    componentDidMount() {
        const { enterGroups } = this.props
        enterGroups()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveGroups } = this.props
        leaveGroups()
    }
    componentWillReceiveProps(nextProps) {
      const { loading, groups, users } = nextProps
      let stateGroups = []
      const user = auth.getUserInfo();
      if(user.role !== 'admin'){
        if(groups){
          groups.find(group => {
            group.users.forEach(usr => {
              if(usr.userId === user._id){
                stateGroups.push(group)
              }
            })
          })
        }
      }
      else if( user.role === 'admin'){
        stateGroups = groups;
      }
      if(users){
        var currentUser = users.find(usr => {
          return user._id === usr._id});
      }
      if(currentUser && currentUser.profile){
        var userProfile = JSON.parse(currentUser.profile);
        this.setState({showCards: userProfile.preferences.showGroupCards})
      }

      this.setState({items: stateGroups || [], groups: stateGroups, currentUser: currentUser || {}})

    }
    componentWillMount() {
      const { loading, groups, users } = this.props
      let stateGroups = []
      const user = auth.getUserInfo();
      if(user.role !== 'admin'){
        if(groups){
          groups.find(group => {
            group.users.forEach(usr => {
              if(usr.userId === user._id){
                stateGroups.push(group)
              }
            })
          })
        }
      }
      else if( user.role === 'admin'){
        stateGroups = groups;
      }
      if(users){
        var currentUser = users.find(usr => {
          return user._id === usr._id});
      }
      if(currentUser && currentUser.profile){
        var userProfile = JSON.parse(currentUser.profile);
        this.setState({showCards: userProfile.preferences.showGroupCards})
      }
      this.setState({items: stateGroups || [], groups: stateGroups, currentUser: currentUser || {}})

    }


    render() {
        const { animated, viewEntersAnim, showCards, items } = this.state
        const { loading, groupsByUser, groups } = this.props

        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <Timer time={auth.getUserInfo().expires}/>

                <Row style={{justifyContent: 'space-between', width: '100%'}}>
                <a  onClick={(event) => {
                  event.preventDefault()
                  var currentUser = this.state.currentUser
                  var userProfile = {}
                  if(currentUser.profile){
                    userProfile = JSON.parse(currentUser.profile);
                  }
                  else{
                    userProfile['preferences'] = {}
                  }
                  userProfile['preferences']['showGroupCards'] = !showCards;
                  currentUser.profile = JSON.stringify(userProfile)
                  delete currentUser.__typename
                  this.props.EditUserWithMutation({
                      variables: { user: currentUser }
                   }).then(() =>{
                     this.setState({showCards: !showCards})
                   })
                }}
                  style={{ fontSize: '20px', cursor: 'pointer' }}>Groups
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
                    <p style={{ fontSize: '18px', cursor: 'pointer' }}><IoIosPlusEmpty size={25}/>Add Group</p>
                </a>
              </Row>

                {
                  showCards
                  ?
                  <ul>
                  {
                      this.state.items.map((group, i) =>

                      <Paper key={i} className={cx({ 'landscape-card': true })} style={{backgroundColor: materialTheme.palette.primary3Color}} zDepth={3} rounded={false} onClick={this.handlesGroupClick.bind(this, group)}>
                              {/* header */}
                              <Row start='xs' middle='xs' style={{ padding: '20px 0px' }}>
                                  <Col xs={8}>
                                      <img id='landscapeIcon' src={group.imageUri || defaultImage} style={{width:85}}/>
                                  </Col>
                                  <Col xs={4}>
                                      <FlatButton id='landscape-edit' onTouchTap={this.handlesEditGroupClick.bind(this, group)}
                                          label='Edit' labelStyle={{ fontSize: '10px' }} icon={<IoEdit/>}/>
                                        <div style={{height:35}}></div>
                                  </Col>
                              </Row>
                              <Row style={{ margin: '0px 20px', height: '95px' }}>
                                  <div id='landscape-title'>{group.name}</div>
                                  {
                                    group.description.length > 120
                                      ?
                                      <div id='landscape-description'>{group.description.substr(0, 120) + '...'}</div>
                                      :
                                      <div id='landscape-description'>{group.description}</div>
                                  }
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
                              <TableHeaderColumn><Row onClick={this.handlesClickDescription} style={{cursor: 'pointer'}}>Description
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
                    <TableBody  displayRowCheckbox={false}
                                deselectOnClickaway={false}
                                showRowHover={true}
                                stripedRows={false}>
                      {
                        items.map((group, i) =>
                          <TableRow key={i} onTouchTap={this.handlesGroupClick.bind(this, group)}>
                            <TableRowColumn style={{width:100}}><img id='landscapeIcon' src={group.imageUri || defaultImage} style={{height:35}}/> </TableRowColumn>
                            <TableRowColumn>{group.name}</TableRowColumn>
                            <TableRowColumn>{
                              group.description.length > 50
                                ?
                                <div id='landscape-description'>{group.description.substr(0, 50) + '...'}</div>
                                :
                                <div id='landscape-description'>{group.description}</div>
                            }</TableRowColumn>
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
      var updatedList = this.state.groups;
      updatedList = updatedList.filter(function(item){
        return (item.name.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1)
          ;
      });
      this.setState({items: updatedList});
    }

    handlesCreateGroupClick = event => {
        const { router } = this.context
        router.push({ pathname: '/groups/create' })
    }

    handlesListChange = event => {

    }
    handlesClickName = event => {
        this.setState({orderBy: 'name'});
        if(this.state.order === 'asc'){
          this.setState({order: 'desc'})
        }
        else{
          this.setState({order: 'asc'})
        }
        var sorted = orderBy(this.state.items, 'name', this.state.order);
        this.setState({items: sorted})
    }
    handlesClickDescription= event => {
        this.setState({orderBy: 'description'});
        if(this.state.order === 'asc'){
          this.setState({order: 'desc'})
        }
        else{
          this.setState({order: 'asc'})
        }
        var sorted = orderBy(this.state.items, 'description', this.state.order);
        this.setState({items: sorted})
    }

    handlesEditGroupClick = (group, event) => {
        const { router } = this.context
        router.push({ pathname: '/groups/edit/' + group._id })
    }

    handlesGroupClick = (group, event) => {
        const { router } = this.context
        router.push({ pathname: '/groups/' + group._id })
    }
}

Groups.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterGroups: PropTypes.func.isRequired,
    leaveGroups: PropTypes.func.isRequired,
    refetchGroupsByUser: PropTypes.func.isRequired
}

Groups.contextTypes = {
    router: PropTypes.object
}

export default Groups
