// const css = require('classnames');
//
// const LEFT = 'left';
// const RIGHT = 'right';

// exports.decorateBrowserOptions = options => Object.assign({}, options, {
//     titleBarStyle: 'default',
//     transparent: false,
// });

exports.decorateConfig = config => Object.assign({}, config, {
    css: `
        ${config.css || ''}
        .tab_first {
            margin-left: 0;
        }
        .tab_drop {
            flex-grow: 1;
        }
        .tab_drop_wrapper {
            position: relative;
        }
        .tab_drop_left:before,
        .tab_drop_right:after {
            content: "";
            width: 2px;
            background-color: #528bff;
            z-index: 2;
            position: absolute;
            height: 100%;
            top: 0;
        }
        .tab_drop_left:before {
            left: 0;
        }
        .tab_drop_right:after {
            right: 0;
        }
`,
});

// const orderTabs = (orderedUids, tabs) => {
//     const orderedTabs = [];
//
//     orderedUids.forEach(uid => {
//         tabs.forEach(tab => {
//             if (tab.uid === uid) {
//                 orderedTabs.push(tab);
//                 return;
//             }
//         });
//     });
//
//     return orderedTabs;
// };
//
// exports.mapHeaderState = (state, map) => Object.assign({}, map, {
//     cols: state.ui.cols,
//     sessionsOrdered: state.sessions.sessionsOrdered,
//     tabs: state.sessions.sessionsOrdered ? orderTabs(state.sessions.sessionsOrdered, map.tabs) : map.tabs,
// });
//
// exports.getTabsProps = (parentProps, props) => Object.assign({}, props, {
//     tabWidth: window.innerWidth / props.tabs.length,
//     moveTab: parentProps.moveTab,
//     sessionsOrdered: parentProps.sessionsOrdered,
// });
//
// exports.getTabProps = (tab, parentProps, props) => Object.assign({}, props, {
//     tabId: tab.uid,
//     tabPosition: parentProps.tabs.indexOf(tab),
//     tabWidth: parentProps.tabWidth,
//     moveTab: parentProps.moveTab,
// });
//
// const MOVE_TAB = '@@DRAGGABLE/MOVE_TAB';
// const moveTab = (uid, position, isAfter) => ({
//     type: MOVE_TAB,
//     uid,
//     position,
//     isAfter,
// });
//
// const calculateNewIndex = (currentIndex, newIndex, isAfter) => {
//     if (currentIndex === newIndex) return currentIndex;
//
//     return (isAfter) ? newIndex + 1 : newIndex;
// };
//
// exports.reduceSessions = (state, action) => {
//     let currentIndex;
//     let newIndex;
//
//     switch (action.type) {
//         case 'SESSION_ADD':
//             return state.set('sessionsOrdered', (state.sessionsOrdered || []).concat([action.uid]));
//
//         case 'SESSION_USER_EXIT':
//         case 'SESSION_PTY_EXIT':
//             return state.set('sessionsOrdered', state.sessionsOrdered.filter(uid => uid !== action.uid));
//
//         case MOVE_TAB:
//             currentIndex = state.sessionsOrdered.indexOf(action.uid);
//             newIndex = calculateNewIndex(currentIndex, action.position, action.isAfter);
//
//             if (currentIndex === newIndex) return state;
//
//             if (currentIndex < newIndex) {
//                 return state.updateIn(['sessionsOrdered'], (sessions) => {
//                     const sessionsOrder = sessions.asMutable();
//                     // insert to the new index
//                     sessionsOrder.splice(newIndex, 0, action.uid);
//                     // remove from the old index
//                     sessionsOrder.splice(currentIndex, 1);
//                     return sessionsOrder;
//                 });
//             }
//
//             return state.updateIn(['sessionsOrdered'], (sessions) => {
//                 const sessionsOrder = sessions.asMutable();
//                 // remove from the old index
//                 sessionsOrder.splice(currentIndex, 1);
//                 // insert to the new index
//                 sessionsOrder.splice(newIndex, 0, action.uid);
//                 return sessionsOrder;
//             });
//
//         default:
//             return state;
//     }
// };
//
// exports.mapHeaderDispatch = (dispatch, map) => Object.assign({}, map, {
//     moveTab(uid, position, isAfter) {
//         dispatch(moveTab(uid, position, isAfter));
//     },
// });
//
// const setActiveSession = (prevUid, newUid) => (dispatch) => {
//     dispatch({
//         type: 'SESSION_SET_ACTIVE',
//         uid: newUid,
//         effect() {
//             // fork from Hyperterm
//             // TODO: this goes away when we are able to poll
//             // for the title ourseleves, instead of relying
//             // on Session and focus/blur to subscribe
//             if (prevUid) window.rpc.emit('blur', { prevUid });
//             window.rpc.emit('focus', { uid: newUid });
//         },
//     });
// };
//
// exports.middleware = ({ dispatch, getState }) => (next) => (action) => {
//     switch (action.type) {
//         case 'UI_MOVE_TO':
//             next({
//                 type: 'UI_MOVE_TO',
//                 effect() {
//                     const i = action.index;
//                     const { sessions } = getState();
//                     const uid = sessions.activeUid;
//                     const sessionUids = sessions.sessionsOrdered;
//
//                     if (uid === sessionUids[i]) {
//                         console.log('ignoring same uid');
//                     } else if (sessionUids[i] != null) {
//                         dispatch(setActiveSession(uid, sessionUids[i]));
//                     } else {
//                         console.log('ignoring inexistent index', i);
//                     }
//                 },
//             });
//             break;
//
//         case 'UI_MOVE_LEFT':
//             next({
//                 type: 'UI_MOVE_LEFT',
//                 effect() {
//                     const { sessions } = getState();
//                     const uid = sessions.activeUid;
//                     const sessionUids = sessions.sessionsOrdered;
//                     const index = sessionUids.indexOf(uid);
//                     const nextTabId = sessionUids[index - 1] || sessionUids[sessionUids.length - 1];
//                     if (nextTabId && uid !== nextTabId) {
//                         dispatch(setActiveSession(uid, nextTabId));
//                     }
//                 },
//             });
//             break;
//
//         case 'UI_MOVE_RIGHT':
//             next({
//                 type: 'UI_MOVE_RIGHT',
//                 effect() {
//                     const { sessions } = getState();
//                     const uid = sessions.activeUid;
//                     const sessionUids = sessions.sessionsOrdered;
//                     const index = sessionUids.indexOf(uid);
//                     const nextTabId = sessionUids[index + 1] || sessionUids[0];
//                     if (nextTabId && uid !== nextTabId) {
//                         dispatch(setActiveSession(uid, nextTabId));
//                     }
//                 },
//             });
//             break;
//
//         default:
//             next(action);
//     }
// };
//
// exports.decorateTab = (Tab, { React }) => {
//     class DecoratedTab extends React.Component {
//         constructor() {
//             super();
//
//             this.drop = this.drop.bind(this);
//             this.setDroppable = this.setDroppable.bind(this);
//             this.unsetDroppable = this.unsetDroppable.bind(this);
//
//             this.state = {
//                 droppable: false,
//                 droppablePosition: LEFT,
//             };
//         }
//
//         onDragStart(event, tabId) {
//             event.dataTransfer.setData('tabId', tabId);
//
//             if (!this.props.isActive) {
//                 this.props.onSelect();
//             }
//         }
//
//         setDroppable(event) {
//             event.preventDefault();
//
//             const { tabWidth, tabPosition } = this.props;
//
//             this.setState({
//                 droppable: true,
//                 droppablePosition: ((tabWidth * tabPosition) + (tabWidth / 2)) < event.clientX ?
//                     RIGHT :
//                     LEFT,
//             });
//         }
//
//         unsetDroppable() {
//             this.setState({ droppable: false });
//         }
//
//         drop(event) {
//             event.preventDefault();
//             const tabId = event.dataTransfer.getData('tabId');
//
//             this.context.store.dispatch(
//                 moveTab(tabId, this.props.tabPosition, this.state.droppablePosition === RIGHT)
//             );
//
//             this.setState({ droppable: false });
//         }
//
//         render() {
//             return React.createElement('div', {
//                 draggable: true,
//                 onDragStart: (event) => this.onDragStart(event, this.props.tabId),
//                 onDrop: this.drop,
//                 onDragOver: this.setDroppable,
//                 onDragLeave: this.unsetDroppable,
//                 className: 'tab_drop',
//             }, React.createElement('div', {
//                 className: css({
//                     tab_drop_wrapper: true,
//                     tab_drop_left: (this.state.droppable && this.state.droppablePosition === LEFT),
//                     tab_drop_right: (this.state.droppable && this.state.droppablePosition === RIGHT),
//                 }),
//             }, React.createElement(Tab, this.props)));
//         }
//     }
//
//     DecoratedTab.contextTypes = {
//         store: React.PropTypes.object,
//     };
//
//     return DecoratedTab;
// };
