const Mousetrap = require('mousetrap');

const LEFT = 'left';
const RIGHT = 'right';

// exports.decorateBrowserOptions = options => Object.assign({}, options, {
//     titleBarStyle: 'default',
//     transparent: false,
// });

const orderTabs = (orderedUids, tabs) => {
    const orderedTabs = [];

    orderedUids.forEach(uid => {
        tabs.forEach(tab => {
            if (tab.uid === uid) {
                orderedTabs.push(tab);
                return;
            }
        });
    });

    return orderedTabs;
};

exports.mapHeaderState = (state, map) => Object.assign({}, map, {
    cols: state.ui.cols,
    sessionsOrdered: state.termGroups.termGroupsOrdered,
    tabs: state.termGroups.termGroupsOrdered ? orderTabs(state.termGroups.termGroupsOrdered, map.tabs) : map.tabs,
});

exports.getTabsProps = (parentProps, props) => Object.assign({}, props, {
    tabWidth: window.innerWidth / props.tabs.length,
    moveTab: parentProps.moveTab,
    sessionsOrdered: parentProps.sessionsOrdered,
});

exports.getTabProps = (tab, parentProps, props) => Object.assign({}, props, {
    tabId: tab.uid,
    tabPosition: parentProps.tabs.indexOf(tab),
    tabWidth: parentProps.tabWidth,
    moveTab: parentProps.moveTab,
    shortcutMoveTab: parentProps.shortcutMoveTab,
});

exports.getTermGroupProps = (tab, parentProps, props) => Object.assign({}, props, {
    shortcutMoveTab: parentProps.shortcutMoveTab,
});
exports.getTermProps = (tab, parentProps, props) => Object.assign({}, props, {
    shortcutMoveTab: parentProps.shortcutMoveTab,
});

const MOVE_TAB = '@@DRAGGABLE/MOVE_TAB';

const moveTab = (uid, position, isAfter) => ({
    type: MOVE_TAB,
    uid,
    position,
    isAfter,
});

const shortcutMoveTab = (direction) => (dispatch, getState) => {
    const state = getState();
    const activeUid = state.termGroups.activeRootGroup;
    const currentIndex = state.termGroups.termGroupsOrdered.indexOf(activeUid);
    let newPosition = direction === LEFT ? currentIndex - 1 : currentIndex + 1;

    if (newPosition === -1) {
        newPosition = state.termGroups.termGroupsOrdered.length + 1;
    } else if (newPosition > state.termGroups.termGroupsOrdered.length - 1) {
        newPosition = -1;
    }

    dispatch({
        type: MOVE_TAB,
        uid: activeUid,
        position: newPosition,
        isAfter: direction === RIGHT,
    });
};

const calculateNewIndex = (currentIndex, newIndex, isAfter) => {
    if (currentIndex === newIndex) return currentIndex;

    return (isAfter) ? newIndex + 1 : newIndex;
};

exports.reduceTermGroups = (state, action) => {
    let currentIndex;
    let newIndex;
    let termGroupId;

    const findTermGroupId = (termGroups = {}, sessionUid) => {
        const termGroupsIds = Object.keys(termGroups);
        const termGroup = termGroupsIds.filter(groupId => termGroups[groupId].sessionUid === sessionUid);
        if (termGroup.length) {
            return termGroup[0];
        }

        return false;
    };

    switch (action.type) {
        case 'SESSION_ADD':
            termGroupId = findTermGroupId(state.termGroups, action.uid);

            if (termGroupId) {
                return state.set('termGroupsOrdered', (state.termGroupsOrdered || []).concat([termGroupId]));
            }

            return state;

        case 'TERM_GROUP_EXIT':
            return state.set('termGroupsOrdered', state.termGroupsOrdered.filter(uid => uid !== action.uid));

        case MOVE_TAB:
            currentIndex = state.termGroupsOrdered.indexOf(action.uid);
            newIndex = calculateNewIndex(currentIndex, action.position, action.isAfter);

            if (currentIndex === newIndex) return state;

            if (currentIndex < newIndex) {
                return state.updateIn(['termGroupsOrdered'], (termGroups) => {
                    const termGroupsOrder = termGroups.asMutable();
                    // insert to the new index
                    termGroupsOrder.splice(newIndex, 0, action.uid);
                    // remove from the old index
                    termGroupsOrder.splice(currentIndex, 1);
                    return termGroupsOrder;
                });
            }

            return state.updateIn(['termGroupsOrdered'], (termGroups) => {
                const termGroupsOrder = termGroups.asMutable();
                // remove from the old index
                termGroupsOrder.splice(currentIndex, 1);
                // insert to the new index
                termGroupsOrder.splice(newIndex, 0, action.uid);
                return termGroupsOrder;
            });

        default:
            return state;
    }
};

exports.mapHeaderDispatch = (dispatch, map) => Object.assign({}, map, {
    moveTab(uid, position, isAfter) {
        dispatch(moveTab(uid, position, isAfter));
    },
    shortcutMoveTab(direction) {
        dispatch(shortcutMoveTab(direction));
    },
});

exports.mapTermsDispatch = (dispatch, map) => Object.assign({}, map, {
    moveTab(uid, position, isAfter) {
        dispatch(moveTab(uid, position, isAfter));
    },
    shortcutMoveTab(direction) {
        dispatch(shortcutMoveTab(direction));
    },
});

const setActiveSession = (uid) => (dispatch) => {
    dispatch({
        type: 'SESSION_SET_ACTIVE',
        uid,
    });
};

const setActiveGroup = (uid) => (dispatch, getState) => {
    const { termGroups } = getState();
    dispatch(setActiveSession(termGroups.activeSessions[uid]));
};

exports.middleware = ({ dispatch, getState }) => (next) => (action) => {
    switch (action.type) {
        case 'UI_MOVE_TO':
            next({
                type: 'UI_MOVE_TO',
                index: action.index,
                effect() {
                    const i = action.index;
                    const state = getState();
                    const { termGroupsOrdered } = state.termGroups;
                    const uid = state.termGroups.activeRootGroup;
                    if (uid === termGroupsOrdered[i]) {
                        console.log('ignoring same uid');
                    } else if (termGroupsOrdered[i]) {
                        dispatch(setActiveGroup(termGroupsOrdered[i]));
                    } else {
                        console.log('ignoring inexistent index', i);
                    }
                },
            });
            break;

        case 'UI_MOVE_LEFT':
            next({
                type: 'UI_MOVE_LEFT',
                effect() {
                    const state = getState();
                    const { termGroupsOrdered } = state.termGroups;
                    const uid = state.termGroups.activeRootGroup;
                    const index = termGroupsOrdered.indexOf(uid);
                    const nextGroupId = termGroupsOrdered[index - 1] || termGroupsOrdered[termGroupsOrdered.length - 1];
                    if (!nextGroupId || uid === nextGroupId) {
                        console.log('ignoring left move action');
                    } else {
                        dispatch(setActiveGroup(nextGroupId));
                    }
                },
            });
            break;

        case 'UI_MOVE_RIGHT':
            next({
                type: 'UI_MOVE_RIGHT',
                effect() {
                    const state = getState();
                    const { termGroupsOrdered } = state.termGroups;
                    const uid = state.termGroups.activeRootGroup;
                    const index = termGroupsOrdered.indexOf(uid);
                    const nextGroupId = termGroupsOrdered[index + 1] || termGroupsOrdered[0];
                    if (!nextGroupId || uid === nextGroupId) {
                        console.log('ignoring right move action');
                    } else {
                        dispatch(setActiveGroup(nextGroupId));
                    }
                },
            });
            break;

        default:
            next(action);
    }
};


exports.decorateTerm = (Term, { React }) => {
    class DecoratedTerm extends React.Component {
        constructor() {
            super();

            this.init = false;
        }

        componentDidUpdate(prev) {
            if (prev.isTermActive !== this.props.isTermActive || !this.init) {
                this.init = true;

                if (this.keys) {
                    this.keys.reset();
                }

                if (this.props.isTermActive) {
                    const term = this.el.term || this.el.props.term;
                    const doc = term.document_;

                    this.keys = new Mousetrap(doc);

                    this.keys.bind(['alt+shift+left', 'ctrl+alt+shift+left'], () => { this.props.shortcutMoveTab(LEFT); });
                    this.keys.bind(['alt+shift+right', 'ctrl+alt+shift+right'], () => { this.props.shortcutMoveTab(RIGHT); });
                }
            }
        }

        render() {
            return React.createElement(Term, Object.assign({}, this.props, {
                ref: (el) => { this.el = el; },
            }));
        }
    }

    return DecoratedTerm;
};
