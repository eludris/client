const facts = [
  'Eludritians are eldritch demons who do not need sleep, this is why it is okay for us to be sleep deprived, no, you do not need to call Health & Safety.',
  'Thang >>>> other mascots',
  'We need more of these',
  '100% of the people who saw this screen have used Eludris at least once',
  'Why are we still here?',
  '```',
  "So you're telling me a morb fried this rice???",
  'What the heck is a mile',
  'Eludris is factually better than Disco- well, maybe not yet',
  'I am the storm that is approaching',
  'Coffee is kinda pog',
  'The name pengin originally started as a joke about linux users while watching <a href="https://cdn.eludris.gay/static/pengin.mp4" target="_blank">this video</a> on loop',
  'faust knows all outcomes',
  'ggVG is a sensible keybind.'
];

export function load() {
  return {
    fact: facts[Math.floor(Math.random() * facts.length)]
  };
}
