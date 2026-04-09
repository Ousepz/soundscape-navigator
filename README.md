# Soundscape Navigator

**Soundscape Navigator** is an audio-based maze navigation game that trains spatial awareness and directional reasoning. Players navigate through mazes using only sound cues, footsteps, and directional audio signals to reach the goal. It is designed to help improve orientation skills in a safe, interactive way, particularly for visually impaired users.

---

## Setup Instructions

1. **Clone or download the repository**  
   ```bash
   git clone https://github.com/YourUsername/soundscape-navigator.git

2. **Verify all assets are included**  
   Make sure the following files are present in the project folder:  
   - `index.html`  
   - `script.js`  
   - `bell.mp3`  
   - `step.wav`  
   - `hit.mp3`  

3. **Open the game**  
   Open `index.html` in a browser (Ensure your browser allows audio playback.)



## Accessibility Notes

- The game is fully playable with **keyboard controls**.  
  - Arrow keys: Move the player  
  - J: Start or stop the game  
  - F: Pause or resume  
  - H: Help / instructions

- **Screen reader compatible**:  
  - Important game elements such as the current level and status are labeled using ARIA attributes.  
  - Spoken instructions and feedback are provided via the Web Speech API for guidance.

- **Spatial audio cues**:  
  - Goal and obstacles are indicated through 3D audio positioning.  
  - Footstep sounds and wall collision sounds provide directional feedback for navigation.

