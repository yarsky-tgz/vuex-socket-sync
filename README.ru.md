# vuex-socket-sync [![Coverage Status](https://coveralls.io/repos/github/yarsky-tgz/vuex-socket-sync/badge.svg?branch=master)](https://coveralls.io/github/yarsky-tgz/vuex-socket-sync?branch=master) [![Build Status](https://travis-ci.org/yarsky-tgz/vuex-socket-sync.svg?branch=master)](https://travis-ci.org/yarsky-tgz/vuex-socket-sync)

Плагин к [vuex](https://github.com/vuejs/vuex), который выполняет простую, но очень эффективную работу:

 * при каждой диспетчеризации **действия** (`action`) он отправляет в сокет **событие** (`event`), назначенное Вами для этого **действия**, с теми же данными.
 * при каждом полученном через сокет **событии** , он диспетчеризует одно или более **действий**, назначенных Вами для таких **событий**, с теми же данными.
 
Для организации логики на стороне сервера в модули с теми же названиями вам потребуется использовать мою библиотеку [socket.io-namespace-controller](https://www.npmjs.com/package/socket.io-namespace-controller)
 
## Установка
 
```bash
npm i vuex-socket-sync socket.io-namespace-controller
```

## Использование

Теперь вы можете в ваших vuex модулях дополнительно определять свойство `socket` - объект, описывающий какие **действия** диспетчеризировать в ответ на какие **события** и наоборот - какое **событие** отправить при диспетчеризации каких **действий**. 

Обьект состоит из двух свойств:

 * `actions` - объект, описывающий, какие **события** отправлять при диспетчеризации **действий**, имена свойств описывают имена **действий**, а значения - имена **события**.
 * `events` - объект, описывающий, какие **действия** диспетчеризировать после получения каких **событий**, имена свойств описывают имена **событий**, а значения - имена **действий**. Значение может быть массивом, тогда будет вызвано несколько **действий** 

Пример модуля:

```javascript
{
  namespaced: true,
  getters: {...},
  mutations: {...}
  actions: {
    setAnswer() {...},
    sendQuestion() {...}
  },
  socket: {
    events: {
      answer: 'setAnswer'
    },
    actions: {
     sendQuestion: 'ask'
    }
  }
}
```

В данном примере у нас два **действия** в модуле: `setAnswer()` и `sendQuestion()`. И в свойстве `socket` описаны следующие правила синхронизации действий с событиями и наоборот:

 * при получении **события** `answer` будет диспетчеризировано **действие** `setAnswer` с теми же данными.
 * при диспетчеризации **действия** `sendQuestion` будет отправлено **событие** `ask` с теми же данными.

Нет проблем, если Вы хотите, чтобы несколько **действий** были диспетчеризованы одним **событием**: 

```javascript
events: {
  answer: [
    'setAnswer',
    'logger/logAnswer'
  ] 
}
```

Be attentive: that is actual only for **right part** of mapping. **left part** always belongs to current module and **same named** namespace. So you can write: 

Вы можете указывать путь к событию или действию из другого пространства имен (например `logger/logAnswer`), но это работает только для **значений свойств** в `actions`/`events` объектах. **События** или **действия**, являющиеся **именами свойств** всегда принадлежат к текущему модулю или [пространству имён] socket.io. Поэтому Вы можете написать:

```
  event: 'otherModule/action'
```

but you cannot 

Но Вы не можете

```
  'otherModule/event': 'myAction'
```

Так же вы можете использовать значение 


In case we have `'='` as mapping value it means, that   we shall use the same name for `event` or `action`

В случае, когда мы имеем `'='` как значение, это значит, что мы будем использовать то же самое имя для `event`  или `action` 

## Full Store Example

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
        paths: [
          'fillQueryPaths',
          'settings/saveActualPaths'
        ]
      },
      actions: {
        openUserFolder: 'browse',
        execute: 'interpreter/execute',
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
    socket(io, modules)
  ]
});
```

So, what we have here?

Итак, что мы имеем здесь?


On socket event from namespace `/folders` with name `paths` shall be dispatched two actions: `folders/fillQueryPaths` and `settings/saveActualPaths`.

В сокет событие из папок **folders**  пространства имён c именем (пути) **paths** будут диспетчеризованы два действия: (папки/ заполнениеЗапросПути) **folders/fillQueryPaths** и (настройки/сохранитьФактическийПути).

On dispatch action `folders/openUserFolder` will be emitted event `browse` of namespace `/folders`.

При диспетчеризации `folders/openUserfolder` будет выделено событие `browse` пространства имён `/folders`.

On dispatch action `folders/execute` will be emitted event `execute` of namespace `/interpreter`. 

При диспетчеризации `folders/execute`  будет выделено событие `execute из пространства имён (`/interpreter).

On dispatch action `folders/search` will be emitted event `search` of namespace `/folders`.

При диспетчеризации действия `folders/search` будет отправлено событие `search` пространства имён `/folders`.

As you can see you just give socket.io client builder to plugin. It takes care about everything else by it's own 

Как Вы видите, вы только даёте cтроителю клиента соединиться через сокет. Дальше он сам обо всём позаботится.

