
import cx from 'classnames'
import { IoEdit, IoLoadC, IoIosPlusEmpty, IoSearch } from 'react-icons/lib/io'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { Row, Col } from 'react-flexbox-grid'
import { Paper , CardHeader, CardActions, CardText, FlatButton, TextField } from 'material-ui'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import { Loader } from '../../components'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { auth } from '../../services/auth'
import defaultImage from '../../style/empty-group.png'

import '../landscapes/landscapes.style.scss'
import materialTheme from '../../style/custom-theme.js';

class Groups extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showCards: true,
        items: []
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

      this.setState({items: stateGroups, groups: stateGroups, currentUser: currentUser || {}})

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
      this.setState({items: stateGroups, groups: stateGroups, currentUser: currentUser || {}})

    }


    render() {
        const { animated, viewEntersAnim, showCards } = this.state
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
              <Row style={{justifyContent: 'space-between', width: '100%'}}>
                <a onClick={this.handlesCreateGroupClick}>
                    <p style={{ fontSize: '20px', cursor: 'pointer' }}><IoIosPlusEmpty size={30}/>Add Group</p>
                </a>
                <div className="filter-list" style={{marginTop:-5, marginBottom:10}}>
                  <IoSearch style={{fontSize:20, color:'gray', marginRight:5}} /><TextField type="text" hintText="Search" onChange={this.filterList}/>
                </div>
                <FlatButton
                  onClick={(event) => {
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
                  label={showCards ? 'Show List View' : 'Show Card View'}></FlatButton>
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
                      enableSelectAll={false}>
                      <TableRow>
                        <TableHeaderColumn></TableHeaderColumn>
                        <TableHeaderColumn>Name</TableHeaderColumn>
                        <TableHeaderColumn>Description</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody  displayRowCheckbox={false}
                                deselectOnClickaway={false}
                                showRowHover={true}
                                stripedRows={false}>
                      {
                        this.state.items.map((group, i) =>
                          <TableRow key={i} onTouchTap={this.handlesEditGroupClick.bind(this, group)}>
                            <TableRowColumn><img id='landscapeIcon' src={group.imageUri || defaultImage} style={{height:35}}/> </TableRowColumn>
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
