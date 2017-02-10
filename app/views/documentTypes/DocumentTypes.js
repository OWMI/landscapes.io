
import cx from 'classnames'
import { Dialog, FlatButton } from 'material-ui'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit, IoAndroidClose, IoIosPlusEmpty } from 'react-icons/lib/io'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import { Loader } from '../../components'
// const confirm = Modal.confirm

class DocumentTypes extends Component {

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

    render() {
        const { animated, viewEntersAnim } = this.state
        const { loading, accounts } = this.props

        const confirmActions = [
            <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
            <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteAccountClick}/>
        ]

        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>

                <a onClick={this.handlesCreateAccountClick}>
                    <p style={{ fontSize: '20px', cursor: 'pointer' }}><IoIosPlusEmpty size={30}/> Add Document Type </p>
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
                                            <FlatButton onTouchTap={this.handlesDialogToggle}>
                                                <IoAndroidClose/>
                                            </FlatButton>
                                            <Dialog title='Delete Account' modal={false} open={this.state.showDialog}
                                                onRequestClose={this.handlesDialogToggle}
                                                actions={[
                                                    <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
                                                    <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteAccountClick.bind(this, account)}/>
                                                ]}>
                                                Are you sure you want to delete {account.name}?
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

    handlesDialogToggle = event => {
        this.setState({
            showDialog: !this.state.showDialog
        })
    }

    handlesCreateAccountClick = event => {
        const { router } = this.context
        router.push({ pathname: '/documentTypes/create' })
    }

    handlesEditAccountClick = (account, event) => {
        const { router } = this.context
        router.push({ pathname: '/documentTypes/update/' + account._id })
    }

    handlesDeleteAccountClick = (accountToDelete, event) => {
        event.preventDefault()

        const { mutate } = this.props
        const { router } = this.context

        this.handlesDialogToggle()

        mutate({
            variables: { account: accountToDelete }
         }).then(({ data }) => {
            router.push({ pathname: '/documentTypes' })
        }).catch((error) => {
        })
    }
}

DocumentTypes.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

DocumentTypes.contextTypes = {
    router: PropTypes.object
}

export default DocumentTypes
