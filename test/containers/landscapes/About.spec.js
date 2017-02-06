import React                from 'react';
import {expect}             from 'chai';
import {shallow}            from 'enzyme';
import configureMockStore   from 'redux-mock-store';
import thunk                from 'redux-thunk';
import LandscapesConnected       from '../../../app/containers/landscapes/Landscapes';

const mockStore = configureMockStore([ thunk ]);
const storeStateMock = {
  views: {
    currentView: 'landscapes'
  }
};

let store;
let wrapper;
describe('LandscapesConnected (Landscapes container) ', () => {
  beforeEach(() => {
    store = mockStore(storeStateMock);
    wrapper = shallow(<LandscapesConnected store={store} />).shallow();
  });

  it('should render container', () => {
    expect(wrapper.containsMatchingElement(<h1>Landscapes</h1>));
  });
});
