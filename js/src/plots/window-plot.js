/**
 * Plot of the window function g(x).
 * @param {Number} idNumber Id of the signal plot.
 * @param {*} inputWindowFunction Signal to be drawn.
 * @param {*} options Input options.
 * @returns Public APIs.
 */
let windowPlot = function (idNumber, inputWindowFunction, options = []) {

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
     * Window function g(x).
     */
    let windowFunction;

    /**
     * Signal function.
     */
    let signal;

    /**
     * Window function position on the time axis.
     */
    let windowPosition = 0.5;

    /**
     * Updates the plot.
     * @param {*} inputWindowFunction Window function g(x).
     * @param {*} options 
     */
    publicAPIs.updatePlot = function (inputWindowFunction, options) {
        windowFunction = inputWindowFunction;

        numPoints = toDefaultIfUndefined(options.numPoints, 100);
        yScale = toDefaultIfUndefined(options.yScale, 0.2);
        showSignal = typeof options.signal === 'undefined' ? false : true;

        if (showSignal) {
            signal = options.signal;
        }
    }

    // Creates the plot
    publicAPIs.updatePlot(inputWindowFunction, options);

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
     * Moves the position of the window function after mouse release.
     */
    plot.getCanvas().onmouseup = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left; //x position within the element.
        const y = e.clientY - rect.top;

        windowPosition = (x * dpi) / width;
        publicAPIs.drawPlot();
    }

    /**
     * Draws the plot.
     */
    publicAPIs.drawPlot = () => {
        // Clears the canvas
        ctx.clearRect(0, 0, width, height);

        // Draws the signal
        if (showSignal) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgb(0, 0, 0, .25)"
            ctx.beginPath();
            ctx.moveTo(0, height * 0.5);
            for (let i = 1; i < numPoints; i++) {
                ctx.lineTo(
                    i / numPoints * width,
                    height * (0.5 + yScale * signal.valueAt(i / numPoints)));
            }
            ctx.stroke();

            ctx.strokeStyle = "#000000"
            ctx.lineWidth = 1.25;

            ctx.beginPath();
            ctx.moveTo(0, height * 0.5);
            for (let i = 1; i < numPoints; i++) {
                ctx.lineTo(
                    i / numPoints * width,
                    height * (0.5 - yScale * windowFunction.valueAt(
                        i / numPoints - windowPosition,
                        signal.getTimeScale()
                    )
                        * signal.valueAt(i / numPoints))
                );
            }
            ctx.stroke();
        }

        // Draws the window

        ctx.strokeStyle = "#B01A00";
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(windowPosition * width, 0);
        ctx.lineTo(windowPosition * width, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.moveTo(0, height * 0.5);
        for (let i = 1; i < numPoints; i++) {
            ctx.lineTo(
                i / numPoints * width,
                height * (0.5 - 0.2 * windowFunction.valueAt(
                    i / numPoints - windowPosition,
                    signal.getTimeScale())
                )
            );
        }
        ctx.stroke();
    }

    publicAPIs.resizeCanvas();
    publicAPIs.drawPlot();

    // Returns public methods
    return publicAPIs;
}