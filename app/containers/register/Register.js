import { connect }            from 'react-redux';
import { bindActionCreators } from 'redux';
import * as viewsActions      from '../../redux/modules/views';
import * as userAuthActions   from '../../redux/modules/userAuth';
import { Register }           from '../../views';
import gql                    from 'graphql-tag';
import { graphql }            from 'react-apollo';


/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const CreateUser = gql`
mutation CreateUser ($user: CreateUserInput!) {
   createUser (input: $user) {
       changedUser {
         id,
         username,
         createdAt,
         modifiedAt,
         lastLogin
       }
       token
   }
}
`;
// 1- add mutation "CreateUser":
const RegisterWithCreateUserMutation = graphql(
  CreateUser,
  {
    name: 'createUserMutation',
    props: ({ ownProps, createUserMutation }) => ({
      registerUser(user) {
        ownProps.setloading();

        return createUserMutation(user)
          .then(
            (
              {
                data: {
                  createUser: {
                    changedUser,
                    token
                  }
                }
              }
            ) => {
              ownProps.onUserRegisterSuccess(token, changedUser);
              ownProps.unsetloading();
              return Promise.resolve();
            }
          )
          .catch(
            (error)=> {
              ownProps.onUserRegisterError(error);
              ownProps.unsetloading();
              return Promise.reject(error);
            }
          );
      }
    })
  }
)(Register);


/* -----------------------------------------
  Redux
 ------------------------------------------*/
const mapStateToProps = (state) => {
  return {
    // views props:
    currentView:  state.views.currentView,
    // user Auth props:
    userIsAuthenticated: state.userAuth.isAuthenticated,
    loading: state.userAuth.loading,
    // errors:
    error: state.userAuth.error
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      // views actions:
      enterRegister: viewsActions.enterRegister,
      leaveRegister: viewsActions.leaveRegister,
      // userAuth actions:
      onUserRegisterSuccess: userAuthActions.receivedUserRegister,
      onUserRegisterError: userAuthActions.errorUserRegister,
      resetError: userAuthActions.resetLogError,

      setloading: userAuthActions.setLoadingStateForUserRegister,
      unsetloading: userAuthActions.unsetLoadingStateForUserRegister
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RegisterWithCreateUserMutation);
