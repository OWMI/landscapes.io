
import cx from 'classnames'
import { Dialog, FlatButton } from 'material-ui'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit, IoAndroidClose, IoIosPlusEmpty } from 'react-icons/lib/io'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import { Loader } from '../../components'
// const confirm = Modal.confirm

class Accounts extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showDialog: false
    }

    componentDidMount() {
        const { enterLandscapes } = this.props
        enterLandscapes()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }
    componentWillMount(){
      this.setState({activeAccount: {}})
    }
    componentWillReceiveProps(){
      this.setState({activeAccount: {}})
    }

    render() {
        const { animated, viewEntersAnim } = this.state
        const { loading, accounts } = this.props

        const confirmActions = [
            <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
            <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteAccountClick}/>
        ]

        if (loading || this.state.loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>

                <a onClick={this.handlesCreateAccountClick}>
                    <p style={{ fontSize: '20px', cursor: 'pointer' }}><IoIosPlusEmpty size={30}/> Add Account </p>
                </a>

                <Table>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn>Account Name</TableHeaderColumn>
                            <TableHeaderColumn>Region</TableHeaderColumn>
                            <TableHeaderColumn>Date Created</TableHeaderColumn>
                            <TableHeaderColumn></TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {
                            accounts.map((account, index) => {
                                return (
                                    <TableRow key={`${index}`}>
                                        <TableRowColumn>{account.name}</TableRowColumn>
                                        <TableRowColumn>{account.region}</TableRowColumn>
                                        <TableRowColumn>{account.createdAt}</TableRowColumn>
                                        <TableRowColumn>
                                            <FlatButton onTouchTap={this.handlesEditAccountClick.bind(this, account)}>
                                                <IoEdit/>
                                            </FlatButton>
                                            <FlatButton onTouchTap={this.handlesDialogToggle.bind(this, account)}>
                                                <IoAndroidClose/>
                                            </FlatButton>
                                            <Dialog title='Delete Account' modal={false} open={this.state.showDialog}
                                                onRequestClose={this.handlesDialogToggle}
                                                actions={[
                                                    <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
                                                    <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteAccountClick}/>
                                                ]}>
                                                Are you sure you want to delete {this.state.activeAccount.name}?
                                            </Dialog>
                                        </TableRowColumn>
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                </Table>
            </div>
        )
    }

    handlesDialogToggle =  (account, event) => {
        this.setState({
            showDialog: !this.state.showDialog,
            activeAccount: account
        })
    }

    handlesCreateAccountClick = event => {
        const { router } = this.context
        router.push({ pathname: '/accounts/create' })
    }

    handlesEditAccountClick = (account, event) => {
        const { router } = this.context
        router.push({ pathname: '/accounts/update/' + account._id })
    }

    handlesDeleteAccountClick = (event) => {
        event.preventDefault()
        this.setState({
          loading: true
        })
        const { mutate } = this.props
        const { router } = this.context

        this.handlesDialogToggle()

        mutate({
            variables: { account: this.state.activeAccount }
         }).then(({ data }) => {
           this.props.refetchAccounts({}).then(({ data }) =>{
             this.setState({
               successOpen: true,
               loading: false
             })
             router.push({ pathname: '/accounts' })
           })
           .catch((error) => {
             this.setState({loading: false})
           })
        }).catch((error) => {
        })
    }
}

Accounts.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

Accounts.contextTypes = {
    router: PropTypes.object
}

export default Accounts
