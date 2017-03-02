import cx from 'classnames'
import { find, map } from 'lodash'
import { Row, Col } from 'react-flexbox-grid'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Avatar, Checkbox, Divider, List, ListItem, Subheader } from 'material-ui'
import './ldap.style.scss'

class Ldap extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        selectedLandscapeGroup: {
            index: 0
        }
    }

    componentDidMount() {
        const { enterProtected } = this.props
        enterProtected()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveProtected } = this.props
        leaveProtected()
    }

    render() {

        const self = this
        const { groups, ldapGroups } = self.props
        const { animated, mappedGroupNames, selectedLandscapeGroup, viewEntersAnim } = self.state

        return (
            <Row between='xs' className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <Col xs={4} style={{ height: '80vh' }}>
                    <List>
                        <Subheader>Landscape Groups</Subheader>
                        {
                            groups && groups.length
                            ?
                                groups.map((group, i) => {
                                    return <ListItem key={i}
                                        onClick={self.handleLandscapeGroupClick.bind(self, group, i)}
                                        primaryText={group.name}
                                        leftAvatar={<Avatar src={group.imageUri}/>}
                                        className={cx({ 'selected-ls-group': i === selectedLandscapeGroup.index })}
                                    />
                                })
                            :
                                null
                        }
                    </List>
                </Col>
                <Col xs={8} style={{ height: '80vh' }}>
                    <List>
                        <Subheader>LDAP Groups</Subheader>
                        {
                            ldapGroups && ldapGroups.length
                            ?
                                ldapGroups.map((group, i) => {
                                    return <ListItem key={i}
                                        primaryText={group.cn}
                                        leftCheckbox={
                                            <Checkbox onCheck={self.handlesSettingMappings.bind(self, group.cn)}
                                                checked={mappedGroupNames && mappedGroupNames.indexOf(group.cn) > -1}/>
                                        }
                                    />
                                })
                            :
                                null
                        }
                    </List>
                </Col>
            </Row>
        )
    }

    handleLandscapeGroupClick(group, index) {
        const self = this
        const { mappings } = self.props
        const mappedGroupNames = find(mappings, { landscapeGroup: group.name })
                                    ? find(mappings, { landscapeGroup: group.name }).mappedGroups
                                    : []
        group.index = index

        self.setState({
            mappedGroupNames,
            selectedLandscapeGroup: group
        })
    }

    handlesSettingMappings(ldapGroupName) {
        const self = this
        const { selectedLandscapeGroup } = self.state
        const { mappings, refetchMappings, updateMappings } = self.props
        const currentMapping = find(mappings, { landscapeGroup: selectedLandscapeGroup.name })

        let mappingToUpdate = {
            _id: currentMapping ? currentMapping._id : null,
            landscapeGroup: selectedLandscapeGroup.name,
            mappedGroups: currentMapping ? currentMapping.mappedGroups : []
        }

        // add or remove ldap group
        if (mappingToUpdate.mappedGroups.indexOf(ldapGroupName) > -1) {
            mappingToUpdate.mappedGroups.splice(mappingToUpdate.mappedGroups.indexOf(ldapGroupName), 1)
        } else {
            mappingToUpdate.mappedGroups.push(ldapGroupName)
        }

        updateMappings({
            variables: { mapping: mappingToUpdate }
        }).then(({ data }) => {
            return refetchMappings()
        }).then(({ data }) => {
            self.setState({
                mappedGroupNames: find(data.mappings, { landscapeGroup: mappingToUpdate.landscapeGroup }).mappedGroups
            })
        }).catch(err => console.error(err))
    }

}

Ldap.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterProtected: PropTypes.func.isRequired,
    leaveProtected: PropTypes.func.isRequired
}

export default Ldap
