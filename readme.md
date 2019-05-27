# hyperterm-tabs

> [HyperTerm](https://hyper.is) tabs reordering support plugin

<div align="center">
    <img src="https://raw.githubusercontent.com/patrik-piskay/hyperterm-tabs/master/hyperterm-tabs.gif">
</div>

## Install

Add `hyperterm-tabs` to the `plugins` list in your `~/.hyperterm.js` config file.

## Usage

As drag&drop is currently [not possible](https://github.com/zeit/hyper/issues/911), only reordering with keyboard shortcuts is available.

To move active tab around, press `alt+left/right arrow` or `ctrl+alt+shift+left/right arrow`, or configure your own shortcuts using config (using [mousetrap](https://craig.is/killing/mice) supported keys):

```javascript
module.exports = {
  config: {
    ...
    hyperTabsMove: {
      moveLeft: 'command+[',
      moveRight: ['command+]', 'r i g h t']
    }
    ...
  }
  ...
}
```
