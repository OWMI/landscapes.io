import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import lodash from 'lodash'
import { Card, CardHeader, CardText, MenuItem, RaisedButton, SelectField, TextField, Toggle, FlatButton, Checkbox } from 'material-ui'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import './tags.style.scss'
import { Loader } from '../../components'
import { auth } from '../../services/auth'

class CreateTag extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        loading: false,
        errorMessage: false,
        message: '',
        selectedGroupRows: []
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

    componentWillMount() {

    }
    componentWillReceiveProps(nextProps){

    }

    render() {

        const { animated, viewEntersAnim } = this.state
        const { loading, tags } = this.props

        if (loading || this.state.loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <Row center='xs' middle='xs'>
                    <Col xs={6} lg={9} className={cx( { 'create-tag': true } )}>
                        <Row middle='xs'>
                            <Col xs={4} style={{ textAlign: 'left' }}>
                                <h4>New Tag</h4>
                            </Col>
                            <Col xs={8}>
                                <RaisedButton label='Save' onClick={this.handlesCreateClick}
                                    style={{ float: 'right', margin: '30px 0px' }}
                                    labelStyle={{ fontSize: '11px' }}/>
                            </Col>
                        </Row>
                        <Card>
                            {
                              this.state.errorMessage
                              ?
                              <p style={{color: 'red'}}>{this.state.message}</p>
                              :
                              null
                            }

                            <TextField id='key' ref='key'  floatingLabelText='Key' style={{marginRight: 10, marginLeft: 10}} fullWidth={true}/>
                            <TextField id='defaultValue' ref='defaultValue' floatingLabelText='Default Value' style={{marginRight: 10, marginLeft: 10}} fullWidth={true}/>

                            <Checkbox id='isRequired' onCheck={this.handlesIsRequiredChange} label="Required" style={{marginBottom: 20, marginTop: 20, width: 20}} />
                            <div style={{height:20}}></div>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }

    handlesIsRequiredChange = (event, isChecked) => {
        this.setState({
            isRequired: isChecked
        })
    }


    handlesCreateClick = event => {
        event.preventDefault()
        const { mutate } = this.props
        const { selectedRows } = this.state
        const { router } = this.context

        let tagToCreate = {}

        // map all fields to tagToCreate
        for (let key in this.refs) {
            if (key === 'rejectUnauthorizedSsl') {
                  tagToCreate[key] = this.refs[key].isToggled()
            } else {
                tagToCreate[key] = this.refs[key].getValue()
            }
        }
        tagToCreate.isGlobal = true;

        if (!this.state.isRequired){
          tagToCreate.isRequired = false;
        }
        else{
          tagToCreate.isRequired = true;
        }
        // attach derived fields
        if(!tagToCreate.key){
          this.setState({errorMessage: true, message: 'Key is required.'})
          return
        }
        else{
          this.setState({loading: true})

          mutate({
              variables: { tag: tagToCreate }
           }).then(({ data }) => {
             this.props.refetchTags({}).then(({ data }) =>{
                 this.setState({
                   successOpen: true,
                   loading: false
                 })
                   router.push({ pathname: '/tags' })
             }).catch((error) => {
               this.setState({loading: false})
             })
          }).catch(error => {
          })
        }
    }
}

CreateTag.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired,
    refetchTags: PropTypes.func,
    mutate: PropTypes.func.isRequired,
}

CreateTag.contextTypes = {
    router: PropTypes.object
}

export default CreateTag
