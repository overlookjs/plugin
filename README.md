[![NPM version](https://img.shields.io/npm/v/@overlook/router.svg)](https://www.npmjs.com/package/@overlook/router)
[![Build Status](https://img.shields.io/travis/overlookjs/router/master.svg)](http://travis-ci.org/overlookjs/router)
[![Dependency Status](https://img.shields.io/david/overlookjs/router.svg)](https://david-dm.org/overlookjs/router)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookjs/router.svg)](https://david-dm.org/overlookjs/router)
[![Greenkeeper badge](https://badges.greenkeeper.io/overlookjs/router.svg)](https://greenkeeper.io/)
[![Coverage Status](https://img.shields.io/coveralls/overlookjs/router/master.svg)](https://coveralls.io/r/overlookjs/router)

# Overlook framework Router class

Part of the [Overlook framework](https://overlookjs.github.io/).

## Introduction

[Overlook framework](https://overlookjs.github.io/) `Router` class. Route class extensions (otherwise known as "Routers") should be created with this class.

Overlook is intended to be extremely modular and flexible.

The base `Route` class has very little functionality, and most functionality is intended to be added using Routers.

Extensions (or "Routers") are much like "plugins", which other frameworks use, but the main difference is this:

> Route class extensions apply at the route level, not application level.

One route, or subtree of routes, can have one behavior, another subtree can have another. So, for example, one part of the app can use [React](https://reactjs.org/), another part can server-render pages from [EJS](https://ejs.co/) templates.

This architecture allows:

1. "Snap in" extensions providing common functionality, making building apps fast
2. Granular control over every route's individual behavior

## Usage

### Creating a Router

A Router is created from a function which receives a `Route` class and should return a subclass of it.

```js
const Router = require('@overlook/router'),
  makeSymbols = require('@overlook/util-make-symbols');

const { TYPE, GREETING } = makeSymbols(
  [ 'TYPE', 'GREETING' ]
);

const mammalRouter = new Router( Route => (
  class extends Route {
    initProps( props ) {
      super.initProps( props );
      this[TYPE] = undefined;
    }

    initRoute( app ) {
      super.initRoute( app );
      if (this[TYPE] === undefined) this[TYPE] = 'mammal';
    }

    [GREETING]() {
      return `Hello, I am a ${this[TYPE]}.`;
    }
  }
) );

mammalRouter.TYPE = TYPE;
mammalRouter.GREETING = GREETING;
```

New methods and properties should have Symbol keys, not strings. If properties are intended to be accessed by other Routers, or methods intended to be available for extending, the Symbol should be exported as a property of the Router.

The Router can than be used create a subclass of a `Route` class, using `.extend()`:

```js
const Route = require('@overlook/route');

const MammalRoute = Route.extend( mammalRouter );
```

That subclass can now be used to create a route which includes the Router's functionality:

```js
const route = new MammalRoute();

route[ mammalRouter.GREETING ]()
// => 'Hello, I am a mammal.'
```

### Removing Symbols boilerplate

It's typical for a Router to define Symbols.

To reduce boilerplate code, you can create Symbols within the Router constructor.

This example is equivalent to the first:

```js
const Router = require('@overlook/router');

const mammalRouter = new Router( {
  symbols: [ 'TYPE', 'GREETING' ],
  extend
} );

const { TYPE, GREETING } = mammalRouter;

function extend( Route ) (
  class extends Route {
    initProps( props ) {
      super.initProps( props );
      this[TYPE] = undefined;
    }

    initRoute( app ) {
      super.initRoute( app );
      if (this[TYPE] === undefined) this[TYPE] = 'mammal';
    }

    [GREETING]() {
      return `Hello, I am a ${this[TYPE]}.`;
    }
  }
}
```

Note that the symbols were set as properties of `mammalRouter`.

### Publishing a Router to NPM

`new Router()` has a few more options which should be used when publishing a Router to NPM.

1. You should pass in the name and version of the module.
2. Symbols *must* be created using either `@overlook/util-make-symbols` or the `Router` constructor.

```js
// Published as `@me/monkey`
// version 1.0.0
const Router = require('@overlook/router'),
  makeSymbols = require('@overlook/util-make-symbols');

const { GREETING } = makeSymbols(
  '@me/monkey',
  [ 'GREETING' ]
);

const monkeyRouter = new Router(
  {
    name: '@me/monkey',
    version: '1.0.0'
  },
  Route => class extends Route { /* ... */ }
);

module.exports = monkeyRouter;
```

The options object has the same properties as `package.json` so, to avoid having to update the version property every time you publish a new version of the module, you can pass that instead.

It's also more economical to create symbols in `new Router()`, to avoid passing the package name to `makeSymbols()` too:

```js
const pkg = require('./package.json');

const monkeyRouter = new Router(
  pkg,
  { symbols: [ 'GREETING' ] },
  Route => class extends Route { /* ... */ }
);

module.exports = monkeyRouter;
```

### Longer example including using symbols

```js
const Router = require('@overlook/router');
const pkg = require('./package.json');

const monkeyRouter = new Router(
  pkg,
  { symbols: [ 'GREETING' ] },
  extend
);

const { GREETING } = monkeyRouter;

function extend( Route ) {
  return class extends Route {
    [GREETING]() {
      return 'Hello, I am a monkey.';
    }
  };
}

module.exports = monkeyRouter;
```

### Composing Routers

Routers can extend other Routers.

Let's say we have various routes which need a "greeting" method. This functionality can be split off into its own Router.

```js
const Router = require('@overlook/router');

const typeRouter = new Router(
  { symbols: [ 'TYPE', 'GET_TYPE', 'GREETING' ] },
  extend
} );

const { TYPE, GET_TYPE, GREETING } = typeRouter;

function extend( Route ) (
  class extends Route {
    initProps( props ) {
      super.initProps( props );
      this[TYPE] = undefined;
    }

    initRoute( app ) {
      super.initRoute( app );
      this[TYPE] = this[GET_TYPE]();
    }

    [GET_TYPE]() {
      return 'mystery';
    }

    [GREETING]() {
      return `Hello, I am a ${this[TYPE]}.`;
    }
  }
}
```

Now other Routers can extend off that:

```js
const { GET_TYPE } = typeRouter;

const monkeyRouter = new Router(
  Route => {
    Route = Route.extend( typeRouter );

    return class extends Route {
      [GET_TYPE]() {
        return 'monkey';
	  }
    };
  }
);

const zebraRouter = new Router(
  Route => {
    Route = Route.extend( typeRouter );

    return class extends Route {
      [GET_TYPE]() {
        return 'zebra';
	  }
    };
  }
);

const MonkeyRoute = Route.extend( monkeyRouter );
const monkey = new MonkeyRoute();
monkey[GREETNG]()
// => 'Hello, I am a monkey.'

const ZebraRoute = Route.extend( zebraRouter );
const zebra = new ZebraRoute();
zebra[GREETNG]()
// => 'Hello, I am a zebra.'
```

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See [changelog.md](https://github.com/overlookjs/router/blob/master/changelog.md)

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookjs/router/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add tests for new features
* document new functionality/API additions in README
* do not add an entry to Changelog (Changelog is created when cutting releases)
