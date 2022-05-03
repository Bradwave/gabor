/**
 * Plot of the Gabor transform.
 * @param {Number} idNumber Id of the transform plot.
 * @param {*} inputGaborTransform Transform manager.
 * @param {*} options Input options.
 * @returns Public APIs.
 */
let gaborPlot = function (idNumber, inputGaborTransform, options = []) {

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
     * Number of sampled points in the Gabor transform.
     */
    let numPoints;

    /**
     * Width of a plot cell.
     */
    let cellWidth;

    /**
     * Height of a plot cell.
     */
    let cellHeight;

    /**
     * Gabor transform structure.
     */
    let gaborTransform;

    /**
     * True if two windows are used, false otherwise.
     */
    let useTwoWindows;

    /**
     * Second transform.
     */
    let gaborTransform2;

    /**
     * Rate of sampled time points.
     */
    let timeRate

    /**
     * Rate of sampled frequency points.
     */
    let freqRate;

    /**
     * Updates the plot.
     * @param {*} inputSignal Signal function f(x).
     * @param {*} inputWindowFunction Window function g(x).
     * @param {*} options 
     */
    publicAPIs.updatePlot = (inputGaborTransform, options) => {
        // Sets the time and frequency sample rate
        timeRate = toDefaultIfUndefined(options.timeRate, 8);
        freqRate = toDefaultIfUndefined(options.freqRate, 12);

        // Sets the Gabor transform
        gaborTransform = inputGaborTransform;

        // Sets the Gabor transform if the second window is present
        useTwoWindows = toDefaultIfUndefined(options.useTwoWindows, false);
        if (useTwoWindows) {
            if (typeof options.window2 === 'undefined') {
                useTwoWindows = false;
            } else {
                gaborTransform2 = new transformManager(
                    gaborTransform.getSignal(), options.window2,
                    options
                );
            }
        }

        // Get number of points
        numPoints = gaborTransform.getNumPoints();
    }

    // Creates the plot
    publicAPIs.updatePlot(inputGaborTransform, options);

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

        cellWidth = width / numPoints;
        cellHeight = height / numPoints;
    }

    /**
     * Draws the plot.
     */
    publicAPIs.drawPlot = () => {
        // Clears the canvas
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < numPoints; i += timeRate) {
            for (let j = 0; j < numPoints; j += freqRate) {
                // Gabor transform
                const vgf = gaborTransform.gaborAt(i, j / freqRate);
                // Spectrogram
                let spectrogram = vgf.abs();

                // Adds second Gabor transform if present
                if (useTwoWindows) {
                    spectrogram *= gaborTransform2.gaborAt(i, j / freqRate).abs();
                }

                // Position of the cell
                const xPos = Math.round(i * cellWidth);
                const yPos = height - Math.round(j * cellHeight)
                // Grey value of the cell
                const alpha = - Math.exp(- spectrogram) + 1;

                // Draws the cell
                ctx.beginPath();
                ctx.fillStyle = "rgb("
                    + (255 - alpha * 255) + ", "
                    + (255 - alpha * 255) + ", "
                    + (255 - alpha * 255) + ")";
                ctx.rect(
                    xPos, yPos,
                    Math.round((i + timeRate) * cellWidth) - xPos,
                    height - Math.round((j + freqRate) * cellHeight) - yPos
                );
                ctx.fill();
                ctx.closePath();
            }
        }
    }

    publicAPIs.resizeCanvas();
    publicAPIs.drawPlot();

    // Returns public methods
    return publicAPIs;
}