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
     * Get the absolute value, that is A in A*e^(i*phi)
     * @returns The absolute value.
     */
    abs() {
        return Math.sqrt(this.re * this.re + this.im * this.im);;
    }

    /**
     * Get the phase, that is phi in A*e^(i*phi)
     * @returns The phase.
     */
    phase() {
        return Math.atan2(this.im, this.re);
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
     * Coefficient 1 / (2 * PI * sigma^2).
     */
    let c1 = 1 / Math.sqrt((2 * Math.PI * sigma ** 2));

    /**
     * Coefficient -1 / (2 * PI * sigma^2).
     */
    let c2;

    /**
     * Expected value;
     */
    let mu;

    /**
     * Time scaling factor.
     */
    let timeScale;

    /**
     * Sampled window.
     */
    let sampledWindow = [];

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
        return Math.exp(c2 * Math.pow(x * timeScale - mu, 2));
    }

    /**
     * Update the Gaussian window.
     * @param {Number} sigma Standard deviation.
     * @param {*} options
     */
    publicAPIs.update = (sigma, options) => {
        c2 = - 1 / (2 * Math.pow(sigma, 2));
        mu = toDefaultIfUndefined(options.mu, 0);

        timeScale = toDefaultIfUndefined(musicManager.getTimeScale(), 1);
        sampledWindow = sample(toDefaultIfUndefined(options.N, 1000));
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

            tracksLength[i] = d * timeScale;
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
        let time = x * duration / timeScale;

        if (time > 0 || time < duration / timeScale) {
            let fx = 0;
            let freq = 0;

            tracks.forEach((track, j) => {
                if (time < tracksLength[j] / timeScale) {
                    let i = 0;
                    let dt = 0;

                    while (dt + track[i].d < time && i + 1 < track.length) {
                        dt += track[i].d;
                        i++;
                    };

                    freq = noteToFreq(track[i].note, toDefaultIfUndefined(track[i].oct, 0));
                    fx += track[i].vol // Amplitude
                        * Math.sin((2 * Math.PI * freq / linearSpeed) * (time * timeScale));
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
        linearSpeed = toDefaultIfUndefined(options.linearSpeed, 1);
        timeScale = toDefaultIfUndefined(musicManager.getTimeScale(), 1);

        tracksLength = getTracksLength();
        duration = publicAPIs.getDuration();

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
    let windowFunction;

    /**
     * Sampled points of the window.
     */
    let sampledWindow = [];

    /**
     * Sampled coefficient of the Gabor transform.
     */
    let sampledCoefficient = []

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
     * Number of sampled points.
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
     * Get the number of sampled points of the signal and window.
     * @returns Number of sampled points.
     */
    publicAPIs.getNumPoints = function () {
        return numPoints;
    }

    /**
     * Get the frequency rate.
     * @returns THe frequency rate.
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
     * Updates the pre-computed coefficients.
     * @param {Number} inputFreqRate Frequency rate.
     */
    publicAPIs.updateCoefficients = (inputFreqRate) => {
        freqRate = inputFreqRate;
        for (let i = 0; i < numPoints; i++) {
            sampledCoefficient[i] = [];
            for (let j = 0; j < numPoints; j += freqRate) {
                const phi = - 2 * Math.PI * (i / numPoints * signalDuration)
                    * (range.min - padding + (j / numPoints) * (rangeDiff + padding * 2));
                sampledCoefficient[i][j / freqRate] = new ComplexNumber(Math.cos(phi), Math.sin(phi));
            }
        }
    }

    /**
     * Updates the Gabor transform structure.
     * @param {*} inputSignal Signal function f(x).
     * @param {*} inputWindowFunction Window function g(x).
     * @param {*} options 
     */
    publicAPIs.update = function (inputSignal, inputWindowFunction, options) {
        // Updates the signal and teh window
        signal = inputSignal;
        windowFunction = inputWindowFunction;

        // Updates the duration and range of the singnal
        signalDuration = signal.getDuration();
        range = signal.getRange();
        rangeDiff = range.max - range.min;

        // Updates the zoom level
        padding = toDefaultIfUndefined(options.padding, .1) * rangeDiff;

        // Updates the number of sampled points
        numPoints = toDefaultIfUndefined(options.N, 1200);
        timeRate = options.timeRate;
        dt = signalDuration / numPoints;

        // Updates the sampled signal
        sampledSignal = signal.getSampled(numPoints);
        sampledWindow = windowFunction.getSampled(numPoints);

        // Updates the coefficient
        publicAPIs.updateCoefficients(options.freqRate);
    }

    // Creates the transform manager
    publicAPIs.update(inputSignal, inputWindowFunction, options);

    /**
     * Compute the Gabor transform Vgf(x, omega) for the signal f and the window g at (x, omega).
     * @param {*} x Time coordinate x in Vgf(x, omega).
     * @param {*} omega Frequency coordinate omega in Vgf(x, omega).
     * @returns Vgf(x, omega).
     */
    publicAPIs.gaborAt = (x, omega) => {
        let vgf = new ComplexNumber(0, 0);

        for (let t = 0; t < numPoints; t++) {
            // Coefficient e^(-2 * PI * t * omega)
            const c = sampledCoefficient[t][omega];
            // f(t)
            const f = sampledSignal[t];
            // g(t - x)
            const g = sampledWindow[numPoints + t - x];

            // Integral of coefficient * f * g * dt
            vgf.add(c.scale(f * g * dt));
        }

        return vgf;
    }

    publicAPIs.fourierAt = (omega) => {
        let ff = new ComplexNumber(0, 0);

        for (let t = 0; t < numPoints; t++) {
            // Coefficient e^(-2 * PI * t * omega)
            const c = sampledCoefficient[t][omega];
            // f(t)
            const f = sampledSignal[t];

            ff.add(c.scale(f * dt));
        }

        return ff;
    }

    return publicAPIs;
}