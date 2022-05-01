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
let gaussianWindow = function (sigma, mu = 0) {

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
    let c2 = - 1 / (2 * Math.pow(sigma, 2));

    /**
     * Get value of Gaussian window g(x) for x.
     */
    publicAPIs.valueAt = (x, timeScale = 1) => {
        return Math.exp(c2 * Math.pow(x * timeScale - mu, 2));
    }

    // Returns public methods
    return publicAPIs;
}

/**
 * Musical signal f(x)
 * @param {*} tracks 
 * @param {*} options 
 */
let musicSignal = function (tracks, options = []) {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /**
     * Frequency of the fundamental A note (in Hz).
     */
    let baseFreq;

    /**
     * Track duration.
     */
    let duration;

    /**
     * Time scale.
     */
    let timeScale;

    /**
     * Returns time duration of the music signal.
     */
    publicAPIs.getDuration = function () {
        let duration = 0;

        tracks.forEach(track => {
            let d = 0;

            track.forEach(note => {
                d += note.d;
            })

            if (d > duration) duration = d;
        });

        return duration * timeScale;
    }

    /**
     * Get the time scale of the signal.
     * @returns Time scale.
     */
    publicAPIs.getTimeScale = function () {
        return timeScale;
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
     * Updates the signal.
     * @param {*} options
     */
    publicAPIs.update = (options = []) => {
        baseFreq = toDefaultIfUndefined(options.baseFreq, 1);
        linearSpeed = toDefaultIfUndefined(options.linearSpeed, 1);
        timeScale = toDefaultIfUndefined(options.timeScale, 1);

        duration = publicAPIs.getDuration();
    }

    // Creates the signal.
    publicAPIs.update(options);

    /**
     * Get value of the music signal f(x) for x ∈ [0, 1].
     */
    publicAPIs.valueAt = (x) => {
        let time = x * duration / timeScale;

        if (time > 0 || time < duration) {
            let fx = 0;
            let freq = 0;

            tracks.forEach(track => {
                let i = 0;
                let dt = 0;

                while (dt + track[i].d < time && i + 1 < track.length) {
                    dt += track[i].d;
                    i++;
                };

                freq = noteToFreq(track[i].note, toDefaultIfUndefined(track[i].oct, 0));
                fx += track[i].vol // Amplitude
                    * Math.sin((2 * Math.PI * freq / linearSpeed) * (time * timeScale));
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
        return baseFreq * Math.pow(2, octave + 1 / 12 * notesMap.get(note));
    }


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
let gaborTransformStructure = function (inputSignal, inputWindowFunction, options = []) {

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
     * Updates the Gabor transform structure.
     * @param {*} inputSignal Signal function f(x).
     * @param {*} inputWindowFunction Window function g(x).
     * @param {*} options 
     */
    publicAPIs.update = function (inputSignal, inputWindowFunction, options) {
        signal = inputSignal;
        windowFunction = inputWindowFunction;

        signalDuration = signal.getDuration();
        range = signal.getRange();
        // rangeDiff = 2 * range.max * (1 + padding);
        rangeDiff = range.max - range.min;
        padding = toDefaultIfUndefined(options.padding, .1) * rangeDiff;

        numPoints = toDefaultIfUndefined(options.N, 400);
        freqRate = options.freqRate;
        timeRate = options.timeRate;
        dt = signalDuration / numPoints;

        for (let i = 0; i < 2 * numPoints; i++) {
            sampledCoefficient[i] = [];

            sampledWindow.push(
                windowFunction.valueAt(- 2 + 2 * i / (numPoints), signal.getTimeScale())
            );

            if (i < numPoints) {
                sampledSignal.push(signal.valueAt(i / numPoints));

                for (let j = 0; j < numPoints; j += freqRate) {
                    const phi = - 2 * Math.PI * (i / numPoints * signalDuration)
                        // * (- range.max * (1 + padding) + omega * rangeDiff));
                        * (range.min - padding + (j / numPoints) * (rangeDiff + padding * 2));
                    sampledCoefficient[i][j / freqRate] = new ComplexNumber(Math.cos(phi), Math.sin(phi));
                }
            }
        }
    }

    publicAPIs.update(inputSignal, inputWindowFunction, options);

    /**
     * Compute the Gabor transform Vgf(x, omega) for the signal f and the window g at (x, omega).
     * @param {*} x Time coordinate x in Vgf(x, omega).
     * @param {*} omega Frequency coordinate omega in Vgf(x, omega).
     * @returns Vgf(x, omega).
     */
    publicAPIs.valueAt = (x, omega) => {
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

    return publicAPIs;
}