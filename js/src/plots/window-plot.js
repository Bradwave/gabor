/**
 * Plot of the window function g(x).
 * @param {Number} idNumber Id of the signal plot.
 * @returns Public APIs.
 */
let windowPlot = function (idNumber) {

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
    let windowPositions = [0.5, 0.5];

    publicAPIs.resetWindowPositions = () => {
        windowPositions = [0.5, 0.5];
        publicAPIs.drawPlot();
    }

    /**
     * Updates the plot.
     * @param {*} inputWindowFunction Window function g(x).
     * @param {*} options 
     */
    publicAPIs.update = function (inputWindowFunction, options) {
        // Resizes canvas
        publicAPIs.resizeCanvas();

        // Updates window function
        windowFunction = inputWindowFunction;

        // Updates the second window if present
        useTwoWindows = toDefaultIfUndefined(options.useTwoWindows, false);
        if (useTwoWindows) windowFunction2 = toDefaultIfUndefined(options.window2,
            new gaussianWindow(1,
                { N: windowFunction.getNumPoints() }
            )
        );

        // Updates signal if present
        showSignal = typeof options.signal === 'undefined' ? false : true;
        if (showSignal) signal = options.signal;

        // Updates the number of sampled points
        if (typeof options.N === 'undefined') {
            // Updates when "N" is not specified
            numPoints = windowFunction.getNumPoints();
        } else {
            // Updates "N" when specified
            numPoints = options.N;
        }

        // Updates sampled window
        sampledWindow = windowFunction.getSampled(numPoints);
        // Updates second sampled window if present
        if (useTwoWindows) sampledWindow2 = windowFunction2.getSampled(numPoints);
        // Updates signal if present
        if (showSignal) sampledSignal = signal.getSampled(numPoints);

        // Sets the scale according to the amplitude
        yScale = showSignal ? toDefaultIfUndefined(options.yScale, 0.4 / signal.getAmp()) : 0.8;

        // Draws the plot
        publicAPIs.drawPlot();
    }

    /*_______________________________________
    |   HTML elements
    */

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
     * Moves the position of the window function after mouse release.
     */
    plot.getCanvas().onmouseup = (e) => {
        const rect = e.target.getBoundingClientRect();
        // x position within the element
        const x = e.clientX - rect.left;
        // Position in the signal
        const currentPosition = (x * dpi) / width;

        if (plotsManager.isWindowMovable(0)) windowPositions[0] = currentPosition;
        if (plotsManager.isWindowMovable(1) && useTwoWindows) windowPositions[1] = currentPosition;

        // Draws plot
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
            ctx.closePath();

            // Draws the second window if present
            if (useTwoWindows) {
                ctx.strokeStyle = "#06688c"
                ctx.lineWidth = 1.15;

                ctx.beginPath();
                ctx.moveTo(0, height * 0.5);
                for (let i = 1; i < numPoints; i++) {
                    const w = sampledWindow2[numPoints + i - Math.round(windowPositions[1] * numPoints)];
                    ctx.lineTo(
                        i / numPoints * width,
                        height * (0.5 - yScale * w * sampledSignal[i])
                    );
                }
                ctx.stroke();
                ctx.closePath();
            }

            ctx.strokeStyle = "#8c1500"
            ctx.lineWidth = 1.25;

            ctx.beginPath();
            ctx.moveTo(0, height * 0.5);
            for (let i = 1; i < numPoints; i++) {
                const w = sampledWindow[numPoints + i - Math.round(windowPositions[0] * numPoints)];
                ctx.lineTo(
                    i / numPoints * width,
                    height * (0.5 - yScale * w * sampledSignal[i])
                );
            }
            ctx.stroke();
            ctx.closePath();
        }

        // Draws the second window if present
        if (useTwoWindows) {
            ctx.strokeStyle = "#0c95c7";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(windowPositions[1] * width, 0);
            ctx.lineTo(windowPositions[1] * width, height);
            ctx.stroke();

            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(0, height * 0.5);
            for (let i = 1; i < numPoints; i++) {
                const w = sampledWindow2[numPoints + i - Math.round(windowPositions[1] * numPoints)];
                ctx.lineTo(
                    i / numPoints * width,
                    height * (0.5 - yScale * w)
                );
            }
            ctx.stroke();
            ctx.closePath();
        }

        // Draws the window

        ctx.strokeStyle = "#B01A00";
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(windowPositions[0] * width, 0);
        ctx.lineTo(windowPositions[0] * width, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.moveTo(0, height * 0.5);
        for (let i = 1; i < numPoints; i++) {
            const w = sampledWindow[numPoints + i - Math.round(windowPositions[0] * numPoints)];
            ctx.lineTo(
                i / numPoints * width,
                height * (0.5 - yScale * w)
            );
        }
        ctx.stroke();
        ctx.closePath();
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