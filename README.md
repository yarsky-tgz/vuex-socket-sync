# vuex-socket-sync

Vuex plugin, which makes simple, but very powerful job: 
 * on each `action` dispatch it emits socket `event`, specified for that `action`, **with same payload**
 * on each received socket `event` it dispatches one or more `actions`, specified for such event, **with same payload**
 
## Installation
 
```bash
npm i vuex-socket-sync
```

## Usage

Currently it wotks only with modules. 

Into each module describing object u can add optional property `socket`, which should consists from two sub properties: `events` and `actions`. 

`events` should be object representing event-to-action mapping and `actions` should represent action-to-event mapping

## Example

```javascript
import socket from 'vuex-socket-sync';
import io from 'socket.io-client/dist/socket.io.slim';

const modules = {
  folders: {
    namespaced: true,
    state: {
      choosenFolder: null,
      path: '',
      tree: [],
      paths: []
    },
    actions,
    mutations,
    socket: {
      events: {
        folders: 'fillFolders',
        paths: 'fillQueryPaths',
      },
      actions: {
        openUserFolder: 'browse',
        search: '='
      }
    }
  }
};
const state = {};

export default new Vuex.Store({
  strict: 'true',
  state,
  modules,
  plugins: [
    socket(io('/users'), modules)
  ]
});
```

So, what we have here?

On socket event with name `folders/paths` shall be dispatched action `folders/fillQueryPaths`.
On dispatch action `folders/openUserFolder` shall be emitted event `folders/browse`.

In case we have `'='` as mapping value it means, that   we shall use same name for `event` or `action`
