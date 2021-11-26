// We know what a state is, it's any shape of data that is relevant to your application

const state = {
  region: {
    city: 'Waterloo',
    state: 'Ontario',
    country: 'CA',
  },
  band: 'fm',
  channel: 88,
  audio: null,
};

// State machines must contain a state, and must take inputs (called "transitions")

const transitions = {
  changeRegion: (city, state, country) => (previousState) => ({ ...previousState, region: { city, state, country } }),
  changeChannel: (channel) => (previousState) => ({ ...previousState, channel }),
  changeBand: (band) => (previousState) => ({ ...previousState, band }),
  setAudio: (audio) => (previousState) => ({ ...previousState, audio }),
};

// State machines can contain acceptors, boolean logic whether a transition is valid

const acceptors = [
  function isBandValid(state) {
    return ['am', 'fm'].includes(state.band);
  },
  function isChannelAvailableInBand(state) {
    return state.band === 'fm'
      ? state.channel === Math.max(88, Math.min(108, state.channel))
      : state.channel === Math.max(540, Math.min(1700, state.channel))
  },
];

// State machines can also contain transducers

const transducers = {
  'findStream': (state) => {
    return radioApi.search({
      countrycode: state.region.country,
      state: state.region.state,
      name: `${state.channel} ${state.band}`,
    })
      .then((results) => {
        const audio = new Audio();
        audio.src = results[0].url_resolved;
        return new Promise((resolve, reject) => {
          audio.onload = () => resolve(audio);
          audio.onerror = (error) => reject(error);
        });
      })
  },
};

// Maybe a magic class/interface for a state machine could look like this

const stateMachine = new StateMachine({
  state,
  acceptors,
  transducers,
  transitions,
});

// If we find a stream, play it
stateMachine.subscribe('findStream', (audio, state) => {
  if (state.audio) {
    state.audio.stop();
  }
  audio.start();
  stateMachine.transition('setAudio', audio);
});

// Transition to the channel (classical masterpieces in Toronto)
stateMachine.transition('changeBand', 'fm');
stateMachine.transition('changeChannel', 96.3);
