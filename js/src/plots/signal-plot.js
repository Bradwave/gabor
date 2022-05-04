/**
 * Plot of the signal function f(x).
 * @param {Number} idNumber Id of the signal plot.
 * @returns Public APIs.
 */
 let signalPlot = function (idNumber) {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /*_______________________________________
    |   Resizing variables
    */

    /**
     * Width of the plot.
     */
    let width;

    /**
     * Height of the plot.
     */
    let height;

    /*_______________________________________
    |   General variables
    */

    /**
     * Number of sample points;
     */
    let numPoints;

    /**
     * Scale of the y (amplitude) axis.
     */
    let yScale;

    /**
     * Signal function f(x).
     */
    let signal;

    /**
     * Sampled signal.
     */
    let sampledSignal;

    /**
     * Updates the plot.
     * @param {*} inputSignal Signal function f(x), 
     * @param {*} options 
     */
    publicAPIs.update = function (inputSignal, options) {
        // Resizes canvas
        publicAPIs.resizeCanvas();

        // Updates the signal function
        signal = inputSignal;

        // Updates sampled window and signal
        if (typeof options.N === 'undefined') {
            numPoints = signal.getNumPoints();
            sampledSignal = signal.getSampled();
        } else {
            numPoints = options.N;
            sampledSignal = signal.getSampled(numPoints);
        }

        // Sets the scale according to the amplitude
        yScale = toDefaultIfUndefined(options.yScale, 0.4 / signal.getAmp());

        // Draws the plot
        publicAPIs.drawPlot();
    }

    /*_______________________________________
    |   Canvas
    */

    const plot = new plotStructure(idNumber, { alpha: false });
    const ctx = plot.getCtx();

    /**
     * Resize the canvas to fill the HTML canvas element.
     */
    publicAPIs.resizeCanvas = () => {
        plot.resizeCanvas();

        width = plot.getWidth();
        height = plot.getHeight();
    }

    /**
     * Draws the plot.
     */
    publicAPIs.drawPlot = () => {
        // Clears the canvas
        ctx.clearRect(0, 0, width, height);

        publicAPIs.clearPlot();

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.25;

        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);
        for (let i = 1; i < numPoints; i++) {
            ctx.lineTo(
                i / numPoints * width,
                height - height * (0.5 + yScale * sampledSignal[i]));
        }
        ctx.stroke();
    }

    /**
     * Clears the plot.
     */
     publicAPIs.clearPlot = () => {
        ctx.fillStyle = "#ffffff";

        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.fill();
        ctx.closePath();
    }

    // Returns public methods
    return publicAPIs;
}