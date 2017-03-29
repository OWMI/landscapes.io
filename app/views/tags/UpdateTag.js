import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import { Card, RaisedButton, TextField, Toggle, Checkbox } from 'material-ui'

import materialTheme from '../../style/custom-theme.js'
import './tags.style.scss'
import { Loader } from '../../components'

class UpdateTag extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        loading: false
    }

    componentDidMount() {
        const { enterLandscapes, tags, params } = this.props
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
      const { loading, tags, params } = this.props
      let currentTag = {}

      if(tags){
        currentTag = tags.find(ac => { return ac._id === params.id })
        this.setState({isRequired: currentTag.isRequired})
      }
      this.setState({currentTag: currentTag || {}})

    }
    componentWillReceiveProps(nextProps){
      const { loading, tags, params } = nextProps
      let currentTag = {}
      if(tags){
        currentTag = tags.find(ac => { return ac._id === params.id })
        this.setState({isRequired: currentTag.isRequired})

      }
      this.setState({currentTag: currentTag || {}})
    }

    render() {

        const { animated, viewEntersAnim, currentTag } = this.state
        const { loading, tags, params } = this.props

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
                    <Col xs={6} lg={9} className={cx( { 'create-account': false } )}>
                        <Row middle='xs'>
                            <Col xs={4} style={{ textAlign: 'left' }}>
                                <h4>Edit Global Tag</h4>
                            </Col>
                            <Col xs={8}>
                              <RaisedButton label='Cancel' onClick={() => {
                                  const {router} = this.context
                                  router.push(`/tags`)
                              }}
                                backgroundColor={materialTheme.palette.primary2Color}
                                style={{ float: 'right', margin: '30px 5px' }}
                                labelStyle={{ fontSize: '11px', color:'white' }}/>
                                <RaisedButton label='Save' onClick={this.handlesUpdateClick}
                                    style={{ float: 'right', margin: '30px 5px' }}
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
                            <Row style={{marginLeft:10, marginRight:10}}>
                              <TextField id='key' ref='key'  defaultValue={currentTag.key} floatingLabelText='Key' fullWidth={true}/>
                            </Row>
                            <Row style={{marginLeft:10, marginRight:10}}>
                              <TextField id='defaultValue'  defaultValue={currentTag.defaultValue} ref='defaultValue' floatingLabelText='Default Value' fullWidth={true}/>
                            </Row>
                            <Checkbox id='isRequired'  defaultChecked={currentTag.isRequired} onCheck={this.handlesIsRequiredChange} label="Required" style={{marginBottom: 20, marginTop: 20, width: 20}} />
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

    handlesUpdateClick = event => {
        event.preventDefault()
        const { mutate, params } = this.props
        const { router } = this.context
        this.setState({loading: true})

        let tagToUpdate = {}

        // map all fields to tagToUpdate
        for (let key in this.refs) {
            if (key === 'rejectUnauthorizedSsl') {
                tagToUpdate[key] = this.refs[key].isToggled()
            } else {
                tagToUpdate[key] = this.refs[key].getValue()
            }
        }
        if (!this.state.isRequired){
          tagToUpdate.isRequired = false;
        }
        else{
          tagToUpdate.isRequired = true;
        }
        // attach derived fields
        tagToUpdate._id = params.id

        mutate({
            variables: { tag: tagToUpdate }
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
          this.setState({loading: false})
        })
    }
}

UpdateTag.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired,
    refetchTags: PropTypes.func,
    mutate: PropTypes.func
}

UpdateTag.contextTypes = {
    router: PropTypes.object
}

export default UpdateTag
