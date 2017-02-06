import React                from 'react';
import {
  shallow,
  mount
}                           from 'enzyme';
import chai, {expect}       from 'chai';
import sinon                from 'sinon';
import dirtyChai            from 'dirty-chai';
import Landscapes                from '../../../app/views/landscapes/Landscapes';

chai.use(dirtyChai);


describe('Landscapes VIEW ', () => {
  const props = {
    currentView: 'landscapes',
    enterLandscapes: () => {},
    leaveLandscapes: () => {}
  };
  it('should render "Landscapes" view', () => {
    const wrapper = shallow(<Landscapes {...props} />);

    expect(wrapper).to.exist();
    expect(wrapper.containsMatchingElement(<h1>Landscapes</h1>));
  });

  it('should call enterLandscapes action', () => {
    const enterLandscapesAction = sinon.spy(); // called on componentDidMount
    /* eslint-disable no-unused-vars */
    const wrapper = mount(
      <Landscapes
        currentView={props.currentView}
        enterLandscapes={enterLandscapesAction}
        leaveLandscapes={()=>{}}
      />
    );
    /* eslint-enable no-unused-vars */
    expect(enterLandscapesAction).to.have.property('callCount', 1);
  });

  it('should call leaveLandscapes action', () => {
    const leaveLandscapesAction = sinon.spy(); // called on componentDidMount
    const wrapper = mount(
      <Landscapes
        currentView={props.currentView}
        enterLandscapes={()=>{}}
        leaveLandscapes={leaveLandscapesAction}
      />
    );
    wrapper.unmount();
    expect(leaveLandscapesAction).to.have.property('callCount', 1);
  });
});
