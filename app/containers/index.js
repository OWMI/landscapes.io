// non protected view containers
import App from './app/App'
import ConnectedHome from './home/Home'
import ConnectedLogin from './login/Login'
import ConnectedRegister from './register/Register'

// protected view containers
import ConnectedProtected from './protected/Protected'
import ConnectedPasswordChange from './password/Password'

import ConnectedUsers from './users/Users'
import ConnectedCreateUser from './users/CreateUser'
import ConnectedEditUser from './users/EditUser'
import ConnectedUserDetails from './users/UserDetails'
import ConnectedProfile from './users/Profile'

import ConnectedGroups from './groups/Groups'
import ConnectedCreateGroup from './groups/CreateGroup'
import ConnectedEditGroup from './groups/EditGroup'
import ConnectedGroupDetails from './groups/GroupDetails'

import ConnectedDeployments from './deployments/Deployments'
import ConnectedCreateDeployment from './deployments/CreateDeployment'

import ConnectedDocumentTypes from './documentTypes/DocumentTypes'
import ConnectedCreateDocumentTypes from './documentTypes/CreateDocumentTypes'
import ConnectedUpdateDocumentTypes from './documentTypes/UpdateDocumentTypes'

import ConnectedTags from './tags/Tags'
import ConnectedCreateTag from './tags/CreateTag'
import ConnectedUpdateTag from './tags/UpdateTag'

import ConnectedIntegrations from './integrations/Integrations'
import ConnectedIntegrationDetails from './integrations/IntegrationDetails'
import ConnectedIntegrationConfigure from './integrations/IntegrationConfigure'

import ConnectedAccounts from './accounts/Accounts'
import ConnectedCreateAccount from './accounts/CreateAccount'
import ConnectedUpdateAccount from './accounts/UpdateAccount'

import ConnectedLdap from './ldap/Ldap'

import ConnectedLandscapes from './landscapes/Landscapes'
import ConnectedCreateLandscape from './landscapes/CreateLandscape'
import ConnectedEditLandscape from './landscapes/EditLandscape'
import ConnectedLandscapeDetails from './landscapes/LandscapeDetails'

export {
    // non protected view containers
    App,
    ConnectedHome,
    ConnectedLogin,

    ConnectedGroups,
    ConnectedCreateGroup,
    ConnectedEditGroup,
    ConnectedGroupDetails,

    ConnectedRegister,
    ConnectedPasswordChange,

    // protected view containers
    ConnectedProtected,

    ConnectedDeployments,
    ConnectedCreateDeployment,

    ConnectedDocumentTypes,
    ConnectedCreateDocumentTypes,
    ConnectedUpdateDocumentTypes,

    ConnectedTags,
    ConnectedCreateTag,
    ConnectedUpdateTag,

    ConnectedIntegrations,
    ConnectedIntegrationDetails,
    ConnectedIntegrationConfigure,

    ConnectedAccounts,
    ConnectedCreateAccount,
    ConnectedUpdateAccount,

    ConnectedUsers,
    ConnectedCreateUser,
    ConnectedEditUser,
    ConnectedUserDetails,
    ConnectedProfile,

    ConnectedLdap,

    ConnectedLandscapes,
    ConnectedCreateLandscape,
    ConnectedEditLandscape,
    ConnectedLandscapeDetails
}
