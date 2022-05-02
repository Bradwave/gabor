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
     * Second window function.
     */
    let windowFunction2;

    /**
     * True if two windows are used, false otherwise.
     */
    let useTwoWindows;

    /**
     * Sampled window function.
     */
    let sampledWindow;

    /**
     * Sampled second window function.
     */
    let sampledWindow2

    /**
     * Signal function.
     */
    let signal;

    /**
     * Sampled signal function.
     */
    let sampledSignal;

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
        // Updates window function
        windowFunction = inputWindowFunction;

        // Updates the second window if present
        useTwoWindows = toDefaultIfUndefined(options.useTwoWindows, false);
        if (useTwoWindows) windowFunction2 = toDefaultIfUndefined(options.window2,
            new gaussianWindow(1,
                { N: windowFunction.getNumPoints(), timeScale: windowFunction.getTimeScale() }
            )
        );

        // Updates signal if present
        showSignal = typeof options.signal === 'undefined' ? false : true;
        if (showSignal) signal = options.signal;

        // Updates sampled window and signal
        if (typeof options.N === 'undefined') {
            // Updates when "N" is not specified
            numPoints = windowFunction.getNumPoints();
            // Updates sampled window
            sampledWindow = windowFunction.getSampled();
            // Updates second sampled window if present
            if (useTwoWindows) sampledWindow2 = windowFunction2.getSampled();
            // Updates signal if present
            if (showSignal) {
                if (signal.getNumPoints() !== numPoints) {
                    sampledSignal = signal.getSampled(numPoints)
                } else {
                    sampledSignal = signal.getSampled();
                }
            }
        } else {
            // Updates "N" when specified
            numPoints = options.N;
            // Updates sampled window
            sampledWindow = windowFunction.getSampled(numPoints);
            // Updates second sampled window if present
            if (useTwoWindows) sampledWindow2 = windowFunction2.getSampled(numPoints)
            // Updates signal if present
            if (showSignal) sampledSignal = signal.getSampled(numPoints);
        }

        // Sets the scale according to the amplitude
        yScale = showSignal ? toDefaultIfUndefined(options.yScale, 0.4 / signal.getAmp()) : 0.8;
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
                    height - height * (0.5 + yScale * sampledSignal[i]));
            }
            ctx.stroke();

            // Draws the second window if present
            if (useTwoWindows) {
                ctx.strokeStyle = "#06688c"
                ctx.lineWidth = 1.15;

                ctx.beginPath();
                ctx.moveTo(0, height * 0.5);
                for (let i = 1; i < numPoints; i++) {
                    const w = sampledWindow2[numPoints + i - Math.round(windowPosition * numPoints)];
                    ctx.lineTo(
                        i / numPoints * width,
                        height * (0.5 - yScale * w * sampledSignal[i])
                    );
                }
                ctx.stroke();
            }

            ctx.strokeStyle = "#8c1500"
            ctx.lineWidth = 1.25;

            ctx.beginPath();
            ctx.moveTo(0, height * 0.5);
            for (let i = 1; i < numPoints; i++) {
                const w = sampledWindow[numPoints + i - Math.round(windowPosition * numPoints)];
                ctx.lineTo(
                    i / numPoints * width,
                    height * (0.5 - yScale * w * sampledSignal[i])
                );
            }
            ctx.stroke();
        }

        // Draws the second window if present
        if (useTwoWindows) {
            ctx.strokeStyle = "#0c95c7";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(0, height * 0.5);
            for (let i = 1; i < numPoints; i++) {
                const w = sampledWindow2[numPoints + i - Math.round(windowPosition * numPoints)];
                ctx.lineTo(
                    i / numPoints * width,
                    height * (0.5 - yScale * w)
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
            const w = sampledWindow[numPoints + i - Math.round(windowPosition * numPoints)];
            ctx.lineTo(
                i / numPoints * width,
                height * (0.5 - yScale * w)
            );
        }
        ctx.stroke();
    }

    publicAPIs.resizeCanvas();
    publicAPIs.drawPlot();

    // Returns public methods
    return publicAPIs;
}