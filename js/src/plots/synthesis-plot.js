/**
 * Plot of the synthesized signal function f(x).
 * @param {Number} id Id of the signal plot.
 * @returns Public APIs.
 */
let synthesisPlot = function (id) {

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
     * Max amplitude of the synthesized signal.
     */
    let maxAmplitude;

    /**
     * Scale of the y (amplitude) axis.
     */
    let yScale;

    /**
     * Synthesized signal function f(x).
     */
    let synthesizedSignal;

    /**
     * Updates the plot.
     * @param {*} inputSignal Signal function f(x), 
     * @param {*} options 
     */
    publicAPIs.update = function (inputSignal) {
        // Resizes canvas
        publicAPIs.resizeCanvas();

        // Updates the signal function
        synthesizedSignal = inputSignal;

        // Length of the signal
        numPoints = synthesizedSignal.length;

        // Max amplitude of the signal
        maxAmplitude = Math.max(...synthesizedSignal);

        // Sets the scale according to the amplitude
        yScale = 0.4 / maxAmplitude;

        // Draws the plot
        publicAPIs.drawPlot();
    }

    /*_______________________________________
    |   Canvas
    */

    const plot = new plotStructure(id);
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

        ctx.strokeStyle = "#555555";
        ctx.lineWidth = .75;

        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);
        for (let i = 1; i < numPoints; i++) {
            ctx.lineTo(
                i / numPoints * width,
                height - height * (0.5 + yScale * synthesizedSignal[i]));
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