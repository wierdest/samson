# [samson](https://wierdest.github.io/samson)
## Simple drum track player for musical practice.
I play the guitar, so I thought why not build something I can use?
It was hard to find a simple drum track player, that simply worked out of the box.
Going on YouTube and trying to find drum tracks was becoming too annoying.
## This prototype is a learning project made with...
- TypeScript; 
- Angular; 
- WebAudio;
- IndexedDB;
- Tensorflow.js;
## It features...
- a few selected drum tracks presented in a searchable table component.
- simple audio visualizations.
- a 3-band equalizer.
- a compressor.
- a [Teachable Machine](https://teachablemachine.withgoogle.com/) pose model to allow gesture controls.

### How gesture control works...
- Tilt your head to the right
- Depending on the state of the player, it will **add** a track, **fade** it **in** or **fade** it **out** and **remove** it.

## There's still a lot to be implemented! Here's what I have in mind:
- Adding original tracks by local artists
- Finishing up some general functionality that is, I'm sure you have noticed, still missing: Repeat, Favorite, Edit buttons have yet to be implemented.
- Improving the pose model, this one was made in less than 5 minutes!
- Adding the ability to train the user's own pose model **probably the next thing I will try!**
- Better audio visualizations.
- Custom theming
- Different players for different drum track styles



