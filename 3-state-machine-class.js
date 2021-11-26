import { StateMachine } from './StateMachine.js';

const radioApi = {
  search: (_params) => {
    // TODO: use a real API
    return Promise.resolve([{
      url_resolved: 'https://mpc.mediacp.eu/stream/aclassicalmasterpiecesradio',
    }]);
  },
};

const clamp = (min, max, value) => Math.max(min, Math.min(max, value));

const stateMachine = new StateMachine({
  initialState: {
    region: {
      city: 'Waterloo',
      state: 'Ontario',
      country: 'CA',
    },
    band: 'fm',
    channel: 88,
  },
  acceptors: [
    function isBandValid(state) {
      return ['am', 'fm'].includes(state.band);
    },
    function isChannelAvailableInBand(state) {
      return state.band === 'fm'
        ? state.channel === clamp(88, 108, state.channel)
        : state.channel === clamp(540, 1700, state.channel)
    },
  ],
  transducers: {
    'findStream': (state) => {
      return radioApi.search({
        countrycode: state.region.country,
        state: state.region.state,
        name: `${state.channel} ${state.band}`,
      })
        .then((results) => results[0].url_resolved)
    },
  },
  transitions: {
    changeRegion: (city, state, country) => (previousState) => ({ ...previousState, region: { city, state, country } }),
    changeChannel: (channel) => (previousState) => ({ ...previousState, channel }),
    changeBand: (band) => (previousState) => ({ ...previousState, band }),
  },
});

// If we find a stream, play it
stateMachine.subscribe('findStream', (url, state, prevState) => {
  const audio = document.querySelector('#audio');
  audio.src = url;
  audio.play();
});

document.querySelector('#tune').addEventListener('click', (e) => {
  e.preventDefault();
  // Transition to the channel (classical masterpieces in Toronto)
  stateMachine.transition('changeBand', 'fm');
  stateMachine.transition('changeChannel', 96.3);
});
