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
  'Faust knows all outcomes',
  'The name pengin (old client name) originally started as a joke about linux users while watching <a href="https://cdn.eludris.com/static/pengin.mp4" target="_blank">this video</a> on loop',
  'ggVG is a sensible keybind.',
  "It's been a long night and I can feel your anger",
  'wei wei wei wei',
  'The only thing that you gotta know is that I do what it takes do what it takes!',
  'KEI <img class="emoji" draggable="false" alt="🏋" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f3cb.svg" title="🏋"> NARIO <img class="emoji" draggable="false" alt="🤸‍♂️" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f938-200d-2642-fe0f.svg" title="🤸‍♂️"> NAZASU <img class="emoji" draggable="false" alt="💪" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f4aa.svg" title="💪">',
  'This is getting a bit Derailed',
  "It's quite sad- it's quite sad...",
  'Life is a row of blocks in a menagerie of knights on a funny ark',
  "Guys I'm a lobster",
  'Bob Bobster',
  '<span style="background-color: hsl(235 calc(1*85.6%) 64.7%/0.3); padding: 0 2px; border-radius: 3px;">@Duffelbag</span> eval',
  'One two three four five once I caught a fish alive',
  "There's a secret magical hidden /setting/reset-theme route for when the epic theme from untrusted sources you install makes your client unusable!",
];

export function load() {
  return {
    fact: facts[Math.floor(Math.random() * facts.length)]
  };
}
