const ROUTES = '$$routes';

const destruct = args => {
  const hasPath = typeof args[0] === 'string' || Object.prototype.toString.call(args[0]) === '[object RegExp]';
  const path = hasPath ? args[0] : '';
  const middleware = hasPath ? args.slice(1) : args;

  if (middleware.some(m => typeof m !== 'function')) {
    throw new Error('Middleware must be function')
  }

  return [path, middleware]
};

// @route(method, path: optional, ...middleware: optional)
export const route = (method, ...args) => {
  if (typeof method !== 'string') {
    throw new Error('The first argument must be an HTTP method')
  }

  const [path, middleware] = destruct(args);

  return (target, fnName) => {
    const routes = target[ROUTES] || [];
    target[ROUTES] = [...routes, {method, path, middleware, fnName}];
  }
};

// @[method](...args) === @route(method, ...args)
const methods = ['head', 'options', 'get', 'post', 'put', 'patch', 'del', 'delete', 'all'];
methods.forEach(method => exports[method] = route.bind(null, method));

// @controller(path: optional, ...middleware: optional)
export const controller = (...args) => {
  const [path, middleware] = destruct(args);

  return target => {
    const _routes = target.prototype[ROUTES] || [];
    const routes = _routes.map(({method, path, middleware, fnName}) => ({
      method: method === 'del' ? 'delete' : method,
      path,
      middleware,
      fnName
    }));

    target.prototype.$controller = {
      path,
      middleware,
      routes
    };
  };
};
