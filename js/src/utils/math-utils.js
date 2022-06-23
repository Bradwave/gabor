/**
 * Complex number a + ib.
 */
class ComplexNumber {

    /**
     * Constructor for the complex number a + ib.
     * @param {Number} a Real value a.
     * @param {*} b Imaginary coefficient b.
     */
    constructor(a, b) {
        this.re = a;
        this.im = b
    }

    /**
     * Add z to the current number.
     * @param {ComplexNumber} z Number to be added.
     */
    add(z) {
        this.re += z.re;
        this.im += z.im;
    }

    /**
     * Multiply the current number by z and returns the result.
     * @param {ComplexNumber} z Complex umber to be multiplied by.
     * @returns Result of the multiplication.
     */
    multiply(z) {
        return new ComplexNumber(
            this.re * z.re - this.im * z.im,
            this.re * z.im + this.im * z.re
        );
    }

    /**
     * Scale current number by a real factor r.
     * @param {Number} r Real factor to be scaled by.
     * @returns The scaled complex number.
     */
    scale(r) {
        return new ComplexNumber(this.re * r, this.im * r);
    }

    /**
     * Divide the current number by a real number r and returns the result.
     * @param {Number} r Real number to be divided by.
     * @returns Result of the division.
     */
    divide(r) {
        return new ComplexNumber(this.re / r, this.im / r);
    }

    /**
     * Get the conjugate.
     * @returns The conjugate.
     */
    conj() {
        return new ComplexNumber(this.re, -this.im);
    }

    /**
     * Get the absolute value, that is A in A*e^(i*phi)
     * @returns The absolute value.
     */
    abs() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }

    /**
     * Get the phase, that is phi in A*e^(i*phi)
     * @returns The phase.
     */
    phase() {
        return Math.atan2(this.im, this.re);
    }

    /**
     * Get the ral part.
     * @returns The real part.
     */
    real() {
        return this.re;
    }

}

/**
 * Gaussian window function g(x).
 * @param {*} sigma Standard deviation.
 * @param {*} mu Expected value.
 */
let gaussianWindow = function (sigma, options = []) {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /**
     * Coefficient -1 / a.
     */
    let c;

    /**
     * Sampled window.
     */
    let sampledWindow = [];

    /**
     * Duration.
     */
    let duration;

    /**
     * Time scale.
     */
    let timeScale;

    /**
     * Get the number of sampled points.
     * @returns The number of sampled points.
     */
    publicAPIs.getNumPoints = function () {
        return sampledWindow.length / 2;
    }

    /**
     * Get the sampled window.
     * @param {Number} N Number of points to be sampled.
     * @returns The sampled window.
     */
    publicAPIs.getSampled = (N = undefined) => {
        if (typeof N === 'undefined') {
            return sampledWindow;
        } else {
            return (N == sampledWindow.length) ? sampledWindow : sample(N);
        }
    }

    /**
     * Samples the window.
     * @param {Number} N Number of points to be sampled.
     * @returns The sampled window.
     */
    const sample = (N) => {
        let sampledWindow = [];
        for (let i = 0; i < 2 * N; i++) {
            sampledWindow[i] = publicAPIs.valueAt(- 2 + 2 * i / N);
        }
        return sampledWindow;
    }

    /**
     * Get value of Gaussian window g(x) for x.
     */
    publicAPIs.valueAt = (x) => {
        return Math.exp(c * Math.pow(x * duration, 2));
    }

    /**
     * Update the Gaussian window.
     * @param {Number} sigma Standard deviation.
     * @param {*} options
     */
    publicAPIs.update = (sigma, options) => {
        // Duration of the signal
        duration = options.L;

        // Time scale
        timeScale = toDefaultIfUndefined(musicManager.getTimeScale(), 1);

        c = - 1 / (2 * Math.PI * Math.pow(sigma, 2) * timeScale);

        // timeScale = toDefaultIfUndefined(musicManager.getTimeScale(), 1);
        sampledWindow = sample(toDefaultIfUndefined(options.N, publicAPIs.getNumPoints()));
    }

    // Creates the window.
    publicAPIs.update(sigma, options);

    // Returns public methods
    return publicAPIs;
}

/**
 * Musical signal f(x)
 * @param {*} inputTracks 
 * @param {*} options 
 */
let musicSignal = function (inputTracks, options = []) {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /**
     * Tracks for the signal.
     */
    let tracks;

    /**
     * Frequency of the fundamental A note (in Hz).
     */
    let baseFreq;

    /**
     * Track duration.
     */
    let duration;

    /**
     * Duration of the isolated tracks.
     */
    let tracksLength = [];

    /**
     * Time scale factor.
     */
    let timeScale;

    /**
     * Noise factor.
     */
    let noiseFactor;

    /**
     * Sampled points.
     */
    let sampledSignal = [];

    /**
     * Returns time duration of the music signal.
     */
    publicAPIs.getDuration = function () {
        return Math.max(...tracksLength);
    }

    /**
     * Returns the length of each track.
     */
    const getTracksLength = function () {
        let tracksLength = [];

        tracks.forEach((track, i) => {
            let d = 0;

            track.forEach(note => {
                d += note.d;
            })

            tracksLength[i] = d;
        });

        return tracksLength;
    }

    /**
     * Get the frequency range of the signal.
     * @returns The frequency range.
     */
    publicAPIs.getRange = function () {
        let minFreq = Infinity;
        let maxFreq = 0;

        tracks.forEach(track => {
            track.forEach(note => {
                freq = noteToFreq(note.note, toDefaultIfUndefined(note.oct, 0));
                minFreq = freq < minFreq ? freq : minFreq;
                maxFreq = freq > maxFreq ? freq : maxFreq;
            });
        });

        return { min: minFreq, max: maxFreq };
    }

    /**
     * Get the amplitude of the signal.
     * @returns Amplitude of the signal.
     */
    publicAPIs.getAmp = function () {
        let maxPoint = 0;
        sampledSignal.forEach(point => {
            maxPoint = point > maxPoint ? point : maxPoint;
        })
        return maxPoint;
    }

    /**
     * Get the number of sampled points.
     * @returns The number of sampled points.
     */
    publicAPIs.getNumPoints = function () {
        return sampledSignal.length;
    }

    /**
     * Get the sampled version of the signal.
     * @param {Number} N Number of points to be sampled.
     * @returns The sampled signal.
     */
    publicAPIs.getSampled = (N = undefined) => {
        if (typeof N === 'undefined') {
            return sampledSignal;
        } else {
            return (N == sampledSignal.length) ? sampledSignal : sample(N)
        }
    }

    /**
     * Samples the signal.
     * @param {Number} N Number of points to be sampled.
     * @returns The sampled signal.
     */
    const sample = (N) => {
        let sampledSignal = [];
        for (let i = 0; i < N; i++) {
            sampledSignal[i] = publicAPIs.valueAt(i / N);
        }
        return sampledSignal;
    }

    /**
     * Get value of the music signal f(x) for x ∈ [0, 1].
     */
    publicAPIs.valueAt = (x) => {
        let time = x * duration;

        if (time > 0 || time < duration) {
            let fx = 0;
            let freq = 0;

            tracks.forEach((track, j) => {
                if (time < tracksLength[j]) {
                    let i = 0;
                    let dt = 0;

                    while (dt + track[i].d < time && i + 1 < track.length) {
                        dt += track[i].d;
                        i++;
                    };

                    freq = noteToFreq(track[i].note, toDefaultIfUndefined(track[i].oct, 0));
                    let expCoefficient = Math.exp(- Math.PI
                        * Math.pow(2 * ((time - dt) / track[i].d - 1 / 2), 12));
                    fx += expCoefficient * track[i].vol // Amplitude
                        * (Math.sin(2 * Math.PI * freq * time)
                            + noiseFactor * Math.random());
                }
            });
            return fx;
        } else {
            return 0;
        }
    }

    /**
     * Get the frequency of a note, according to the base frequency.
     * @param {String} note Name of the note.
     * @param {Number} octave ID of the octave.
     * @returns The frequency of the note (in Hz).
     */
    const noteToFreq = (note, octave) => {
        return baseFreq * Math.pow(2, octave + 1 / 12 * musicManager.getNote(note));
    }

    /**
     * Updates the signal.
     * @param {*} options
     */
    publicAPIs.update = (inputTracks, options = []) => {
        tracks = inputTracks;

        baseFreq = toDefaultIfUndefined(options.baseFreq, 1);
        timeScale = toDefaultIfUndefined(musicManager.getTimeScale(), 1);

        tracksLength = getTracksLength();
        duration = publicAPIs.getDuration();

        noiseFactor = toDefaultIfUndefined(options.noiseFactor, 0.1);

        sampledSignal = sample(toDefaultIfUndefined(options.N, 1000));
    }

    // Creates the signal.
    publicAPIs.update(inputTracks, options);

    // Returns public methods
    return publicAPIs;
}

/**
 * Gabor transform structure.
 * @param {*} inputSignal Signal function f(x).
 * @param {*} inputWindowFunction Window function g(x).
 * @param {*} options 
 * @returns Public APIs.
 */
let transformManager = function (inputSignal, inputWindowFunction, options = []) {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /**
     * Input signal f(x).
     */
    let signal;

    /**
     * Sampled points of the signal.
     */
    let sampledSignal = [];

    /**
     * Window function g(x).
     */
    let windowFunction1;

    /**
     * Second window function.
     */
    let windowFunction2;

    /**
     * Sampled points of the window.
     */
    let sampledWindow1 = [];

    /**
     * Sampled coefficient of the Gabor transform.
     */
    let sampledCoefficient = []

    /**
     * Sampled and scaled spectrogram.
     */
    let sampledSpectrum1 = [];

    /**
    * Sampled and scaled spectrogram for the second window.
    */
    let sampledSpectrum2 = [];

    /**
     * Duration of the signal.
     */
    let signalDuration;

    /**
     * Padding for the frequency axis.
     */
    let padding;

    /**
     * Frequency range [min, max] of the signal.
     */
    let range;

    /**
     * Value of the frequency range of the signal.
     */
    let rangeDiff;

    /**
     * Number of sampled time points.
     */
    let numPoints;

    /**
     * Rate of sampled frequency points.
     */
    let freqRate;

    /**
     * Rate of sampled time points.
     */
    let timeRate;

    /**
     * dt increment for numerical integration.
     */
    let dt;

    /**
     * True if two windows are used, false otherwise.
     */
    let useTwoWindows;

    /**
     * Maximum spectrum value.
     */
    let maxSpectrum;

    /**
     * Denoise factor;
     */
    let denoiseFactor;

    /**
     * True if the spectrogram is processed, false otherwise.
     */
    let isProcessed;

    /**
     * Get the number of sampled points of the signal and window.
     * @returns Number of sampled points.
     */
    publicAPIs.getNumPoints = function () {
        return numPoints;
    }

    /**
     * Get the time rate.
     * @returns The time rate.
     */
    publicAPIs.getTimeRate = function () {
        return timeRate;
    }

    /**
     * Get the frequency rate.
     * @returns The frequency rate.
     */
    publicAPIs.getFreqRate = function () {
        return freqRate;
    }

    /**
     * Get the signal to be transformed.
     * @returns The signal.
     */
    publicAPIs.getSignal = function () {
        return signal;
    }

    /**
     * Get the padding.
     * @returns The padding.
     */
    publicAPIs.getPadding = function () {
        return padding;
    }

    /**
     * Sets the processing status.
     * @param {Boolean} isSpectrogramProcessed True if the the spectrogram is processed.
     */
    publicAPIs.setProcessedSynthesis = function (isSpectrogramProcessed) {
        isProcessed = isSpectrogramProcessed;
    }

    /**
     * Sets the two windows transform status.
     * @param {Boolean} inputUseTwoWindows True if two windows are used, false otherwise.
     */
    publicAPIs.setUseTwoWindows = (inputUseTwoWindows) => {
        useTwoWindows = inputUseTwoWindows;
        publicAPIs.updateSpectrogram();
    }

    /**
     * Updates the Gabor transform structure.
     * @param {*} inputSignal Signal function f(x).
     * @param {*} inputWindowFunction Window function g(x).
     * @param {*} options 
     */
    publicAPIs.update = function (inputSignal, inputWindowFunction, options) {
        // Updates the signal and the windows
        signal = inputSignal;
        windowFunction1 = inputWindowFunction;
        windowFunction2 = toDefaultIfUndefined(options.window2, windowFunction1);

        // Updates the duration and range of the signal
        signalDuration = signal.getDuration();
        range = signal.getRange();
        rangeDiff = range.max - range.min;

        // Updates the zoom level
        padding = toDefaultIfUndefined(options.padding, .1) * rangeDiff;

        // Updates the number of sampled points
        numPoints = toDefaultIfUndefined(options.N, 1200);
        timeRate = toDefaultIfUndefined(options.timeRate, 1);
        freqRate = toDefaultIfUndefined(options.freqRate, 1);
        dt = signalDuration / numPoints;

        // Updates the sampled signal and windows
        sampledSignal = signal.getSampled(numPoints);
        sampledWindow1 = windowFunction1.getSampled(numPoints);
        sampledWindow2 = windowFunction2.getSampled(numPoints);

        // Use two windows
        useTwoWindows = toDefaultIfUndefined(options.useTwoWindows, false);

        // Denoise factor
        denoiseFactor = toDefaultIfUndefined(options.denoiseFactor, 0.1);

        // Processing status
        isProcessed = toDefaultIfUndefined(options.isProcessed, false);

        // Updates the coefficient
        publicAPIs.updateCoefficients();

        // Updates the spectrogram
        publicAPIs.updateSpectrogram();
    }

    /**
     * Updates the pre-computed coefficients.
     * @param {Number} inputFreqRate Frequency rate.
     */
    publicAPIs.updateCoefficients = () => {
        for (let i = 0; i < numPoints; i++) {
            sampledCoefficient[i] = [];
            for (let j = 0; j < numPoints; j += freqRate) {
                // const phi = - 2 * Math.PI * (i / numPoints * signalDuration)
                //     * (range.min - padding + (j / numPoints) * (rangeDiff + padding * 2));
                const phi = - 2 * Math.PI * (i / numPoints * signalDuration)
                    * (range.min - padding + j / numPoints * (range.max + padding));
                sampledCoefficient[i][j / freqRate] = new ComplexNumber(Math.cos(phi), Math.sin(phi));
            }
        }
    }

    publicAPIs.updateSpectrogram = () => {
        for (let i = 0; i < numPoints; i += timeRate) {
            sampledSpectrum1[i / timeRate] = [];
            sampledSpectrum2[i / timeRate] = [];
            for (let j = 0; j < numPoints; j += freqRate) {
                let sampledGabor = publicAPIs.gaborAt(i, j / freqRate);
                sampledSpectrum1[i / timeRate][j / freqRate] = sampledGabor.vgf1;
                sampledSpectrum2[i / timeRate][j / freqRate] =
                    sampledGabor.vgf2.multiply(sampledGabor.vgf1);
            }
        }
    }

    /**
     * Compute the Gabor transform Vgf(x, omega) for the signal f and the window g at (x, omega).
     * @param {*} x Time coordinate x in Vgf(x, omega).
     * @param {*} omega Frequency coordinate omega in Vgf(x, omega).
     * @returns Vgf(x, omega).
     */
    publicAPIs.gaborAt = (x, omega) => {
        let vgf1 = new ComplexNumber(0, 0);
        let vgf2 = new ComplexNumber(0, 0);

        for (let t = 0; t < numPoints; t++) {
            // Coefficient e^(-2 * PI * t * omega)
            const c = sampledCoefficient[t][omega];
            // f(t)
            const f = sampledSignal[t];
            // g(t - x)
            const g1 = sampledWindow1[numPoints + t - x];
            // g2(t - x)
            const g2 = sampledWindow2[numPoints + t - x];

            // Integral of coefficient * f * g * dt
            vgf1.add(c.scale(f * g1));
            // Integral of coefficient * f * g * dt
            vgf2.add(c.scale(f * g2));
        }

        return {
            vgf1: vgf1.divide(1 / dt),
            vgf2: vgf2.divide(1 / dt)
        };
    }

    publicAPIs.fourierAt = (omega) => {
        let ft = new ComplexNumber(0, 0);

        for (let t = 0; t < numPoints; t++) {
            // Coefficient e^(-2 * PI * t * omega)
            const c = sampledCoefficient[t][omega];
            // f(t)
            const f = sampledSignal[t];

            ft.add(c.scale(f));
        }

        return ft.divide(1 / dt);
    }

    publicAPIs.getScaledSpectrogram = () => {
        let spectrum = useTwoWindows ? sampledSpectrum2 : sampledSpectrum1;

        let scaledSpectrogram = [];

        spectrum.forEach((a, i) => {
            scaledSpectrogram[i] = [];
            a.forEach((b, j) => {
                scaledSpectrogram[i][j] = b.abs();
            });
        });

        var maxRow = scaledSpectrogram.map(row => {
            return Math.max.apply(Math, row);
        });
        maxSpectrum = Math.max(...maxRow);

        scaledSpectrogram.forEach((a, i) => {
            a.forEach((b, j) => {
                const c = b / maxSpectrum;
                scaledSpectrogram[i][j] = isProcessed ?
                    (c < denoiseFactor ? 0 : c) : c;
            })
        })

        return scaledSpectrogram;
    }

    publicAPIs.synthesizeSignal = () => {
        let synthesizedSignal = [];

        for (let t = 0; t < numPoints; t++) {
            synthesizedSignal[t] = publicAPIs.inverseGaborAt(t).real();
        }

        return synthesizedSignal;
    }

    publicAPIs.inverseGaborAt = (t) => {
        let f = new ComplexNumber(0, 0);

        for (let omega = 0; omega < numPoints; omega += freqRate) {
            const c = sampledCoefficient[t][omega / freqRate].conj();

            let spectrum = useTwoWindows ?
                sampledSpectrum2[Math.floor(t / timeRate)][omega / freqRate] :
                sampledSpectrum1[Math.floor(t / timeRate)][omega / freqRate];

            spectrum = isProcessed ? ((spectrum.abs() / maxSpectrum < denoiseFactor) ?
                new ComplexNumber(0, 0) : spectrum) : spectrum;

            f.add(spectrum.multiply(c));
        }

        return f.divide(numPoints / freqRate);
    }

    publicAPIs.cutSpectrogram = (t1, t2, omega1, omega2) => {
        console.log(t1 + ", " + t2 + "; " + omega1 + ", " + omega2)

        for (let i = Math.round(t1 * numPoints);
            i < Math.round(t2 * numPoints); i += timeRate) {
            for (let j = Math.round(omega1 * numPoints);
                j < Math.round(omega2 * numPoints); j += freqRate) {

                sampledSpectrum1[Math.floor(i / timeRate)][Math.floor(j / freqRate)]
                    = new ComplexNumber(0, 0);
                sampledSpectrum2[Math.floor(i / timeRate)][Math.floor(j / freqRate)]
                    = new ComplexNumber(0, 0);
            }
        }
    }

    // Creates the transform manager
    publicAPIs.update(inputSignal, inputWindowFunction, options);

    return publicAPIs;
}