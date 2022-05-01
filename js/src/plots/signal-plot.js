/**
 * Plot of the signal function f(x).
 * @param {Number} idNumber Id of the signal plot.
 * @param {*} inputSignal Signal to be drawn.
 * @param {*} options Input options.
 * @returns Public APIs.
 */
let signalPlot = function (idNumber, inputSignal, options = []) {

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
     * Updates the plot.
     * @param {*} inputSignal Signal function f(x), 
     * @param {*} options 
     */
    publicAPIs.updatePlot = function(inputSignal, options) {
        signal = inputSignal;

        numPoints = toDefaultIfUndefined(options.numPoints, 100);
        yScale = toDefaultIfUndefined(options.yScale, 0.2);
    }

    // Creates the plot
    publicAPIs.updatePlot(inputSignal, options);

    /*_______________________________________
    |   HTML elements
    */

    /*_______________________________________
    |   Canvas
    */

    const plot = new plotStructure(idNumber);
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

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.25;

        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);
        for (let i = 1; i < numPoints; i++) {
            ctx.lineTo(
                i / numPoints * width,
                height - height * (0.5 + yScale * signal.valueAt(i / numPoints)));
        }
        ctx.stroke();
    }

    publicAPIs.resizeCanvas();
    publicAPIs.drawPlot();

    // Returns public methods
    return publicAPIs;
}