import {expect}             from 'chai';
import views                from '../../../app/redux/modules/views';
import moment               from 'moment';

const dateFormat = 'DD/MM/YYYY HH:mm';

describe('redux - reducer "views"', () => {
  it('should return an initial state', () => {
    const initialState = {
      currentView:  'not set',
      enterTime:    null,
      leaveTime:    null
    };
    /* eslint-disable no-undefined */
    expect(views(undefined, {})).to.deep.equal(initialState);
    /* eslint-enable no-undefined */
  });

  it('should set state according to ENTER_HOME_VIEW action', () => {
    const now = moment().format(dateFormat);
    const action = {
      type:         'ENTER_HOME_VIEW',
      currentView:  'home',
      enterTime:    now,
      leaveTime:    null
    };
    const expectedState = {
      currentView:  'home',
      enterTime:    now,
      leaveTime:    null
    };
    /* eslint-disable no-undefined */
    expect(views(undefined, action)).to.deep.equal(expectedState);
    /* eslint-enable no-undefined */
  });

  it('should set state according to LEAVE_HOME_VIEW action', () => {
    const now = moment().format(dateFormat);
    const actionLeaveHome = {
      type:         'LEAVE_HOME_VIEW',
      currentView:  'home',
      enterTime:    null,
      leaveTime:    now
    };
    const expectedState = {
      currentView:  'home',
      enterTime:    null,
      leaveTime:    now
    };
    /* eslint-disable no-undefined */
    expect(views({currentView: 'home', enterTime: null}, actionLeaveHome)).to.deep.equal(expectedState);
    /* eslint-enable no-undefined */
  });


  it('should set state according to ENTER_LANDSCAPES_VIEW action', () => {
    const now = moment().format(dateFormat);
    const action = {
      type:         'ENTER_LANDSCAPES_VIEW',
      currentView:  'landscapes',
      enterTime:    now,
      leaveTime:    null
    };
    const expectedState = {
      currentView:  'landscapes',
      enterTime:    now,
      leaveTime:    null
    };
    /* eslint-disable no-undefined */
    expect(views(undefined, action)).to.deep.equal(expectedState);
    /* eslint-enable no-undefined */
  });

  it('should set state according to LEAVE_LANDSCAPES_VIEW action', () => {
    const now = moment().format(dateFormat);
    const actionLeaveLandscapes = {
      type:         'LEAVE_LANDSCAPES_VIEW',
      currentView:  'landscapes',
      enterTime:    null,
      leaveTime:    now
    };
    const expectedState = {
      currentView:  'landscapes',
      enterTime:    null,
      leaveTime:    now
    };
    /* eslint-disable no-undefined */
    expect(views({currentView: 'landscapes', enterTime: null}, actionLeaveLandscapes)).to.deep.equal(expectedState);
    /* eslint-enable no-undefined */
  });
});
