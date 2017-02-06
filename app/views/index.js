// non protected views:
import Home             from './home/Home'
import PageNotFound     from './pageNotFound/PageNotFound'
import Login            from './login/Login'
import Register         from './register/Register'
import Password         from './password/Password'

// protected views:
import Protected        from './protected/Protected'
import CreateLandscape  from './landscapes/CreateLandscape'
import EditLandscape    from './landscapes/EditLandscape'
import LandscapeDetails from './landscapes/LandscapeDetails'
import Landscapes       from './landscapes/Landscapes'

import Users            from './users/Users'
import CreateUser       from './users/CreateUser'
import EditUser         from './users/EditUser'
import UserDetails      from './users/UserDetails'
import Profile          from './users/Profile'

import Groups           from './groups/Groups'
import CreateGroup      from './groups/CreateGroup'
import EditGroup        from './groups/EditGroup'
import GroupDetails     from './groups/GroupDetails'

import Accounts         from './accounts/Accounts'
import CreateAccount    from './accounts/CreateAccount'
import UpdateAccount    from './accounts/UpdateAccount'

import Deployments      from './deployments/Deployments'
import CreateDeployment      from './deployments/CreateDeployment'

export {
    // non protected views:
    Home,
    PageNotFound,
    Login,
    Register,
    Password,
    // protected views:
    Protected,
    Landscapes,
    CreateLandscape,
    EditLandscape,
    LandscapeDetails,

    Users,
    CreateUser,
    EditUser,
    UserDetails,
    Profile,

    Groups,
    CreateGroup,
    EditGroup,
    GroupDetails,

    Accounts,
    CreateAccount,
    UpdateAccount,

    Deployments,
    CreateDeployment
}
