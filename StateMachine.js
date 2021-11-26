
export function StateMachine({ initialState, transitions, transducers = {}, acceptors = [] }) {
  const transducerStorage = new Map(Object.keys(transducers).map(t => [
    transducers[t],
    { subscribers: [], previousResult: undefined },
  ]));

  const willAccept = (nextState) => acceptors.every(fn => fn(nextState));

  const subscribe = (transducerName, callback) => {
    const transducer = transducers[transducerName];
    if (!transducer) return () => {};

    const storage = transducerStorage.get(transducer);

    storage.subscribers.push(callback);
  };

  const transition = (transitionName, ...args) => {
    const transitionFn = transitions[transitionName];
    if (!transitionFn) {
      return;
    }
    console.log('transition', transitionName, ...args);

    return stateIterator.next(transitionFn(...args)).value;
  };

  function *stateMachineGenerator(initialState, willAccept) {
    let state = initialState;

    while (true) {
      const transition = yield state;
      if (!transition) continue;

      const nextState = transition(state);
      if (!willAccept(nextState)) continue;

      Object.keys(transducers).forEach(key => {
        const transducer = transducers[key];
        Promise.resolve(transducer(state))
          .then((result) => {
            const storage = transducerStorage.get(transducer);
            if (storage.previousResult == result) return;

            console.log('emit', transducer.fn);
            storage.subscribers.forEach(fn => fn(result, nextState, state))
            storage.previousResult = result;
          })
          .catch((err) => {
            console.warn('transducer error', transducer.fn, err);
          });
      });

      state = nextState;
    }
  }

  const stateIterator = stateMachineGenerator(
    initialState,
    willAccept,
  );
  stateIterator.next();

  return {
    transition,
    subscribe,
  };
}
