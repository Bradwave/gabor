# A Gabor Transform Implementation

This simple implementation of the Gabor transform (or short time Fourier transform, STFT) allows a musical signal to be analyzed via its spectrogram. Moreover, it is possibile to use two windows to analyze the signal.

The following parameters can be modified.

For `signal`:
- `N` is the number of sampled points for both the signal and the windows;
- `time-scale` controls the length of the signal.

For `window`:
- `sigma-1` is the standard deviation of the first window function;
- `sigma-2` is the s.d. for the second window, disables the second window if set to `no`.

For `gabor`:
- `N` is the number of steps in the integration;
- `t-rate` controls the number of subdivision in the time axis of the plot;
- `f-rate` controls the number of subdivision in the frequency axis of the plot;
- `zoom` controls the amount of time-frequency space control.