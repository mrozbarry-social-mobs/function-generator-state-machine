// Generator functions are great for incapsulating state values
function *generatorWithState() {
  let incapsulatedState = 0;

  while (true) {
    yield incapsulatedState;
    incapsulatedState++;
  }
}


// And you can give generator functions data, too
function *generatorWithInitializer(initialValue) {
  let value = initialValue;

  while (true) {
    yield value;
    value++;
  }
}


// But wait, you can do weird and interesting things, too
function *weirdAndInteresting(initialValue) {
  let value = initialValue;
  console.log('weirdAndInteresting.initial', value);

  while (true) {
    const fn = yield value;
    value = fn(value);
    console.log('weirdAndInteresting.updated', value);
  }
}
const addTwo = (previousValue) => previousValue + 2;
weirdAndInteresting(1).next(addTwo);


// Cool, what about injecting functionality into the state machine
function *rudamentaryStateMachine(initialState, middlewares = []) {
  let state = initialState;
  while (true) {
    yield state;
    let nextState = state + 1;
    for (let middleware of middlewares) {
      nextState = middleware(nextState, state, transitionFn) || nextState;
    }
    state = nextState;
  }
}
const exposeMiddleware = (callback) => (nextState, _state, _transition) => callback(nextState);
rudamentaryStateMachine(
  100,
  [
    exposeMiddleware(console.log),
  ]
).next(
  (previousState) => ({ ...previousState, count: count + 1 }),
);
